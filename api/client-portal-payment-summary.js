import jwt from 'jsonwebtoken';
import pg from 'pg';

const { Client } = pg;

const DEMO_EMAIL = 'cliente@gmail.com';
const DEMO_CUOTA = 700_000;
const DEMO_CUOTAS = 26;

function readToken(req) {
  const header = req.headers.authorization ?? '';
  const bearer = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (bearer?.[1]) return bearer[1].trim();
  const cookie = req.headers.cookie ?? '';
  const match = /(?:^|;\s*)atoo_token=([^;]+)/.exec(cookie);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function jwtSecret() {
  return process.env.JWT_SECRET?.trim() || 'atoo-dev-jwt-secret-change-me';
}

function normalizeDoc(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function paymentMethodLabel(method) {
  if (!method) return 'Pago registrado';
  const labels = {
    transferencia: 'Transferencia bancaria',
    consignacion: 'Consignación',
    pse: 'PSE',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    efectivo: 'Efectivo',
    otro: 'Otro',
  };
  return labels[method] ?? method;
}

function buildSummary({ payments, email, weeklyPaymentCop, planInstallments, installmentPlan }) {
  const installmentsPaid = installmentPlan ? payments.length : 0;
  const totalPaidCop = payments.reduce((sum, p) => sum + p.amountCop, 0);
  const progressPercent =
    planInstallments > 0 ? Math.min(100, Math.round((installmentsPaid / planInstallments) * 100)) : 0;
  const remainingInstallments = Math.max(0, planInstallments - installmentsPaid);
  const lastPayment = payments[0] ?? null;
  const nextPaymentDueAt =
    lastPayment && installmentsPaid < planInstallments
      ? new Date(new Date(lastPayment.paidAt).getTime() + 30 * 86400000).toISOString()
      : null;

  const history = payments.map((row) => ({
    id: row.id,
    amountCop: row.amountCop,
    paidAt: new Date(row.paidAt).toISOString(),
    paymentMethod: row.paymentMethod,
    paymentMethodLabel: paymentMethodLabel(row.paymentMethod),
    kind: installmentPlan ? 'weekly' : 'other',
  }));

  return {
    weeklyPaymentCop,
    planWeeks: planInstallments,
    totalPaidCop,
    paymentsCount: payments.length,
    weeksRecognized: installmentsPaid,
    progressPercent,
    remainingWeeks: remainingInstallments,
    lastPaidAt: lastPayment ? new Date(lastPayment.paidAt).toISOString() : null,
    nextPaymentDueAt,
    paymentStatus: 'current',
    depositPaid: false,
    depositPaidAt: null,
    depositAmountCop: null,
    history,
    installmentPlan,
    installmentsPaid,
    planInstallments,
    remainingInstallments,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const token = readToken(req);
  if (!token) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar' });
    return;
  }

  let userId;
  try {
    const payload = jwt.verify(token, jwtSecret());
    userId = typeof payload.sub === 'string' ? payload.sub : '';
    if (!userId) throw new Error('invalid sub');
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
    return;
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    res.status(503).json({
      error:
        'Plataforma: falta DATABASE_URL en Vercel (copia la URL pública de Postgres desde Railway).',
    });
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const userRes = await client.query(
      `SELECT u.email, e."idDocumentNumber"
       FROM "User" u
       LEFT JOIN "UserIdentityExtraction" e ON e."userId" = u.id
       WHERE u.id = $1`,
      [userId],
    );
    const email = (userRes.rows[0]?.email ?? '').trim();
    const idDoc = normalizeDoc(userRes.rows[0]?.idDocumentNumber ?? '');

    let payments = [];
    try {
      if (idDoc.length >= 5) {
        await client.query(
          `UPDATE "ClientPayment" SET "userId" = $1 WHERE "userId" IS NULL AND "idDocumentNumber" = $2`,
          [userId, idDoc],
        );
      }
      const payRes = await client.query(
        `SELECT id, "amountCop", "paidAt", "paymentMethod"
         FROM "ClientPayment"
         WHERE "userId" = $1
            OR ($2 <> '' AND "idDocumentNumber" = $2)
         ORDER BY "paidAt" DESC`,
        [userId, idDoc],
      );
      payments = payRes.rows;
    } catch (dbErr) {
      if (dbErr?.code !== '42P01') throw dbErr;
    }

    let installmentPlan = false;
    let weeklyPaymentCop = 207_000;
    let planInstallments = 260;

    if (email.toLowerCase() === DEMO_EMAIL) {
      installmentPlan = true;
      weeklyPaymentCop = DEMO_CUOTA;
      planInstallments = DEMO_CUOTAS;
    }

    try {
      const planRes = await client.query(
        `SELECT "installmentAmountCop", "installmentCount" FROM "ClientVehiclePlan" WHERE "userId" = $1`,
        [userId],
      );
      const row = planRes.rows[0];
      if (row?.installmentAmountCop > 0 && row?.installmentCount > 0) {
        installmentPlan = true;
        weeklyPaymentCop = row.installmentAmountCop;
        planInstallments = row.installmentCount;
      }
    } catch {
      // columnas del plan aún no migradas
    }

    const summary = buildSummary({
      payments,
      email,
      weeklyPaymentCop,
      planInstallments,
      installmentPlan,
    });

    res.status(200).json({ summary });
  } catch (err) {
    console.error('[client-portal-payment-summary]', err);
    res.status(500).json({ error: 'Tuvimos un problema al leer tus pagos. Inténtalo de nuevo.' });
  } finally {
    await client.end().catch(() => {});
  }
}
