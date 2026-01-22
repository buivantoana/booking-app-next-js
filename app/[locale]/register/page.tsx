import Footer from "@/components/Footer";
import GuestRoute from "@/components/GuestRoute";
import Header from "@/components/Header";
import RegisterController from "@/pages/register/RegisterController";
import { Metadata } from "next";

import Image from "next/image";
export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Booking App để đặt phòng nhanh hơn",
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

export default function register() {
  return (
   <GuestRoute>
   <Header />
   <RegisterController/>
   <Footer />
   </GuestRoute>
  );
}
