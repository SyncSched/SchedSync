'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Automatically organize your calendar and set up meetings with AI-powered scheduling.',
    image: '/assets/Deadline.png',
  },
  {
    title: 'Task Management',
    description: 'Keep track of your to-dos and get intelligent suggestions for task prioritization.',
    image: '/assets/Multitasking.png',
  },
  {
    title: 'Email Assistant',
    description: 'Draft, review, and manage emails with AI-powered writing assistance.',
    image: '/assets/Working Productively.png',
  },
  {
    title: 'Document Organization',
    description: 'Automatically categorize and manage your documents with smart filing system.',
    image: '/assets/Multitasking.png',
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Powerful Features for Your Daily Tasks
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Everything you need to stay organized and productive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-40 mb-4 relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 