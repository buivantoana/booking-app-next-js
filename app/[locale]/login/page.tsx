import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginController from "@/pages/login/LoginController";

import Image from "next/image";
import type { Metadata } from "next";
import GuestRoute from "@/components/GuestRoute";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập để quản lý đặt phòng của bạn",
  icons: {
    icon: [
      {
        url: "/icons/favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
};
export default function Login() {
  return (
   <GuestRoute>
   <Header />
   <LoginController/>
   <Footer />
   </GuestRoute>
  );
}
