import { useState } from "react";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import Hero from "../components/sections/Hero";
import Proof from "../components/sections/Proof";
import Faq from "../components/sections/Faq";
import Cta from "../components/sections/Cta";
import Pricing from "../components/sections/Pricing";
import Features from "../components/sections/Features";
import Workflow from "../components/sections/Workflow";
import Problem from "../components/sections/Problem";
import Solution from "../components/sections/Solution";
import Testimonial from "../components/sections/Testimonial";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Proof />
      <Problem />
      <Solution />
      <Features />
      <Workflow />
      <Pricing />
      <Testimonial />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

export default Home;
