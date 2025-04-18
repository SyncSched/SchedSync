'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Startup Founder",
      image: "/avatars/avatar1.jpg",
      quote: "SchedSync has transformed how I manage my time. The AI-powered scheduling is like having a personal assistant who knows my preferences perfectly."
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      image: "/avatars/avatar2.jpg",
      quote: "The multi-channel notifications ensure I never miss important meetings. The work-life balance optimization has made a real difference in my productivity."
    },
    {
      name: "Emma Davis",
      role: "Freelance Designer",
      image: "/avatars/avatar3.jpg",
      quote: "As a freelancer, managing multiple projects was challenging. SchedSync's intelligent scheduling has made it effortless to balance client work and personal time."
    }
  ];

  return (
    <section className="w-full py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied users who have transformed their time management with SchedSync
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Background Card */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl transform rotate-1 opacity-5" />
              
              {/* Content Card */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-blue-100">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                {/* Decorative Quote Mark */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transform rotate-12">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.417 6.679C15.447 7.773 16 9.125 16 10.735c0 3.169-2.4 5.834-5.583 6.435l-.324-1.088c2.508-.56 4.177-2.677 4.177-5.347v-.368c-.368.16-.768.256-1.177.256-1.544 0-2.8-1.255-2.8-2.799 0-1.544 1.256-2.799 2.8-2.799 1.232 0 2.271.8 2.624 1.907zm-10 0C5.447 7.773 6 9.125 6 10.735c0 3.169-2.4 5.834-5.583 6.435l-.324-1.088c2.508-.56 4.177-2.677 4.177-5.347v-.368c-.368.16-.768.256-1.177.256C1.549 10.623.293 9.368.293 7.824c0-1.544 1.256-2.799 2.8-2.799 1.232 0 2.271.8 2.624 1.907z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">Trusted by professionals from leading companies</p>
          <div className="flex justify-center items-center gap-8 opacity-50">
            {/* Add company logos here */}
          </div>
        </motion.div>

        <p className="text-gray-600">
          SchedSync has completely transformed how I manage my time. It&apos;s like having a &quot;personal assistant&quot; that knows exactly how I work.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;