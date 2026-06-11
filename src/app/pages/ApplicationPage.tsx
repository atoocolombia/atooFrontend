import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ApplicationHeader } from '../components/application/ApplicationHeader';
import { DataAuthorizationStep } from '../components/application/DataAuthorizationStep';
import { IdentityDocumentsStep } from '../components/application/IdentityDocumentsStep';
import { BackgroundCheckMessage } from '../components/application/BackgroundCheckMessage';
import { ResidenceAndAppsStep } from '../components/application/ResidenceAndAppsStep';
import { BankingDocumentsStep } from '../components/application/BankingDocumentsStep';
import { FinalValidationMessage } from '../components/application/FinalValidationMessage';
import { Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ApplicationPage() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showBackgroundCheck, setShowBackgroundCheck] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const navigate = useNavigate();

  // Definición de pasos para la barra de progreso
  const steps = [
    { id: 0, title: 'Paso 1', label: 'Autorización de Datos' },
    { id: 1, title: 'Paso 2', label: 'Documentos de Identidad' },
    { id: 2, title: 'Paso 3', label: 'Domicilio y Experiencia' },
    { id: 3, title: 'Paso 4', label: 'Información Bancaria' },
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      // Después del paso 2 (documentos de identidad), mostrar mensaje de validación
      setShowBackgroundCheck(true);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Después del último paso, mostrar mensaje final
      setShowFinalMessage(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowBackgroundCheck(false);
    }
  };

  const handleContinueAfterBackgroundCheck = () => {
    setShowBackgroundCheck(false);
    setCurrentStep(2); // Continuar al paso 3
  };

  // Calcular el paso actual para la barra de progreso
  const getProgressStep = () => {
    if (showFinalMessage) return steps.length;
    if (showBackgroundCheck) return currentStep;
    return currentStep;
  };

  return (
    <div className={`min-h-screen transition-colors ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
      <ApplicationHeader onBack={() => navigate('/')} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
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
                            index === getProgressStep() ? 'text-white' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
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
                            ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                            : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
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

        {/* Step Content */}
        <div className={`rounded-2xl shadow-lg p-8 transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E] border border-blue-600/20'
            : 'bg-white'
        }`}>
          {showFinalMessage ? (
            <FinalValidationMessage />
          ) : showBackgroundCheck ? (
            <BackgroundCheckMessage onContinue={handleContinueAfterBackgroundCheck} />
          ) : (
            <>
              {currentStep === 0 && (
                <DataAuthorizationStep onNext={handleNext} />
              )}
              {currentStep === 1 && (
                <IdentityDocumentsStep
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 2 && (
                <ResidenceAndAppsStep
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <BankingDocumentsStep
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
