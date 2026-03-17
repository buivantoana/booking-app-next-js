import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PolicyController from "@/page/policy/Policy";
import { Box } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách - BookingApp",
  description:
    "Điều khoản dịch vụ, chính sách bảo mật và chính sách thanh toán",
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
export default function PolicyPage() {
  // ← đổi thành PolicyPage
  return (
    <Box>
      <Header />
      <PolicyController />
      <Footer />
    </Box>
  );
}
