'use client'
import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

function Page() {
  const { isDark } = useTheme()

  return (
    <div className={`flex flex-col items-center justify-center min-h-[80vh] ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className={`text-center p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-2xl mx-auto`}>
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
          <svg 
            className={`w-full h-full ${isDark ? 'text-blue-400' : 'text-blue-500'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className={`text-3xl font-extrabold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          Calendar Integration Coming Soon
        </h1>
        
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          We&apos;re working on seamless Google Calendar integration to help you:
        </p>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {[
            'Sync events automatically',
            'Manage multiple calendars',
            'Smart scheduling suggestions',
            'Real-time availability updates'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className={`inline-flex items-center px-4 py-2 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Launch Expected Soon</span>
        </div>
      </div>
    </div>
  )
}

export default Page
