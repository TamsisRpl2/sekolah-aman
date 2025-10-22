import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./_components/navbar"))
const Hero = dynamic(() => import("./_components/hero"))
const Feature = dynamic(() => import("./_components/feature"))
const Cta = dynamic(() => import("./_components/cta"))
const Footer = dynamic(() => import("./_components/footer"))

const page = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <Hero />
      <Feature />
      {/* <Stats /> */}
      <Cta />
      <Footer />
    </div>
  );
};

export default page;