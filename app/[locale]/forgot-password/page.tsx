import Footer from "@/components/Footer";
import GuestRoute from "@/components/GuestRoute";
import Header from "@/components/Header";
import ForgotPasswordController from "@/page/forgot_password/ForgotPasswordController";
import LoginController from "@/page/login/LoginController";

import Image from "next/image";

export default function Login() {
  return (
   <>
   <Header />
   <ForgotPasswordController/>
   <Footer />
   </>
  );
}
