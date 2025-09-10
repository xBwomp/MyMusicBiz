import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Programs from './Programs';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Programs />
      <About />
      <Contact />
      <Footer />
    </>
  );
};

export default HomePage;
