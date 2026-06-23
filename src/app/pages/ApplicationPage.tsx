import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApplicationHeader } from '../components/application/ApplicationHeader';
import { DataAuthorizationStep } from '../components/application/DataAuthorizationStep';
import { IdentityDocumentsStep } from '../components/application/IdentityDocumentsStep';
import { BackgroundCheckMessage } from '../components/application/BackgroundCheckMessage';
import { ResidenceAndAppsStep } from '../components/application/ResidenceAndAppsStep';
import { BankingDocumentsStep } from '../components/application/BankingDocumentsStep';
import { FinalValidationMessage } from '../components/application/FinalValidationMessage';
import { Check, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import {
  DEFAULT_APPLICATION_PROGRESS,
  inferProgressFromDocuments,
  loadApplicationProgress,
  saveApplicationProgress,
  markApplicationCompleted,
  type ApplicationProgress,
} from '../../lib/applicationProgress';
import { getSessionUser, setAuthRedirect } from '../../lib/authRouting';
import { listUserDocuments, type UserDocumentMeta } from '../../lib/documentsApi';

export function ApplicationPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const authPrompted = useRef(false);

  const [user] = useState(() => getSessionUser());
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, UserDocumentMeta>>({});
  const [progress, setProgress] = useState<ApplicationProgress>(DEFAULT_APPLICATION_PROGRESS);

  const { currentStep, showBackgroundCheck, showFinalMessage } = progress;

  useEffect(() => {
    if (user || authPrompted.current) return;
    authPrompted.current = true;
    setAuthRedirect('/solicitud');
    openLogin();
  }, [user, openLogin]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const docs = await listUserDocuments(user.id);
        if (cancelled) return;

        const byKind = Object.fromEntries(docs.map((d) => [d.documentKind, d]));
        const saved = loadApplicationProgress(user.id);
        const inferred = inferProgressFromDocuments(
          docs.map((d) => d.documentKind),
          saved?.step0Completed,
        );

        const initial: ApplicationProgress = saved
          ? saved
          : {
              ...DEFAULT_APPLICATION_PROGRESS,
              currentStep: inferred.currentStep,
              step0Completed: inferred.step0Completed,
            };

        setDocuments(byKind);
        setProgress(initial);
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
  }, [user]);

  useEffect(() => {
    if (!user || !ready) return;
    saveApplicationProgress(user.id, progress);
  }, [user, progress, ready]);

  const handleDocumentUploaded = (doc: UserDocumentMeta) => {
    setDocuments((prev) => ({ ...prev, [doc.documentKind]: doc }));
  };

  const steps = [
    { id: 0, title: 'Paso 1', label: 'Autorización de Datos' },
    { id: 1, title: 'Paso 2', label: 'Documentos de Identidad' },
    { id: 2, title: 'Paso 3', label: 'Domicilio y Experiencia' },
    { id: 3, title: 'Paso 4', label: 'Información Bancaria' },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      setProgress((p) => ({
        ...p,
        step0Completed: true,
        currentStep: 1,
      }));
    } else if (currentStep === 1) {
      setProgress((p) => ({ ...p, showBackgroundCheck: true }));
    } else if (currentStep < steps.length - 1) {
      setProgress((p) => ({ ...p, currentStep: p.currentStep + 1 }));
    } else {
      setProgress((p) => ({ ...p, showFinalMessage: true }));
      if (user) markApplicationCompleted(user.id);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setProgress((p) => ({
        ...p,
        currentStep: p.currentStep - 1,
        showBackgroundCheck: false,
      }));
    }
  };

  const handleContinueAfterBackgroundCheck = () => {
    setProgress((p) => ({
      ...p,
      showBackgroundCheck: false,
      currentStep: 2,
    }));
  };

  const getProgressStep = () => {
    if (showFinalMessage) return steps.length;
    if (showBackgroundCheck) return currentStep;
    return currentStep;
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl p-8 text-center shadow-lg ${theme === 'dark' ? 'bg-[#0D0F2E] border border-blue-600/20' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Continúa tu solicitud
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Inicia sesión para retomar el paso donde te quedaste.
          </p>
          <button
            type="button"
            onClick={() => {
              setAuthRedirect('/solicitud');
              openLogin();
            }}
            className="px-6 py-3 bg-[#1A1FE8] text-white rounded-lg font-semibold hover:bg-[#1217C8] transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
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
          ) : showBackgroundCheck ? (
            <BackgroundCheckMessage onContinue={handleContinueAfterBackgroundCheck} />
          ) : (
            <>
              {currentStep === 0 && <DataAuthorizationStep onNext={handleNext} />}
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
