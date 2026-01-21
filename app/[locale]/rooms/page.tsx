import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RoomsController from "@/pages/rooms/RoomsController";

import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <RoomsController />
      <Footer />
    </>
  );
}
