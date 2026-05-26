import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Courses from './components/Courses';
import Stats from './components/Stats';
import About from './components/About';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <Hero />
      <Features />
      <Courses />
      <Stats />
      <About />
      <CTA />
      <Footer />
    </div>
  );
}
