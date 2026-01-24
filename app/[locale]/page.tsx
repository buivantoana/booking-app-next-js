import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HomeController from "@/page/home/HomeController";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Booking App",
    template: "%s | Booking App",
  },
  description: "Ứng dụng đặt phòng khách sạn",
  openGraph: {
    title: "Booking App",
    description: "Ứng dụng đặt phòng khách sạn",
    url: "https://your-domain.com",
    siteName: "Booking App",
    images: [
      {
        url: "../../images/Frame 1321317934.png", // public../../images/Frame 1321317934.png
        width: 1200,
        height: 630,
        alt: "Booking App",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booking App",
    description: "Ứng dụng đặt phòng khách sạn",
    images: ["../../images/Frame 1321317934.png"],
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
  metadataBase: new URL("https://booking-app-next-js-alpha.vercel.app"),
  alternates: {
    canonical: "/",
  },
};
export default function Home() {
  return (
    <>
      <Header />
      <HomeController />
      <Footer />
    </>
  );
}
