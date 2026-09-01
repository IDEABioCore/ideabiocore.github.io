import { Leva } from 'leva';
import Nav from './components/landing/Nav';
import Hero from './components/landing/Hero';
import Mission from './components/landing/Mission';
import Features from './components/landing/Features';
import StrainSection from './components/landing/StrainSection';
import Specs from './components/landing/Specs';
import LiveDemo from './components/landing/LiveDemo';
import Footer from './components/landing/Footer';

const levaTheme = {
  colors: {
    elevation1: '#150c26',
    elevation2: '#1a0f2e',
    elevation3: '#2a1946',
    accent1: '#7c3aed',
    accent2: '#a855f7',
    accent3: '#d946ef',
    highlight1: '#a595c4',
    highlight2: '#e6dcf7',
    highlight3: '#ffffff',
    vivid1: '#d946ef',
  },
  radii: { xs: '3px', sm: '6px', lg: '12px' },
  fontSizes: { root: '11px' },
};

export default function App() {
  return (
    <>
      {/* Offset below the fixed nav so the panel never covers it */}
      <Leva
        theme={levaTheme}
        titleBar={{ title: 'Process control', position: { x: -12, y: 66 } }}
        collapsed
      />
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Features />
        <StrainSection />
        <Specs />
        <LiveDemo />
      </main>
      <Footer />
    </>
  );
}
