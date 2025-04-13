'use client'
import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getCalendarEvents, hasCalendarIntegration, CalendarEvent } from '@/api/lib'
import { formatTimeForDisplay } from '@/app/utils/dateUtils'

function Page() {
  const { isDark } = useTheme()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [hasIntegration, setHasIntegration] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkIntegration = async () => {
      try {
        const hasCalendar = await hasCalendarIntegration()
        setHasIntegration(hasCalendar)

        if (hasCalendar) {
          // Get events for the next 7 days
          const now = new Date()
          const nextWeek = new Date()
          nextWeek.setDate(nextWeek.getDate() + 7)

          const calendarEvents = await getCalendarEvents(now, nextWeek)
          setEvents(calendarEvents)
        }
      } catch (err) {
        console.error('Error checking calendar integration:', err)
        setError('Failed to load calendar data')
      } finally {
        setLoading(false)
      }
    }

    checkIntegration()
  }, [])

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // Group events by date
  const groupedEvents = events.reduce((groups: Record<string, CalendarEvent[]>, event) => {
    // Skip events without start date/time
    if (!event.start?.dateTime) return groups;

    const date = formatEventDate(event.start.dateTime)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
    return groups
  }, {})

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[80vh] ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!hasIntegration) {
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
            Google Calendar Integration
          </h1>

          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your Google Calendar is not connected yet. Log out and log back in to connect your calendar.
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

          <a
            href="/login"
            className={`inline-flex items-center px-6 py-3 rounded-full ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} transition-colors duration-300`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Log Out and Reconnect</span>
          </a>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[80vh] ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-2xl mx-auto`}>
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Error Loading Calendar</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 min-h-[80vh] ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          Your Calendar
        </h1>

        {events.length === 0 ? (
          <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md text-center`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No upcoming events</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your calendar is clear for the next 7 days.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <div key={date} className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${isDark ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                  {date}
                </h2>
                <div className="space-y-4">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{event.summary}</h3>
                          {event.description && (
                            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {event.description.length > 100
                                ? `${event.description.substring(0, 100)}...`
                                : event.description}
                            </p>
                          )}
                        </div>
                        <div className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {event.start?.dateTime && event.end?.dateTime ?
                            `${formatTimeForDisplay(new Date(event.start.dateTime))} - ${formatTimeForDisplay(new Date(event.end.dateTime))}` :
                            'Time not specified'}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          {event.location && (
                            <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mr-4`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.location.length > 30 ? `${event.location.substring(0, 30)}...` : event.location}
                            </div>
                          )}
                          {event.organizer && event.organizer.email && (
                            <div className={`flex items-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {event.organizer.displayName || event.organizer.email}
                            </div>
                          )}
                        </div>
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                        >
                          View in Google Calendar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
