import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import './globals.css';
import SessionWrapper  from '@/components/Session/SessionWrapper';

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
      <SessionWrapper>

      <body className={inter.className}>
        
          {children}
      
      </body>
      </SessionWrapper>
    </html>
  );
}
