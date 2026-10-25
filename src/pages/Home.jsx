import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BookingSearch from "../components/BookingSearch";
import FeaturedFleet from "../components/FeaturedFleet";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <BookingSearch />

        <FeaturedFleet />

        <About />

        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default Home;