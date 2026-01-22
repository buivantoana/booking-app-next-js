'use client';
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import not_found from "../images/dribbble_1.gif";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {};

const NotFound = (props: Props) => {
  const navigate: any = useRouter();
  return (
    <Box
      position={"fixed"}
      sx={{
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}>
      <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
        <Image src={not_found} width={700} alt='' />
        <Typography suppressHydrationWarning  variant='h6'>
          Trang bạn tìm kiếm không có sẵn hoặc không khả dụng
        </Typography>
        <Button
          onClick={() => {
            navigate.push("/");
          }}
          sx={{
            mt: "30px",
            width: "30%",
            backgroundColor: "#4CAF50", // Màu nền của nút
            color: "#fff", // Màu chữ
            "&:hover": {
              backgroundColor: "#388E3C", // Màu nền khi hover
            },
          }}
          variant='contained'>
          Trở về trang chủ
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
