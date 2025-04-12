export default function PrivacyPage() {
    // Get current date in format: Month Day, Year
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <main className="max-w-4xl mx-auto p-8 bg-white/90 shadow-lg rounded-lg my-8">
        <div className="border-l-4 border-blue-500 pl-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: {currentDate}</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="lead text-lg mb-6">
            SchedSync ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our application.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Information We Collect</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name, and profile picture (via Google login)</li>
              <li><strong>Calendar Data:</strong> When you connect your Google Calendar, we access your calendar events to integrate them with your schedule</li>
              <li><strong>Schedule Data:</strong> Tasks, schedules, and preferences you voluntarily provide</li>
              <li><strong>User Preferences:</strong> Information about your profession, hobbies, sleeping patterns, and working hours</li>
              <li><strong>Notification Preferences:</strong> Contact information for notifications (email, phone number, Telegram chat ID)</li>
              <li><strong>Device Information:</strong> Browser type, IP address, time zone, and other technical information</li>
              <li><strong>Usage Data:</strong> Analytics data to improve app performance and user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">How We Use Your Information</h2>
            <p className="mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personalized Scheduling:</strong> To create AI-powered schedules tailored to your preferences, work patterns, and lifestyle</li>
              <li><strong>Calendar Integration:</strong> To synchronize your schedule with your Google Calendar events</li>
              <li><strong>Multi-channel Notifications:</strong> To send reminders and alerts through your preferred channels (Email, WhatsApp, Telegram, or phone calls)</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our application</li>
              <li><strong>Technical Support:</strong> To respond to your inquiries and resolve issues</li>
              <li><strong>Account Management:</strong> To manage your account and provide you with important notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Cookies and Tracking</h2>
            <p className="mb-4">We use cookies and similar tracking technologies to track activity on our application and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Data Storage and Protection</h2>
            <p className="mb-4">We implement robust security measures to protect your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is stored in secure cloud environments with industry-standard encryption</li>
              <li>We use JWT authentication and secure API routes to protect your data</li>
              <li>Your timezone preferences are stored to ensure accurate scheduling</li>
              <li>We store all time data in UTC format internally while displaying local time in the UI</li>
              <li>Regular security audits and updates are performed to maintain data protection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Data Retention</h2>
            <p className="mb-4">We retain your personal information for as long as your account is active or as needed to provide you services. Specifically:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information is retained until you delete your account</li>
              <li>Calendar data is synchronized in real-time and not stored permanently</li>
              <li>Usage logs are retained for 30 days</li>
              <li>Backup data is retained for 7 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services to operate our application:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Calendar API:</strong> For calendar integration and event synchronization</li>
              <li><strong>Amazon Web Services (AWS):</strong> For hosting and data storage</li>
              <li><strong>SendGrid:</strong> For email notifications</li>
              <li><strong>Twilio:</strong> For phone call notifications</li>
              <li><strong>Telegram API:</strong> For Telegram notifications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Google Calendar Permissions</h2>
            <p className="mb-4">We request read-only access to your Google Calendar (calendar.readonly scope) to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Display your existing calendar events in SchedSync</li>
              <li>Create personalized task schedules that work around your existing commitments</li>
              <li>Prevent scheduling conflicts with your calendar events</li>
            </ul>
            <p className="mt-4">To revoke SchedSync's access to your Google Calendar:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Visit <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:text-blue-800 underline">Google Account Permissions</a></li>
              <li>Find SchedSync in the list of connected apps</li>
              <li>Click "Remove Access"</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Data Sharing</h2>
            <p className="mb-4">We do not sell your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party service providers that help us operate our application (e.g., cloud hosting, email delivery)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> You can request access to your personal information</li>
              <li><strong>Correction:</strong> You can request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> You can request deletion of your data</li>
              <li><strong>Restriction:</strong> You can request restriction of processing of your data</li>
              <li><strong>Data Portability:</strong> You can request transfer of your data</li>
              <li><strong>Objection:</strong> You can object to processing of your data</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:prudvirajkaukuntla3@gmail.com" className="text-blue-600 hover:text-blue-800 underline">prudvirajkaukuntla3@gmail.com</a>.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Children's Privacy</h2>
            <p className="mb-4">Our application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Changes to This Privacy Policy</h2>
            <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Contact Us</h2>
            <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mb-2"><a href="mailto:prudvirajkaukuntla3@gmail.com" className="text-blue-600 hover:text-blue-800 underline">prudvirajkaukuntla3@gmail.com</a></p>
          </section>
        </div>
      </main>
    );
  }
