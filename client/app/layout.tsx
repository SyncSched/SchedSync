import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SchedSync - Your Personal AI Assistant',
  description: 'AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimatedBackground>
          <Navbar />
          {children}
          <Footer />
        </AnimatedBackground>
      </body>
    </html>
  );
}
