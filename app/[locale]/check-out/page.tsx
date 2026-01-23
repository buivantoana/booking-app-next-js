import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CheckOutController from "@/page/check_out/CheckOutController";
import LoginController from "@/page/login/LoginController";
import { Metadata } from "next";

import Image from "next/image";
export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Xác nhận và thanh toán đơn đặt phòng",
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
   <CheckOutController/>
   <Footer />
   </>
  );
}
