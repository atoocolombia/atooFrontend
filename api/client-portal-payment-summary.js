import pg from 'pg';

const { Client } = pg;

const RAILWAY_API =
  process.env.ATOO_BACKEND_URL?.trim() ||
  'https://atoobackend-production.up.railway.app';

const DEMO_EMAIL = 'cliente@gmail.com';
const DEMO_ID_DOCUMENT = '1012345678';
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

function noStore(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
}

async function resolveUserIdFromBackend(req) {
  const header = req.headers.authorization ?? '';
  const cookie = req.headers.cookie ?? '';
  const upstream = await fetch(`${RAILWAY_API}/api/v1/auth/me`, {
    headers: {
      ...(header ? { authorization: header } : {}),
      ...(cookie ? { cookie } : {}),
    },
  });
  if (!upstream.ok) return null;
  const body = await upstream.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  return id || null;
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
  noStore(res);

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  if (!readToken(req) && !(req.headers.cookie ?? '').includes('atoo_token=')) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar' });
    return;
  }

  const userId = await resolveUserIdFromBackend(req);
  if (!userId) {
    res.status(401).json({ error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
    return;
  }

  const authForward = {
    ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}),
    ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
  };

  const backendSummaryPaths = [
    `/api/v1/users/${encodeURIComponent(userId)}/payment-summary`,
    '/api/v1/auth/me/payment-summary',
    '/api/v1/client/payments/summary',
    '/api/v1/auth/me?includePayments=1',
  ];

  for (const path of backendSummaryPaths) {
    try {
      const upstream = await fetch(`${RAILWAY_API}${path}`, { headers: authForward });
      if (upstream.status === 404) continue;
      if (!upstream.ok) continue;
      const body = await upstream.json().catch(() => null);
      const summary = body?.summary ?? body?.paymentSummary;
      if (summary) {
        res.status(200).json({ summary });
        return;
      }
    } catch {
      // siguiente fallback
    }
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
    let idDoc = normalizeDoc(userRes.rows[0]?.idDocumentNumber ?? '');
    if (idDoc.length < 5 && email.toLowerCase() === DEMO_EMAIL) {
      idDoc = DEMO_ID_DOCUMENT;
    }

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
