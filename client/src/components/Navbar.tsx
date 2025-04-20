'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const updateScroll = () => {
      if (scrollY.get() > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    scrollY.onChange(updateScroll);
    return () => {
      scrollY.clearListeners();
    };
  }, [scrollY]);

  const handleScroll = (elementId: string) => {
    // Explicitly close the mobile menu first
    setIsMenuOpen(false);

    // Use setTimeout to ensure the menu closing animation completes
    // before scrolling, which helps with mobile interaction
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const offset = 80; // Account for navbar height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 10); // Small delay to ensure state update happens first
  };

  const navItems = [
    { name: 'Features', id: 'features' },
    { name: 'How it Works', id: 'how-it-works' },

    { name: 'Contact', id: 'contact' }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        // Check if the click is outside the navbar
        const navbar = document.getElementById('mobile-navbar');
        if (navbar && !navbar.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isMenuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 overflow-hidden">
      <div id="mobile-navbar" className="max-w-[1405px] mx-auto px-4 sm:px-8 lg:px-16 w-full">
        <motion.nav
          className="pt-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className={`
              relative overflow-hidden
              rounded-[50px] px-4 sm:px-8 py-4
              ${scrolled
                ? 'bg-white/[0.03] shadow-[0_2px_20px_rgb(0,0,0,0.025)] backdrop-blur-[8px]'
                : 'bg-transparent backdrop-blur-[6px]'
              }
              border-2 border-black/[0.7]
              transition-all duration-300 ease-in-out
              hover:bg-white/[0.04]
              group
            `}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] via-transparent to-white/[0.01]" />
            </div>

            {/* Main content with higher z-index */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                {/* Logo/Brand */}
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/" className="text-xl font-bold text-gray-800">
                    SchedSync
                  </Link>
                </motion.div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-12">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => handleScroll(item.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors relative group/link text-base cursor-pointer"
                      >
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gray-300/20 group-hover/link:w-full transition-all duration-300" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Menu Button */}
                <motion.div
                  className="md:hidden"
                  whileTap={{ scale: 0.9 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none relative z-20"
                  >
                    <motion.svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ rotate: isMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isMenuOpen ? (
                        <path d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </motion.svg>
                  </button>
                </motion.div>
              </div>

              {/* Mobile Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    className="md:hidden mt-4 space-y-4 relative z-20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {navItems.map((item) => (
                      <motion.div
                        key={item.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleScroll(item.id);
                          }}
                          className="block text-gray-600 hover:text-gray-900 transition-colors w-full text-left py-3 px-2 rounded-lg"
                        >
                          {item.name}
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.nav>
      </div>
    </div>
  );
};

export default Navbar;