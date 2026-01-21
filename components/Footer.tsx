"use client";

import React from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Link,
  Divider,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  MusicNote as TikTokIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import momo from "../images/Rectangle 30024.png";
import vnpay from "../images/Rectangle 30024 (1).png";
import app from "../images/App.png";
import app1 from "../images/App (1).png";
import ins from "../images/Logos.png";
import fb from "../images/Logos (1).png";
import tiktok from "../images/Logos (2).png";
import youtube from "../images/Logos (3).png";
import logo from "../images/Frame 1321318033.png";

import { useTranslations } from "next-intl";
import Image from "next/image";
const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const  t  = useTranslations();
  return (
    <Box sx={{ bgcolor: "#f9f9f9", borderTop: "1px solid #eee", py: 4 }}>
      <Container maxWidth='lg'>
        <Grid container spacing={4} alignItems='flex-start'>
          {/* LOGO & INFO */}
          <Grid item xs={12} md={5.5}>
            <Stack spacing={2}>
              <Typography suppressHydrationWarning  fontWeight={700} fontSize='1.5rem' color='#333'>
                <Image src={logo} width={200} alt='' />
              </Typography>
              <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666' lineHeight={1.6}>
                {t("address")}: Lorem Ipsum is simply dummy text of the printing
                and typesetting
              </Typography>
              <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666'>
                {t("footer_contact_cooperation")}{" "}
                <strong style={{ color: "#666" }}>LoremIpsum@gmail.com</strong>
              </Typography>
              <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666'>
                {t("footer_customer_support")}{" "}
                <strong style={{ color: "#666" }}>LoremIpsum@gmail.com</strong>
              </Typography>
              <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666'>
                {t("footer_phone")}{" "}
                <strong style={{ color: "#666" }}>123456789</strong>
              </Typography>

              {/* SOCIAL ICONS */}
              <Stack direction='row' spacing={1.5} mt={1}>
                <Link href='#' color='inherit'>
                  <Image src={ins} alt='' />
                </Link>
                <Link href='#' color='inherit'>
                  <Image src={fb} alt='' />
                </Link>
                <Link href='#' color='inherit'>
                  <Image src={tiktok} alt='' />
                </Link>
                <Link href='#' color='inherit'>
                  <Image src={youtube} alt='' />
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* GIỚI THIỆU */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Stack spacing={2.5}>
              <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                {t("footer_about_title")}
              </Typography>
              <Link href='#' underline='hover' color='#666' fontSize='0.9rem'>
                {t("footer_about_us")}
              </Link>
              <Link href='#' underline='hover' color='#666' fontSize='0.9rem'>
                {t("footer_blog")}
              </Link>
              <Link href='#' underline='hover' color='#666' fontSize='0.9rem'>
                {t("footer_terms_of_service")}
              </Link>
              <Link href='#' underline='hover' color='#666' fontSize='0.9rem'>
                {t("footer_careers")}
              </Link>
              <Link href='#' underline='hover' color='#666' fontSize='0.9rem'>
                {t("footer_partners")}
              </Link>
            </Stack>
          </Grid>

          {/* ĐỐI TÁC THANH TOÁN & APP */}
          <Grid item xs={12} sm={6} md={4}>
            <Box display={"flex"} justifyContent={isMobile ? "start" : "end"}>
              <Stack
                spacing={3}
                direction={isMobile ? "column" : "column"}
                alignItems={isMobile ? "flex-start" : "start"}>
                {/* ĐỐI TÁC */}
                <Stack spacing={1.5}>
                  <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    {t("footer_payment_partners_title")}
                  </Typography>
                  <Box display={"flex"} gap={2}>
                    <Image
                     
                      src={momo}
                      alt='Momo'
                      style={{
                        width: 40,
                        height: 40,
                        background: "#ddd",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "#999",
                      }}
                    />
                    <Image
                     
                      src={vnpay}
                      alt='Momo'
                      style={{
                        width: 40,
                        height: 40,
                        background: "#ddd",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "#999",
                      }}
                    />
                  </Box>
                </Stack>

                {/* TẢI ỨNG DỤNG */}
                <Stack spacing={1.5}>
                  <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    {t("footer_download_app_title")}
                  </Typography>
                  <Box display={"flex"} gap={2}>
                    <Image
                     
                      src={app}
                      alt='App Store'
                      style={{
                        background: "#000",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />

                    <Image
                      
                      src={app1}
                      alt='Google Play'
                      style={{
                        background: "#000",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* DIVIDER */}
        <Divider sx={{ my: 3, bgcolor: "#eee" }} />

        {/* COPYRIGHT & LINKS */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent='space-between'
          alignItems='center'
          spacing={1}
          textAlign={{ xs: "center", sm: "left" }}>
          <Typography suppressHydrationWarning  fontSize='0.85rem' color='#999'>
            {t("footer_copyright")}
          </Typography>
          <Stack direction='row' spacing={2}>
            <Link href='#' underline='hover' color='#666' fontSize='0.85rem'>
              {t("footer_terms")}
            </Link>
            <Link href='#' underline='hover' color='#666' fontSize='0.85rem'>
              {t("footer_privacy")}
            </Link>
            <Link href='#' underline='hover' color='#666' fontSize='0.85rem'>
              {t("footer_cookie")}
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
