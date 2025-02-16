'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content: 'AI Secretary has transformed how I manage my daily tasks. The smart scheduling feature alone has saved me countless hours.',
    image: '/assets/Working Productively.png',
  },
  {
    name: 'Michael Chen',
    role: 'Entrepreneur',
    content: 'As a busy entrepreneur, having an AI secretary has been game-changing. It\'s like having a personal assistant available 24/7.',
    image: '/assets/Multitasking.png',
  },
  {
    name: 'Emma Williams',
    role: 'Product Manager',
    content: 'The email management and task prioritization features are incredible. I can\'t imagine going back to my old way of working.',
    image: '/assets/Deadline.png',
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of satisfied professionals using AI Secretary
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: index === activeIndex ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className={`w-full flex-shrink-0 ${
                  index === activeIndex ? 'block' : 'hidden'
                }`}
              >
                <div className="max-w-3xl mx-auto text-center">
                  <div className="w-24 h-24 mx-auto mb-8 relative">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <p className="text-xl text-gray-600 mb-8">
                    "{testimonial.content}"
                  </p>
                  <div className="font-medium">
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-blue-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 