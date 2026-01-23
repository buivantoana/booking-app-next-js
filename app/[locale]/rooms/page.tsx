import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RoomsController from "@/page/rooms/RoomsController";
import { LoadScript } from "@react-google-maps/api";

import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách phòng",
  description: "Tìm kiếm và đặt phòng khách sạn với giá tốt nhất",
  openGraph: {
    title: "Danh sách phòng | Booking App",
    description: "Tìm kiếm và đặt phòng khách sạn với giá tốt nhất",
    images: [
      {
        url: "/images/og-rooms.jpg",
        width: 1200,
        height: 630,
        alt: "Danh sách phòng",
      },
    ],
  },
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

export default function Home() {
  return (
    <>
      <Header />
     
      <RoomsController />
  
      <Footer />
    </>
  );
}
