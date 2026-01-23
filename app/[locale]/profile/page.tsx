import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRouter";
import LoginController from "@/page/login/LoginController";
import ProfileController from "@/page/profile/ProfileController";
import { Metadata } from "next";

import Image from "next/image";
export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  description: "Quản lý thông tin cá nhân và lịch sử đặt phòng",
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
   <PrivateRoute>
   <Header />
   <ProfileController/>
   <Footer />
   </PrivateRoute>
  );
}
