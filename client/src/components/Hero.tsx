'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { submitWaitlist } from '@/lib/firebase';

const Hero = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const result = await submitWaitlist(email);
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thanks for joining our waitlist!'
        });
        setEmail('');
      } else {
        setSubmitStatus({
          type: 'error',
          message: typeof result.error === 'string' ? result.error : 'Failed to join waitlist'
        });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const userAvatars = [
    {
      src: "/avatars/avatar1.jpg",
      alt: "User avatar 1"
    },
    {
      src: "/avatars/avatar2.jpg",
      alt: "User avatar 2"
    },
    {
      src: "/avatars/avatar3.jpg",
      alt: "User avatar 3"
    },
    {
      src: "/avatars/avatar4.jpg",
      alt: "User avatar 4"
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                AI-Powered Personal Secretary
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Your Life, <br />
              <span className="text-blue-600">Intelligently Scheduled</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-gray-600 max-w-2xl"
            >
              Experience the future of time management with SchedSync. Our AI-powered platform adapts to your lifestyle, intelligently managing your tasks, schedules, and routines while keeping you connected through multiple channels.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="button"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="button"
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-8 pt-4"
            >
              <div className="flex -space-x-4">
                {userAvatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full border-2 border-white relative overflow-hidden ring-2 ring-white"
                  >
                    <Image
                      src={avatar.src}
                      alt={avatar.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 48px) 100vw, 48px"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="text-blue-600 font-bold">10,000+</span> users already trust SchedSync
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative space-y-6"
          >
            {/* Feature Highlights Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="grid gap-6">
                {[
                  {
                    icon: "🤖",
                    title: "Smart Scheduling",
                    description: "AI-powered schedule generation that adapts to your patterns"
                  },
                  {
                    icon: "📱",
                    title: "Multi-Channel Alerts",
                    description: "Stay connected via Email, WhatsApp, Telegram, and Calls"
                  },
                  {
                    icon: "🎯",
                    title: "Personalized Routines",
                    description: "Context-aware planning for work, hobbies, and lifestyle"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.2, duration: 0.5 }}
                    className="flex items-start gap-4 bg-white/60 p-4 rounded-2xl"
                  >
                    <div className="text-2xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Waitlist Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Join the Waitlist</h3>
                <p className="text-blue-100 mb-6">Be among the first to experience the future of AI-powered scheduling.</p>
                
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Now'}
                  </button>
                </form>

                {submitStatus.type && (
                  <div className={`mt-3 text-sm ${submitStatus.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-800/30 rounded-full blur-2xl"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
