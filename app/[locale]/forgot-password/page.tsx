import Footer from "@/components/Footer";
import GuestRoute from "@/components/GuestRoute";
import Header from "@/components/Header";
import ForgotPasswordController from "@/page/forgot_password/ForgotPasswordController";
import LoginController from "@/page/login/LoginController";
import { Metadata } from "next";

import Image from "next/image";
export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Lấy lại mật khẩu",
  icons: {
    icon: [
      {
        url: "/icons/icon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
};


export default function Login() {
  return (
   <>
   <Header />
   <ForgotPasswordController/>
   <Footer />
   </>
  );
}
