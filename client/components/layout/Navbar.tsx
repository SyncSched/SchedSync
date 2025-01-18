'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/30 backdrop-blur-md border-b border-white/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-bold text-gray-800">
              SchedSync
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {['Features', 'Pricing', 'Contact Us'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/start"
                className="group relative inline-flex items-center justify-center px-6 py-2 font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 transition-all duration-300"
              >
                <span className="absolute w-full h-full rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">Start Now</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with glassmorphism */}
      <motion.div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-sm bg-white/30 border border-white/20">
          {['Features', 'Pricing', 'Contact Us'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(' ', '-')}`}
              className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            >
              {item}
            </Link>
          ))}
          <Link
            href="/start"
            className="group relative inline-flex items-center justify-center w-full px-3 py-2 font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 transition-all duration-300"
          >
            <span className="absolute w-full h-full rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative">Start Now</span>
          </Link>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar; 