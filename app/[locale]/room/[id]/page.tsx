import Footer from "@/components/Footer";
import Header from "@/components/Header";
import DetailRoomController from "@/page/detail_room/DetailRoomController";

import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: {
    locale: string;
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  // (optional) fetch data phòng
  // const room = await getRoomById(id);

  return {
    title: `Chi tiết phòng `,
    description: `Thông tin chi tiết phòng, hình ảnh, giá và tiện ích`,
    openGraph: {
      title: `Chi tiết phòng  | Booking App`,
      description: `Thông tin chi tiết phòng`,
      url: "https://booking-app-next-js-alpha.vercel.app/room",
      siteName: "Booking App",
      type: "website", // 👈 QUAN TRỌNG
      images: [
        {
          url: "/images/og-room-detail.jpg",
          width: 1200,
          height: 630,
          alt: `Phòng`,
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
    metadataBase: new URL("https://booking-app-next-js-alpha.vercel.app/room"),
    alternates: {
      canonical: "/",
    },
  };
}

export default function Home() {
  return (
    <>
      <Header />
      <DetailRoomController />
      <Footer />
    </>
  );
}
