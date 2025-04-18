'use client';

import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      title: "Connect Your Calendar",
      description: "Seamlessly integrate your existing calendars and communication channels.",
      icon: "🔄"
    },
    {
      title: "Set Your Preferences",
      description: "Tell us about your work hours, hobbies, and lifestyle preferences.",
      icon: "⚙️"
    },
    {
      title: "AI Analysis",
      description: "Our AI analyzes your patterns and optimizes your schedule using RAG technology.",
      icon: "🤖"
    },
    {
      title: "Smart Scheduling",
      description: "Receive intelligently generated schedules that adapt to your lifestyle.",
      icon: "📅"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How SchedSync Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience seamless schedule management in four simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 -translate-y-1/2 hidden lg:block" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 