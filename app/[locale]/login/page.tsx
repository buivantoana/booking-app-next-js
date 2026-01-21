import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginController from "@/pages/login/LoginController";

import Image from "next/image";

export default function Login() {
  return (
   <>
   <Header />
   <LoginController/>
   <Footer />
   </>
  );
}
