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
    url: "https://booking-app-next-js-alpha.vercel.app/rooms",
    siteName: "Booking App",
    type: "website", // 👈 QUAN TRỌNG
    images: [
      {
        url: "https://booking-app-next-js-alpha.vercel.app/rooms/images/og-rooms.jpg",
        width: 1200,
        height: 630,
        alt: "Danh sách phòng",
      },
    ],
  },

  icons: {
    icon: [
      {
        url: "/icons/icon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  },
  metadataBase: new URL("https://booking-app-next-js-alpha.vercel.app/rooms"),
  alternates: {
    canonical: "/",
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
