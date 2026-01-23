import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PaymentResultController from "@/page/payment_result/PaymentResultController";
import { Metadata } from "next";


import Image from "next/image";
export const metadata: Metadata = {
  title: "Kết quả đặt phòng",
  description: "Kết quả đặt phòng",
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
 
   <PaymentResultController/>
  
   </>
  );
}
