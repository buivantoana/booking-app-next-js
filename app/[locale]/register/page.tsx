import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RegisterController from "@/pages/register/RegisterController";

import Image from "next/image";

export default function register() {
  return (
   <>
   <Header />
   <RegisterController/>
   <Footer />
   </>
  );
}
