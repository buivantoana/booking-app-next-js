"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Button,
  Divider,
  Container,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import ShareIcon from "@mui/icons-material/Share";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import RoomList from "./RoomList";

import HotelDetailInfo from "./HotelDetailInfo";
import ListRoom from "../home/ListRoom";
import SearchBarWithDropdown from "../../components/SearchBarWithDropdownHeader";
import { getLocation } from "../../service/hotel";

import { Phone } from "@mui/icons-material";
import { toast } from "react-toastify";

import { usePathname } from "@/translation/navigation";
import { useTranslations } from "next-intl";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const DetailRoomView = ({
  detailHotel,
  loading,
  recommend,
  reviews,
  getReviewHotel,
  hastag,
  amenities,
  rooms,
  attribute,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const t = useTranslations();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const location = usePathname();
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    let ref;
    switch (newValue) {
      case 0:
        ref = section1Ref;
        break;
      case 1:
        ref = section2Ref;
        break;
      case 2:
        ref = section3Ref;
        break;
      case 3:
        ref = section4Ref;
        break;
      case 4:
        ref = section5Ref;
        break;
      case 5:
        ref = section6Ref;
        break;

      default:
        break;
    }
    handleScroll(ref);
    setTabValue(newValue);
  };

  const tabs = [
    t("tab_room_list"),
    t("tab_hotel_intro"),
    t("tab_amenities"),
    t("tab_reviews"),
    t("tab_checkin_policy"),
    t("tab_hotel_policy"),
  ];
  const handleScroll = (ref) => {
    if (!ref.current) return;

    const top = ref.current.getBoundingClientRect().top + window.pageYOffset;

    window.scrollTo({
      top: top - 150, // ⬅️ lùi lên 200px
      behavior: "smooth",
    });
  };
  const openMap = (lat, lon) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, "_blank");
  };
  const [locationAddress, setLocationAddress] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (location == "/rooms") {
          let result = await getLocation();
          console.log("AAA location", result);
          if (result?.locations) {
            setLocationAddress(result?.locations);
          }
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [location]);
  const handleShare = async () => {
    try {
      const url = window.location.href;

      await navigator.clipboard.writeText(url);

      toast.success(t("share_copied_success"));
    } catch (err) {
      toast.error(t("share_copied_error"));
    }
  };
  return (
    <Box sx={{ bgcolor: "#f9f9f9", py: { xs: 2, md: 4 } }}>
      {isMobile && <SearchBarWithDropdown locationAddress={locationAddress} />}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={detailHotel?.hotel?.images.map((src) => ({ src }))}
      />
      <Container maxWidth='lg'>
        <Stack spacing={3} sx={{}}>
          {/* HEADER INFO */}
          {loading ? (
            <Stack spacing={2}>
              <Skeleton width='60%' height={40} />
              <Skeleton width='40%' height={24} />
              <Skeleton width='30%' height={20} />
            </Stack>
          ) : (
            <Stack>
              <Typography
                suppressHydrationWarning
                fontWeight={700}

                fontSize={{ xs: "1.25rem", md: "1.5rem" }}
                color='#333'>
                {detailHotel?.hotel?.name?.vi || detailHotel?.hotel?.name?.en}
              </Typography>
              <Stack direction='row' alignItems='center' spacing={1} mt={0.5}>
                <LocationOnIcon sx={{ fontSize: 18, color: "#98b720" }} />
                <Typography
                  suppressHydrationWarning
                  fontSize='0.9rem'
                  color='#666'>
                  {detailHotel?.hotel?.address?.vi ||
                    detailHotel?.hotel?.address?.en}
                </Typography>
                <Typography
                  suppressHydrationWarning
                  onClick={() =>
                    openMap(
                      detailHotel?.hotel?.latitude,
                      detailHotel?.hotel?.longitude
                    )
                  }
                  fontSize='0.85rem'
                  color='#98b720'
                  sx={{ cursor: "pointer", textDecoration: "underline" }}>
                  {t("view_map")}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' spacing={1} mt={1}>
                <Stack direction='row' alignItems='center' spacing={0.5}>
                  <StarIcon sx={{ fontSize: 18, color: "#98b720" }} />
                  <Typography
                    suppressHydrationWarning
                    fontWeight={600}
                    color='#98b720'
                    fontSize='0.9rem'>
                    {detailHotel?.hotel?.rating}
                  </Typography>
                  <Typography
                    suppressHydrationWarning
                    fontSize='0.85rem'
                    color='#666'>
                    ({detailHotel?.hotel?.review_count || 0}{" "}
                    {t("reviews_count")})
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1 }} />
                <Button
                  onClick={handleShare}
                  startIcon={<ShareIcon sx={{ fontSize: 18 }} />}
                  size='small'
                  sx={{ textTransform: "none", color: "#666" }}></Button>
              </Stack>
              {detailHotel?.hotel?.phone && (
                <Stack direction='row' alignItems='center' spacing={1} mt={1}>
                  <Phone sx={{ fontSize: 18, color: "#98b720" }} />
                  <Typography
                    suppressHydrationWarning
                    fontSize='0.9rem'
                    color='#666'>
                    {detailHotel?.hotel?.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}

          {/* TABS */}
          {false ? (
            <Stack direction='row' spacing={2} overflow='auto' pb={1}>
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  width={120}
                  height={36}
                  sx={{ borderRadius: "12px" }}
                />
              ))}
            </Stack>
          ) : (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant='scrollable'
              scrollButtons={false}
              sx={{
                position: "sticky",
                top: isMobile ? 70 : 80,
                background: "#f9f9f9",
                borderBottom: "1px solid #ccc",
                zIndex: "35",
                "& .MuiTabs-indicator": {
                  bgcolor: "#98b720",
                  height: 3,
                  borderRadius: "2px",
                },
              }}>
              {tabs.map((label, i) => (
                <Tab
                  key={i}
                  label={label}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.9rem",
                    color:
                      tabValue === i
                        ? "rgba(152, 183, 32, 1) !important"
                        : "#666",
                    fontWeight: tabValue === i ? 600 : 400,
                    minHeight: 48,
                  }}
                />
              ))}
            </Tabs>
          )}

          {/* IMAGE GALLERY */}
          {loading ? (
            <Grid container>
              {/* Ảnh lớn */}
              <Grid item xs={12} pr={"20px"} md={6}>
                <Skeleton
                  variant='rectangular'
                  height={300}
                  sx={{ borderRadius: "16px" }}
                />
              </Grid>
              {/* 4 ảnh nhỏ */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {[...Array(4)].map((_, i) => (
                    <Grid item xs={6} key={i}>
                      <Skeleton
                        variant='rectangular'
                        height={144}
                        sx={{ borderRadius: "16px" }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ position: "relative" }}>
              <Grid container spacing={2}>
                {/* Ảnh lớn */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: { xs: 240, md: 360 },
                      borderRadius: "16px",
                      overflow: "hidden",
                      position: "relative",
                    }}>
                    <img
                      src={detailHotel?.hotel?.images?.[0]}
                      alt='main'
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Grid>

                {/* 4 ảnh nhỏ */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    {detailHotel?.hotel?.images?.slice(1, 5)?.map((img, i) => (
                      <Grid item xs={6} key={i}>
                        <Box
                          sx={{
                            height: { xs: 116, md: 176 },
                            borderRadius: "16px",
                            overflow: "hidden",
                            position: "relative",
                          }}>
                          <img
                            src={img}
                            alt={`room ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {i === 3 &&
                            detailHotel?.hotel?.images?.length > 4 && (
                              <Box
                                onClick={() => setLightboxOpen(true)}
                                sx={{
                                  position: "absolute",
                                  inset: 0,

                                  display: "flex",
                                  alignItems: "end",
                                  justifyContent: "end",
                                  borderRadius: "16px",
                                  cursor: "pointer",
                                  m: "10px",
                                }}>
                                <Chip
                                  icon={
                                    <PhotoLibraryIcon
                                      sx={{
                                        color: "white !important",
                                        fontSize: "15px",
                                      }}
                                    />
                                  }
                                  label={`${detailHotel?.hotel?.images?.length}+`}
                                  sx={{
                                    bgcolor: "rgba(0, 0, 0, 0.6)",
                                    color: "white",

                                    fontSize: "0.8rem",
                                    p: "10px 6px",
                                  }}
                                />
                              </Box>
                            )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAB CONTENT - GIỮ NGUYÊN (có thể mở rộng sau) */}
          {/* <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Stack spacing={3}>
                {[...Array(3)].map((_, i) => (
                  <Paper key={i} sx={{ p: 3, borderRadius: "16px" }}>
                    <Skeleton width='70%' height={32} />
                    <Skeleton width='50%' height={24} mt={1} />
                    <Skeleton width='100%' height={80} mt={2} />
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography suppressHydrationWarning  color='#666'>
                Nội dung danh sách phòng sẽ được hiển thị ở đây...
              </Typography>
            )}
          </TabPanel> */}
          <RoomList
            loading={loading}
            hotel={detailHotel?.hotel || {}}
            data={rooms || []}
            section1Ref={section1Ref}
            amenities={amenities}
            attribute={attribute}
          />
          <HotelDetailInfo
            info={detailHotel?.hotel || {}}
            getReviewHotel={getReviewHotel}
            reviews={reviews}
            hastag={hastag}
            section2Ref={section2Ref}
            section3Ref={section3Ref}
            section4Ref={section4Ref}
            section5Ref={section5Ref}
            section6Ref={section6Ref}
            amenities={amenities}
          />
          <ListRoom
            loading={loading}
            title={t("exclusive_offers")}
            data={recommend}
            isDetail={true}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default DetailRoomView;
