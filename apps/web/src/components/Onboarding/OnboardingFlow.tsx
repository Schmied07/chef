/**
 * Onboarding Flow Component
 * Sprint 5.4 - Interactive tutorials and onboarding
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RocketIcon, LightningBoltIcon, CodeIcon, CheckIcon } from '@radix-ui/react-icons';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TETRISNEWS AICODE! 🚀',
    description: 'Build full-stack web apps with AI assistance. Let\'s get you started in just a few steps.',
    icon: <RocketIcon className="w-12 h-12" />,
  },
  {
    id: 'templates',
    title: 'Choose a Template',
    description: 'Start with a pre-configured template: React + Convex, React + Supabase, React + Node.js, and more.',
    icon: <CodeIcon className="w-12 h-12" />,
    action: 'Browse Templates',
  },
  {
    id: 'features',
    title: 'AI-Powered Building',
    description: 'Use natural language to describe what you want to build. TETRISNEWS AICODE will generate the code for you.',
    icon: <LightningBoltIcon className="w-12 h-12" />,
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press Cmd/Ctrl+K to open command palette. Use Cmd/Ctrl+S to save, and more!',
    icon: <CheckIcon className="w-12 h-12" />,
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="onboarding-flow"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6 text-blue-500">
                {step.icon}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {step.description}
              </p>

              {/* Step Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentStep ? 1 : -1);
                      setCurrentStep(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    data-testid={`step-dot-${index}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-12 pb-8 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition"
            data-testid="skip-onboarding"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                data-testid="prev-step"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              data-testid="next-step"
            >
              {isLastStep ? 'Get Started' : step.action || 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
