'use client';

import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      title: "AI-Powered Scheduling",
      description: "Leverage RAG technology for intelligent schedule generation that learns and adapts to your patterns.",
      icon: "🧠",
      highlights: [
        "Context-aware scheduling",
        "Work-life balance optimization",
        "Adaptive time management"
      ]
    },
    {
      title: "Multi-Channel Notifications",
      description: "Stay connected and updated through your preferred communication channels.",
      icon: "📱",
      highlights: [
        "Email integration",
        "Telegram alerts",
      ]
    },
    {
      title: "Advanced Personalization",
      description: "Experience scheduling that truly understands your lifestyle and preferences.",
      icon: "🎯",
      highlights: [
        "Professional schedule integration",
        "Hobby incorporation",
        "Sleep pattern recognition",
        "Work hours optimization"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="features" className="w-full py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Features for Modern Life
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of AI-driven scheduling that adapts to your lifestyle and keeps you connected across all channels.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;