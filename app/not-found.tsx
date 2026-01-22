import NotFound from "@/components/NotFound";
import { Metadata } from "next";


type Props = {};
export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  description: "404 not found",
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

const NotFound404 = (props: Props) => {
 
  return (
    <NotFound/>
  );
};

export default NotFound404;
