'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full py-10 sm:py-12 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">SchedSync</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Your AI-powered personal secretary for intelligent scheduling and time management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Contact</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Email: syncsched1@gmail.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm sm:text-base">
            © {new Date().getFullYear()} SchedSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;