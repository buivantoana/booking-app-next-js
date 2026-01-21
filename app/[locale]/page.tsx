import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeController from "@/pages/home/HomeController";
import Image from "next/image";

export default function Home() {
  return (
   <>
   <Header />
   <HomeController/>
   <Footer />
   </>
  );
}
