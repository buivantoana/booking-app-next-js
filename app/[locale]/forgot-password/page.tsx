import Footer from "@/components/Footer";
import GuestRoute from "@/components/GuestRoute";
import Header from "@/components/Header";
import ForgotPasswordController from "@/pages/forgot_password/ForgotPasswordController";
import LoginController from "@/pages/login/LoginController";

import Image from "next/image";

export default function Login() {
  return (
   <GuestRoute>
   <Header />
   <ForgotPasswordController/>
   <Footer />
   </GuestRoute>
  );
}
