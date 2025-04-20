'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 pt-32 pb-16">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 18, 2025</p>

          <div className="space-y-8">
            <p className="text-gray-700">
              SchedSync (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our application.
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              <p className="text-gray-700">We collect the following types of information:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Account Information: Email address, name, and profile picture (via Google login)</li>
                <li>Calendar Data: When you connect your Google Calendar, we access your calendar events to integrate them with your schedule</li>
                <li>Schedule Data: Tasks, schedules, and preferences you voluntarily provide</li>
                <li>User Preferences: Information about your profession, hobbies, sleeping patterns, and working hours</li>
                <li>Notification Preferences: Contact information for notifications (email, phone number, Telegram chat ID)</li>
                <li>Device Information: Browser type, IP address, time zone, and other technical information</li>
                <li>Usage Data: Analytics data to improve app performance and user experience</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              <p className="text-gray-700">We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Personalized Scheduling: To create AI-powered schedules tailored to your preferences, work patterns, and lifestyle</li>
                <li>Calendar Integration: To synchronize your schedule with your Google Calendar events</li>
                <li>Multi-channel Notifications: To send reminders and alerts through your preferred channels (Email, Telegram)</li>
                <li>Service Improvement: To analyze usage patterns and improve our application</li>
                <li>Technical Support: To respond to your inquiries and resolve issues</li>
                <li>Account Management: To manage your account and provide you with important notifications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to track activity on our application and hold certain information. 
                Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Storage and Protection</h2>
              <p className="text-gray-700">We implement robust security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>All data is stored in secure cloud environments with industry-standard encryption</li>
                <li>We use JWT authentication and secure API routes to protect your data</li>
                <li>Your timezone preferences are stored to ensure accurate scheduling</li>
                <li>We store all time data in UTC format internally while displaying local time in the UI</li>
                <li>Regular security audits and updates are performed to maintain data protection</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as your account is active or as needed to provide you services. Specifically:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Account information is retained until you delete your account</li>
                <li>Calendar data is synchronized in real-time and not stored permanently</li>
                <li>Usage logs are retained for 30 days</li>
                <li>Backup data is retained for 7 days</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
              <p className="text-gray-700">We use the following third-party services to operate our application:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Google Calendar API: For calendar integration and event synchronization</li>
                <li>Amazon Web Services (AWS): For hosting and data storage</li>
                <li>SendGrid: For email notifications</li>
                <li>Twilio: For phone call notifications</li>
                <li>Telegram API: For Telegram notifications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Google Calendar Permissions</h2>
              <p className="text-gray-700">
                We request read-only access to your Google Calendar (calendar.readonly scope) to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Display your existing calendar events in SchedSync</li>
                <li>Create personalized task schedules that work around your existing commitments</li>
                <li>Prevent scheduling conflicts with your calendar events</li>
              </ul>
              <p className="text-gray-700 mt-4">To revoke SchedSync&apos;s access to your Google Calendar:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Visit Google Account Permissions</li>
                <li>Find SchedSync in the list of connected apps</li>
                <li>Click &quot;Remove Access&quot;</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Service Providers: With third-party service providers that help us operate our application (e.g., cloud hosting, email delivery)</li>
                <li>Legal Requirements: When required by law or to protect our rights</li>
                <li>Business Transfers: In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              <p className="text-gray-700">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Access: You can request access to your personal information</li>
                <li>Correction: You can request correction of inaccurate information</li>
                <li>Deletion: You can request deletion of your data</li>
                <li>Restriction: You can request restriction of processing of your data</li>
                <li>Data Portability: You can request transfer of your data</li>
                <li>Objection: You can object to processing of your data</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us at prudvirajkaukuntla3@gmail.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Our application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
                and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-blue-600">prudvirajkaukuntla3@gmail.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 