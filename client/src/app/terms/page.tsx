'use client';

import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden w-full">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-lg max-w-none"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-6 sm:mb-8">Last updated: April 15, 2025</p>

          <div className="space-y-6 sm:space-y-8">
            <p className="text-gray-700">
              By accessing or using SchedSync (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access the Service.
            </p>

            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">1. Account Creation and Responsibilities</h2>
              <p className="text-gray-700">To use SchedSync, you must:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Create an account using Google authentication</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update your account information if it changes</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
              <p className="text-gray-700">
                We reserve the right to disable any user account if, in our opinion, you have violated any provision of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">2. Acceptable Use</h2>
              <p className="text-gray-700">You agree to use SchedSync only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Use the Service in any way that violates any applicable law or regulation</li>
                <li>Attempt to interfere with the proper functioning of the Service</li>
                <li>Engage in any conduct that restricts or inhibits anyone&apos;s use of the Service</li>
                <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
                <li>Use the Service to transmit any material that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
                <li>Use the Service to impersonate any person or entity</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">3. User Data and Privacy</h2>
              <p className="text-gray-700">Your use of SchedSync is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>You retain ownership of all data you input into the Service</li>
                <li>You grant us a license to use your data solely for the purpose of providing and improving the Service</li>
                <li>We will handle your personal information in accordance with our Privacy Policy</li>
                <li>You can request deletion of your account and associated data at any time</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">4. Calendar Integration</h2>
              <p className="text-gray-700">SchedSync offers integration with Google Calendar. By enabling this integration:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>You authorize SchedSync to access your calendar data</li>
                <li>You understand that calendar events will be synchronized with your SchedSync schedule</li>
                <li>You can revoke this access at any time through your Google account settings</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">5. Intellectual Property</h2>
              <p className="text-gray-700">
                The Service and its original content, features, and functionality are owned by SchedSync and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700">You may not:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Modify, distribute, or create derivative works based on our Service</li>
                <li>Use any automated means to access or collect data from the Service</li>
                <li>Copy, reproduce, or reverse engineer any part of the Service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
              <p className="text-gray-700">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>SchedSync shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service</li>
                <li>We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free</li>
                <li>We are not responsible for any loss of data or scheduling errors that may occur</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">7. Modifications to the Service</h2>
              <p className="text-gray-700">
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">8. Changes to Terms</h2>
              <p className="text-gray-700">
                We may revise these Terms at any time without notice. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">9. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">10. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p className="text-gray-700">
                Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive termination.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">11. Disclaimers</h2>
              <p className="text-gray-700">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>The accuracy or reliability of AI-generated schedules</li>
                <li>The continuous, uninterrupted availability of the Service</li>
                <li>The compatibility with all calendar systems or devices</li>
                <li>The complete accuracy of notifications and reminders</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">12. User Feedback</h2>
              <p className="text-gray-700">
                By providing feedback, suggestions, or recommendations regarding the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>You grant SchedSync a perpetual, irrevocable license to use such feedback</li>
                <li>We may implement suggestions without any obligation to provide compensation</li>
                <li>Your feedback may be used to improve or modify our services</li>
                <li>We will not attribute feedback to you without your consent</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">13. OAuth Consent</h2>
              <p className="text-gray-700">
                When you authorize SchedSync to access your Google Calendar:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>We request read-only access to view your calendar events</li>
                <li>This access is used solely for schedule optimization and conflict prevention</li>
                <li>You can revoke this access at any time through your Google Account settings</li>
                <li>We don&apos;t modify or create events in your calendar without explicit permission</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">14. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-blue-600">prudvirajkaukuntla3@gmail.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}