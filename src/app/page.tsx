import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-paper">
      <Navbar />
      <Hero />
      <Manifesto />
      <Features />
      <HowItWorks />
      <Faq />
      <Waitlist />
      <Footer />
    </main>
  );
}
