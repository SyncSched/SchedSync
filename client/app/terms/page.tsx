export default function TermsPage() {
    // Get current date in format: Month Day, Year
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <main className="max-w-4xl mx-auto p-8 bg-white/90 shadow-lg rounded-lg my-8">
        <div className="border-l-4 border-blue-500 pl-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: {currentDate}</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-lg mb-6">
            By accessing or using SchedSync ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Account Creation and Responsibilities</h2>
            <p className="mb-4">To use SchedSync, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account using Google authentication</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your account information if it changes</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
            <p className="mt-4">We reserve the right to disable any user account if, in our opinion, you have violated any provision of these Terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">2. Acceptable Use</h2>
            <p className="mb-4">You agree to use SchedSync only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Attempt to interfere with the proper functioning of the Service</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the Service</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
              <li>Use the Service to transmit any material that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
              <li>Use the Service to impersonate any person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">3. User Data and Privacy</h2>
            <p className="mb-4">Your use of SchedSync is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain ownership of all data you input into the Service</li>
              <li>You grant us a license to use your data solely for the purpose of providing and improving the Service</li>
              <li>We will handle your personal information in accordance with our Privacy Policy</li>
              <li>You can request deletion of your account and associated data at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">4. Calendar Integration</h2>
            <p className="mb-4">SchedSync offers integration with Google Calendar. By enabling this integration:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You authorize SchedSync to access your calendar data</li>
              <li>You understand that calendar events will be synchronized with your SchedSync schedule</li>
              <li>You can revoke this access at any time through your Google account settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">5. Intellectual Property</h2>
            <p className="mb-4">The Service and its original content, features, and functionality are owned by SchedSync and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify, distribute, or create derivative works based on our Service</li>
              <li>Use any automated means to access or collect data from the Service</li>
              <li>Copy, reproduce, or reverse engineer any part of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">6. Limitation of Liability</h2>
            <p className="mb-4">To the maximum extent permitted by law:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SchedSync shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service</li>
              <li>We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free</li>
              <li>We are not responsible for any loss of data or scheduling errors that may occur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">7. Modifications to the Service</h2>
            <p className="mb-4">We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">8. Changes to Terms</h2>
            <p className="mb-4">We may revise these Terms at any time without notice. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">9. Governing Law</h2>
            <p className="mb-4">These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">10. Termination</h2>
            <p className="mb-4">We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.</p>
            <p className="mb-4">Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive termination.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">11. Disclaimers</h2>
            <p className="mb-4">The Service is provided "as is" and "as available" without any warranties, either express or implied, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The accuracy or reliability of AI-generated schedules</li>
              <li>The continuous, uninterrupted availability of the Service</li>
              <li>The compatibility with all calendar systems or devices</li>
              <li>The complete accuracy of notifications and reminders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">12. User Feedback</h2>
            <p className="mb-4">By providing feedback, suggestions, or recommendations regarding the Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You grant SchedSync a perpetual, irrevocable license to use such feedback</li>
              <li>We may implement suggestions without any obligation to provide compensation</li>
              <li>Your feedback may be used to improve or modify our services</li>
              <li>We will not attribute feedback to you without your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">13 .OAuth Consent</h2>
            <p className="mb-4">When you authorize SchedSync to access your Google Calendar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We request read-only access to view your calendar events</li>
              <li>This access is used solely for schedule optimization and conflict prevention</li>
              <li>You can revoke this access at any time through your Google Account settings</li>
              <li>We do not modify or create events in your calendar without explicit permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">14. Contact Us</h2>
            <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
            <p className="mb-2"><a href="mailto:prudvirajkaukuntla3@gmail.com" className="text-blue-600 hover:text-blue-800 underline">prudvirajkaukuntla3@gmail.com</a></p>
          </section>
        </div>
      </main>
    );
  }
