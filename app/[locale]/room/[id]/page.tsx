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

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = params;

  // (optional) fetch data phòng
  // const room = await getRoomById(id);

  return {
    title: `Chi tiết phòng #${id}`,
    description: `Thông tin chi tiết phòng ${id}, hình ảnh, giá và tiện ích`,
    openGraph: {
      title: `Chi tiết phòng #${id} | Booking App`,
      description: `Thông tin chi tiết phòng ${id}`,
      images: [
        {
          url: "/images/og-room-detail.jpg",
          width: 1200,
          height: 630,
          alt: `Phòng ${id}`,
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
