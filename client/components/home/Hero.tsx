'use client';
import { useSession, signIn, signOut } from "next-auth/react"

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { Give_You_Glory } from "next/font/google";
import { div } from "framer-motion/client";
import AnimatedBackground from "../layout/AnimatedBackground";
import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";

export default function Component() {
 
  const containerRef = useRef(null);
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects
  const y3= useTransform(scrollY, [0, 1000], [0, -100])
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 20]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.2]);

  const {data: session}= useSession();

  if(session){
    return (
      <>
      Home Page
      <br />
      <button onClick={()=>signOut()} >
        Signout
      </button>
      </>
    )
  }


  return (
    <AnimatedBackground>

      <Navbar/>

    <div ref={containerRef}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Main Content with Scroll Effects */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
              >
              <motion.span 
                className="inline-block text-indigo-600 text-lg font-medium mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1, x: 10 }}
                transition={{ delay: 0.2 }}
                >
                #NextGenProductivity
              </motion.span>
              
              {/* 3D Text Effect */}
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
                style={{ 
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                  rotateX: rotate
                }}
                >
                Your Personal AI Secretary,{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  >
                  Anytime, Anywhere
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 mb-8"
                style={{ y: y2 }}
                >
                Powered by cutting-edge Gen-AI, we help you manage your tasks, schedule, and life effortlessly.
              </motion.p>

              {/* Interactive Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  >
                  <button onClick={()=>signIn()}
                    
                    className="group relative inline-flex items-center justify-center px-8 py-3 font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 transition-all duration-300"
                    >
                    <span className="absolute w-full h-full rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
                    <span className="relative">Get Started →</span>
                  </button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  >
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 font-medium rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* 3D Image Container - removed shadow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ scale }}
              className="relative z-10 perspective-1000"
              >
              <motion.div 
                className="w-full h-[500px] relative transform-style-3d"
                whileHover={{ rotateY: 10, rotateX: -10 }}
                transition={{ type: "spring", stiffness: 200 }}
                >
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <Image
                    src="/assets/Media.png"
                    alt="AI Secretary Productivity"
                    width={500}
                    height={500}
                    priority
                    className="w-full h-full object-contain p-8 hover:scale-110 transition-transform duration-300"
                    />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section - updated with glassmorphism */}
      <motion.section 
        className="relative py-20"
        style={{ y: y3}}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
            >
            <h2 className="text-3xl font-bold text-gray-900">
              How It{' '}
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 500 }}
                >
                Works
              </motion.span>
            </h2>
          </motion.div>

          {/* 3D Cards - updated with glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Connect',
                description: 'Link your calendar, email, and tasks with one click',
                image: '/assets/Working Productively.png',
              },
              {
                title: 'Automate',
                description: 'Let AI handle your scheduling and task management',
                image: '/assets/Multitaking.png',
              },
              {
                title: 'Succeed',
                description: 'Focus on what matters while AI handles the rest',
                image: '/assets/Deadline.png',
              },
            ].map((step, index) => (
              <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 50
              }}
              transition={{ 
                delay: index * 0.2,
                type: "spring",
                stiffness: 300
              }}
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
              className="relative p-6 rounded-2xl backdrop-blur-sm bg-white/30 border border-white/20"
              >
                <div className="h-48 relative mb-6 overflow-hidden rounded-xl">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain transform hover:scale-110 transition-transform duration-300"
                    />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
            <Footer/>
            </AnimatedBackground>
  );
};

 