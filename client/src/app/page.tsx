import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
// import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      {/* <Testimonials /> */}
      <Contact />
      <Footer />
    </div>
  );
}
