const OnboardingProgress = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 flex rounded-full bg-gray-200">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="transition-all duration-500 ease-in-out bg-green-500"
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute -top-2 w-full flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${index + 1 <= currentStep 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : 'border-gray-300 bg-white text-gray-500'
                } transition-all duration-500`}
            >
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Labels */}
      <div className="mt-6 flex justify-between text-sm">
        <span className={currentStep >= 1 ? 'text-green-500' : 'text-gray-500'}>Profession</span>
        <span className={currentStep >= 2 ? 'text-green-500' : 'text-gray-500'}>Hobbies</span>
        <span className={currentStep >= 3 ? 'text-green-500' : 'text-gray-500'}>Sleep Time</span>
        <span className={currentStep >= 4 ? 'text-green-500' : 'text-gray-500'}>Working Hours</span>
      </div>
    </div>
  );
};

export default OnboardingProgress; 