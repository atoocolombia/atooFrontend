import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchApplicationKnowledgeTest,
  submitApplicationKnowledgeTest,
  type ApplicationKnowledgeTestState,
} from '../../../lib/applicationKnowledgeTestApi';

interface KnowledgeTestsStepProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

export function KnowledgeTestsStep({ userId, onNext, onBack }: KnowledgeTestsStepProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ApplicationKnowledgeTestState | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchApplicationKnowledgeTest(userId);
        if (cancelled) return;
        setState(data);
        setError(null);
      } catch {
        if (!cancelled) setError('No pudimos cargar las evaluaciones. Recarga e inténtalo de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const allQuestionIds = useMemo(() => {
    if (!state) return [];
    return state.sections.flatMap((s) => s.questions.map((q) => q.id));
  }, [state]);

  const allAnswered = allQuestionIds.length > 0 && allQuestionIds.every((id) => answers[id] !== undefined);
  const alreadyCompleted = state?.completed === true;

  const handleContinue = async () => {
    if (alreadyCompleted) {
      onNext();
      return;
    }
    if (!allAnswered) {
      setError('Responde todas las preguntas antes de continuar.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitApplicationKnowledgeTest(userId, answers);
      onNext();
    } catch {
      setError('No pudimos guardar tus respuestas. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-10 h-10 text-[#1A1FE8] animate-spin" />
      </div>
    );
  }

  if (!state) {
    return <p className="text-center text-red-500">{error ?? 'Error al cargar.'}</p>;
  }

  if (alreadyCompleted) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4">
            <BookOpen className="w-8 h-8 text-[#1A1FE8]" />
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Evaluaciones teóricas
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Ya registramos tus respuestas. Puedes continuar con tu solicitud.
          </p>
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 rounded-lg font-semibold bg-[#1A1FE8] text-white hover:bg-[#1217C8]"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4">
          <BookOpen className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Evaluaciones teóricas
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Responde con calma todas las preguntas y luego continúa con el siguiente paso.
        </p>
      </div>

      {state.sections.map((section) => (
        <div
          key={section.id}
          className={`rounded-xl border p-6 ${
            theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {section.title}
          </h3>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {section.description}
          </p>
          <div className="space-y-5">
            {section.questions.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  {qi + 1}. {q.text}
                </legend>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border ${
                        answers[q.id] === oi
                          ? 'border-[#1A1FE8] bg-[#1A1FE8]/10'
                          : theme === 'dark'
                            ? 'border-gray-700'
                            : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        disabled={submitting}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        className="mt-1"
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            theme === 'dark'
              ? 'bg-white/5 text-gray-300 hover:bg-white/10'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Volver
        </button>
        <button
          type="button"
          disabled={submitting || !allAnswered}
          onClick={() => void handleContinue()}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            allAnswered && !submitting
              ? 'bg-[#1A1FE8] text-white hover:bg-[#1217C8]'
              : 'bg-gray-500/40 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
