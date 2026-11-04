import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApplicationHeader } from '../components/application/ApplicationHeader';
import { DataAuthorizationStep } from '../components/application/DataAuthorizationStep';
import { IdentityDocumentsStep } from '../components/application/IdentityDocumentsStep';
import { ResidenceAndAppsStep } from '../components/application/ResidenceAndAppsStep';
import { BankingDocumentsStep } from '../components/application/BankingDocumentsStep';
import { KnowledgeTestsStep } from '../components/application/KnowledgeTestsStep';
import { fetchApplicationKnowledgeTest } from '../../lib/applicationKnowledgeTestApi';
import { FinalValidationMessage } from '../components/application/FinalValidationMessage';
import { Check, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  DEFAULT_APPLICATION_PROGRESS,
  inferProgressFromDocuments,
  loadApplicationProgress,
  saveApplicationProgress,
  markApplicationCompleted,
  type ApplicationProgress,
} from '../../lib/applicationProgress';
import { getSessionUser } from '../../lib/authRouting';
import { submitUserApplication } from '../../lib/deliveriesApi';
import { listUserDocuments, type UserDocumentMeta } from '../../lib/documentsApi';

export function ApplicationPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const user = getSessionUser();
  const userId = user?.id ?? '';

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, UserDocumentMeta>>({});
  const [progress, setProgress] = useState<ApplicationProgress>(DEFAULT_APPLICATION_PROGRESS);

  const { currentStep, showFinalMessage } = progress;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setReady(false);

    (async () => {
      try {
        const docs = await listUserDocuments(userId);
        if (cancelled) return;

        const byKind = Object.fromEntries(docs.map((d) => [d.documentKind, d]));
        const saved = loadApplicationProgress(userId);
        const authValidated =
          byKind.dataTreatmentSigned?.validationStatus === 'VALIDATED';
        const inferred = inferProgressFromDocuments(
          docs.map((d) => d.documentKind),
          saved?.step0Completed || authValidated,
        );

        let initial: ApplicationProgress = saved
          ? saved
          : {
              ...DEFAULT_APPLICATION_PROGRESS,
              currentStep: inferred.currentStep,
              step0Completed: inferred.step0Completed,
            };

        if (authValidated) {
          initial = {
            ...initial,
            step0Completed: true,
            currentStep: initial.currentStep < 1 ? 1 : initial.currentStep,
          };
        }

        setDocuments(byKind);

        let adjusted = initial;
        try {
          const test = await fetchApplicationKnowledgeTest(userId);
          const hasBanking = docs.some((d) => d.documentKind === 'bankDocument' || d.documentKind === 'creditReport');
          if (hasBanking && test.completed) {
            adjusted = { ...adjusted, currentStep: Math.max(adjusted.currentStep, 4) };
          } else if (test.completed) {
            adjusted = { ...adjusted, currentStep: Math.max(adjusted.currentStep, 3) };
          } else if (hasBanking || adjusted.currentStep > 3) {
            adjusted = { ...adjusted, currentStep: 3 };
          }
        } catch {
          /* tests API optional for infer */
        }

        if (adjusted.showBackgroundCheck) {
          adjusted = {
            ...adjusted,
            showBackgroundCheck: false,
            currentStep: Math.max(adjusted.currentStep, 2),
          };
        }

        setProgress(adjusted);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError('No pudimos cargar tu progreso. Recarga la página e inténtalo de nuevo.');
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !ready) return;
    saveApplicationProgress(userId, progress);
  }, [userId, progress, ready]);

  const handleDocumentUploaded = (doc: UserDocumentMeta) => {
    setDocuments((prev) => ({ ...prev, [doc.documentKind]: doc }));
    if (doc.documentKind === 'dataTreatmentSigned' && doc.validationStatus === 'VALIDATED') {
      setProgress((p) => ({ ...p, step0Completed: true }));
    }
  };

  const steps = [
    { id: 0, title: 'Paso 1', label: 'Autorización de Datos' },
    { id: 1, title: 'Paso 2', label: 'Documentos de Identidad' },
    { id: 2, title: 'Paso 3', label: 'Domicilio y Experiencia' },
    { id: 3, title: 'Paso 4', label: 'Evaluaciones' },
    { id: 4, title: 'Paso 5', label: 'Información Bancaria' },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      setProgress((p) => ({
        ...p,
        step0Completed: true,
        currentStep: 1,
      }));
    } else if (currentStep < steps.length - 1) {
      setProgress((p) => ({ ...p, currentStep: p.currentStep + 1 }));
    } else {
      setProgress((p) => ({ ...p, showFinalMessage: true }));
      if (userId) {
        markApplicationCompleted(userId);
        void submitUserApplication(userId).catch(() => {
          /* localStorage ya marca completado; reintento en siguiente visita si falla red */
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setProgress((p) => ({
        ...p,
        currentStep: p.currentStep - 1,
      }));
    }
  };

  const getProgressStep = () => {
    if (showFinalMessage) return steps.length;
    return currentStep;
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
        <p className="text-gray-500 text-center px-4">Inicia sesión para continuar tu solicitud.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
        <Loader2 className="w-10 h-10 text-[#1A1FE8] animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
        <p className="text-red-500 text-center">{loadError}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
      <ApplicationHeader onBack={() => navigate('/')} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showFinalMessage && (
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        index < getProgressStep()
                          ? 'bg-green-500 border-green-500'
                          : index === getProgressStep()
                            ? 'bg-[#1A1FE8] border-[#1A1FE8] shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                            : theme === 'dark'
                              ? 'bg-white/5 border-blue-600/30'
                              : 'bg-white border-gray-300'
                      }`}
                    >
                      {index < getProgressStep() ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <span
                          className={`text-lg font-semibold ${
                            index === getProgressStep()
                              ? 'text-white'
                              : theme === 'dark'
                                ? 'text-gray-500'
                                : 'text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`text-sm font-medium ${
                          index <= getProgressStep()
                            ? theme === 'dark'
                              ? 'text-white'
                              : 'text-gray-900'
                            : theme === 'dark'
                              ? 'text-gray-500'
                              : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className={`text-xs hidden sm:block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 transition-all ${
                        index < getProgressStep()
                          ? 'bg-green-500'
                          : theme === 'dark'
                            ? 'bg-blue-600/30'
                            : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl shadow-lg p-8 transition-colors ${
            theme === 'dark' ? 'bg-[#0D0F2E] border border-blue-600/20' : 'bg-white'
          }`}
        >
          {showFinalMessage ? (
            <FinalValidationMessage />
          ) : (
            <>
              {currentStep === 0 && (
                <DataAuthorizationStep
                  userId={user.id}
                  documents={documents}
                  onDocumentUploaded={handleDocumentUploaded}
                  onNext={handleNext}
                />
              )}
              {currentStep === 1 && (
                <IdentityDocumentsStep
                  userId={user.id}
                  documents={documents}
                  onDocumentUploaded={handleDocumentUploaded}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 2 && (
                <ResidenceAndAppsStep
                  userId={user.id}
                  documents={documents}
                  onDocumentUploaded={handleDocumentUploaded}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <KnowledgeTestsStep userId={user.id} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 4 && (
                <BankingDocumentsStep
                  userId={user.id}
                  documents={documents}
                  onDocumentUploaded={handleDocumentUploaded}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
