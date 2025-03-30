'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProgress from './components/OnboardingProgress';
import ProfessionStep from './components/ProfessionStep';
import HobbiesStep from './components/HobbiesStep';
import SleepTimeStep from './components/SleepTimeStep';
import WorkTimeStep from './components/WorkTimeStep';
import { createOnboarding , OnboardingInput } from '@/api/lib';

const OnboardingPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  type FormField = keyof OnboardingInput;
  type FormValue = OnboardingInput[FormField];
  const [formData, setFormData] = useState<OnboardingInput>({
    profession: '',
    hobbies: [],
    sleepingHours: 0,
    sleepingStart: new Date().toISOString(),
    sleepingEnd: new Date().toISOString(),
    workingHours: 0,
    workingStart: new Date().toISOString(),
    workingEnd: new Date().toISOString(),
    userId: 'user-id-placeholder', // Replace with actual user ID
  });

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        console.log(formData, "This is form data");
        // Save onboarding data
        const onboarding = await createOnboarding(formData); // Replace 'your-auth-token' with actual token retrieval logic

        if (onboarding) {
          // Set onboarding completion cookie
          document.cookie = 'onboardingComplete=true; path=/';
          router.replace('/');
          window.location.reload();
        } else {
          console.error('Failed to save onboarding data');
        }
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFormData = (field: string, value: FormValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(formData,"lets see whether the form data updated or not...")
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <header className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800">SchedSync</h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <OnboardingProgress currentStep={currentStep} totalSteps={4} />

          {/* Content Container */}
          <div className="mt-8 bg-white rounded-xl p-6 sm:p-8">
            <div className="space-y-6">
              {/* Step Content */}
              {currentStep === 1 && (
                <ProfessionStep 
                  value={formData.profession}
                  onChange={(value) => updateFormData('profession', value)}
                />
              )}
              {currentStep === 2 && (
                <HobbiesStep 
                  value={formData.hobbies}
                  onChange={(value) => updateFormData('hobbies', value)}
                />
              )}
              {currentStep === 3 && (
                <SleepTimeStep 
                  value={{
                    sleepingHours: formData.sleepingHours,
                    sleepingStart: formData.sleepingStart,
                    sleepingEnd: formData.sleepingEnd
                  }}
                  onChange={(value) => {
                    updateFormData('sleepingHours', value.sleepingHours);
                    updateFormData('sleepingStart', value.sleepingStart);
                    updateFormData('sleepingEnd', value.sleepingEnd);
                  }}
                />
              )}
              {currentStep === 4 && (
                <WorkTimeStep 
                  value={{
                    workingHours: formData.workingHours,
                    workingStart: formData.workingStart,
                    workingEnd: formData.workingEnd
                  }}
                  onChange={(value) => {
                    updateFormData('workingHours', value.workingHours);
                    updateFormData('workingStart', value.workingStart);
                    updateFormData('workingEnd', value.workingEnd);
                  }}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 
                    ${currentStep === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                  disabled={currentStep === 1}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-full
                    hover:bg-green-600 transition-all duration-200"
                >
                  {currentStep === 4 ? 'Finish' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;