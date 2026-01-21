// src/components/ListRoom.tsx
'use client';

import {
  Box,
  IconButton,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { ChevronLeft, ChevronRight, Star } from "@mui/icons-material";
import dynamic from 'next/dynamic';

// Dynamic import Slider, tắt SSR
const Slider = dynamic(() => import('react-slick'), {
  ssr: false,           // Quan trọng nhất: tắt server-side render
  loading: () =>  <ListRoomLoading />, // Optional: loading placeholder
});
import Image from 'next/image';
import image_room from "@/images/Rectangle 29975.png";
import tag from "@/images/Tag.png";
import { useRouter } from 'next/navigation';


// ==================== HELPER NHỎ ====================
const parseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
};

const getFirstImage = (imagesStr: string) => {
  try {
    const arr = JSON.parse(imagesStr);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : image_room;
  } catch {
    return image_room;
  }
};
// =====================================================

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        left: { xs: 8, md: "-20px" },
        top: "50%",
        transform: "translateY(-50%)",
        bgcolor: "white",
        width: 48,
        height: 48,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10,
        "&:hover": { bgcolor: "#f5f5f5" },
      }}>
      <ChevronLeft sx={{ color: "#333", fontSize: 28 }} />
    </IconButton>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        right: { xs: 8, md: "-20px" },
        top: "50%",
        transform: "translateY(-50%)",
        bgcolor: "white",
        width: 48,
        height: 48,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10,
        "&:hover": { bgcolor: "#f5f5f5" },
      }}>
      <ChevronRight sx={{ color: "#333", fontSize: 28 }} />
    </IconButton>
  );
};

// ==================== HOTEL CARD (chỉ nhận props) ====================
const HotelCard = ({
  image,
  hotelName,
  hotelAddress,
  rating,
  price,
  id,
  reviewCount,
}: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Card
      elevation={3}
      onClick={() => {
        const current = Object.fromEntries([]);

        // ---- xử lý mặc định ---- //
        const now = new Date();

        // format yyyy-MM-dd
        const formatDate = (d) => d.toISOString().split("T")[0];

        // format lên giờ chẵn
        const formatHour = (d) => {
          let hour = d.getHours();
          let minute = d.getMinutes();

          // round up: nếu phút > 0 thì cộng 1 giờ
          if (minute > 0) hour++;

          // format HH:00 (VD: 09:00, 20:00)
          return `${String(hour).padStart(2, "0")}:00`;
        };

        // Set mặc định nếu param không có
        current.checkIn = current.checkIn || formatDate(now);
        current.checkOut = current.checkOut || formatDate(now);
        current.checkInTime = current.checkInTime || formatHour(now);
        current.duration = current.duration || 2;
        current.type = "hourly";

        // ---- build URL ---- //
        router.push(
          `/room/${id}?${new URLSearchParams(
            current
          ).toString()}&name=${hotelName}`
        );
      }}
      sx={{
        borderRadius: "14px",
        overflow: "hidden",
        mx: "auto",
        bgcolor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
        },
        padding: "10px",
        position: "relative",
        cursor: "pointer",
      }}>
      {/* Badge "Đăng tin cậy" */}
      <Box sx={{ position: "absolute", top: 10, left: 30, zIndex: 2 }}>
        <Image src={tag}  alt='' />
      </Box>

      {/* Ảnh phòng */}
      <div style={{ position: 'relative', width: '100%', height: isMobile ? 200 : 240 }}>
      <Image
       
        src={image || image_room}
        alt={hotelName}
        fill
        
        style={{
          objectFit: "cover",
          borderRadius: "14px",
        }}
      />
</div>
      <CardContent sx={{ p: { xs: 2, sm: 1 } }}>
        <Stack spacing={1}>
          {/* Tên khách sạn */}
          <Typography suppressHydrationWarning 
            variant='h6'
            fontWeight='bold'
            color='#333'
            sx={{
              fontSize: { xs: "1rem", sm: "18px" },
              lineHeight: 1.3,
            }}>
            {hotelName || "Hoàng gia Luxury hotel"}
          </Typography>

          {/* Địa chỉ */}
          <Typography suppressHydrationWarning 
            variant='body2'
            color='#666'
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}>
            {hotelAddress || "Cầu Giấy, Hà Nội"}
          </Typography>

          {/* Rating */}
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Star sx={{ color: "#ffb300", fontSize: 18 }} />
            <Typography suppressHydrationWarning 
              variant='body2'
              fontWeight='bold'
              color='#333'
              sx={{ fontSize: "0.9rem" }}>
              {rating || 4.9}
            </Typography>
            <Typography suppressHydrationWarning 
              variant='caption'
              color='#999'
              sx={{ ml: 0.5, fontSize: "0.8rem" }}>
              ({reviewCount})
            </Typography>
          </Stack>

          {/* Giá */}
          <Stack
            direction='row'
            alignItems='baseline'
            spacing={0.5}
            sx={{ mt: 1.5 }}>
            <Typography suppressHydrationWarning  variant='caption' color='#999' sx={{ fontWeight: 500 }}>
              {t("from_only")}
            </Typography>
            <Typography suppressHydrationWarning 
              variant='h6'
              fontWeight='bold'
              color='#EA6A00'
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                lineHeight: 1,
              }}>
              {price ? `${price.toLocaleString("vi-VN")}đ` : "160.000đ"}
            </Typography>
            <Typography suppressHydrationWarning  variant='body2' color='#666'>
              {t("per_2_hours")}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ==================== LIST ROOM CHÍNH ====================
const ListRoom = ({
  title,
  isDetail,
  data,
  loading,
  category,
  location,
}: {
  title: string;
  isDetail?: boolean;
  data: any[];
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 900,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1, centerMode: true, centerPadding: "40px" },
      },
    ],
  };

  console.log("AAAA data",data)
  return (
    <Box mt={isDetail ? 0 : category == "recommend"?-7:5}>
      {loading ? (
        <ListRoomLoading />
      ) : (
        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}>
            {isDetail ? (
              <Typography suppressHydrationWarning 
                variant='h4'
                fontWeight={"500"}
                fontSize={isDetail ? "1.1rem" : "36px"}>
                {title}
              </Typography>
            ) : (
              <Typography suppressHydrationWarning 
                variant='h4'
                fontWeight='bold'
                color='#333'
                sx={{
                  fontSize: { xs: "1.2rem", md: "1.875rem" },
                }}>
                {title}
              </Typography>
            )}
            {!isDetail && (
              <Typography suppressHydrationWarning 
                onClick={() => {
                  router.push(`/rooms?category=${category}&location=${location}`);
                }}
                sx={{ cursor: "pointer" }}
                color='rgba(152, 159, 173, 1)'
                fontSize={"15px"}>
                {t("view_all")}{" "}
                <ArrowForwardIosIcon sx={{ fontSize: "12px" }} />
              </Typography>
            )}
          </Box>

          <Box>
            <Slider {...settings}>
              {data.map((hotel) => {
                const nameObj = parseJson(hotel.name);
                const name = nameObj?.vi || nameObj?.en || "Khách sạn";

                const addressObj = parseJson(hotel.address);
                const address = addressObj?.en || addressObj?.vi || "";

                const firstImage = getFirstImage(hotel.images);

                return (
                  <Box
                    key={hotel.id}
                    sx={{ display: "flex", justifyContent: "end" }}>
                    <Box width={"95%"} py={4} pl={0.8} pr={2}>
                      <HotelCard
                        image={firstImage}
                        hotelName={name}
                        hotelAddress={address}
                        rating={hotel.rating}
                        price={hotel.price_min["hourly"]}
                        id={hotel.id}
                        reviewCount={hotel.review_count}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Slider>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ListRoom;

import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

const HotelCardSkeleton = () => {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: "14px",
        overflow: "hidden",
        mx: "auto",
        bgcolor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
        },
        padding: "10px",
        position: "relative",
      }}>
      {/* Badge "Đăng tin cậy" – vẫn hiện khi loading */}

      {/* Ảnh loading */}
      <Skeleton
        variant='rectangular'
        height={180}
        sx={{
          borderRadius: "14px",
          bgcolor: "grey.200",
        }}
      />

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.5}>
          {/* Tên khách sạn */}
          <Skeleton
            variant='text'
            width='80%'
            height={32}
            sx={{ bgcolor: "grey.200" }}
          />

          {/* Địa chỉ */}
          <Skeleton
            variant='text'
            width='65%'
            height={24}
            sx={{ bgcolor: "grey.200" }}
          />

          {/* Rating */}
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Skeleton
              variant='circular'
              width={18}
              height={18}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant='text'
              width={40}
              height={24}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant='text'
              width={50}
              height={20}
              sx={{ bgcolor: "grey.200" }}
            />
          </Stack>

          {/* Giá */}
          <Stack
            direction='row'
            alignItems='baseline'
            spacing={0.5}
            sx={{ mt: 1.5 }}>
            <Skeleton
              variant='text'
              width={60}
              height={20}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant='text'
              width={90}
              height={36}
              sx={{ bgcolor: "grey.200" }}
            />
            <Skeleton
              variant='text'
              width={60}
              height={24}
              sx={{ bgcolor: "grey.200" }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// === Dùng trong ListRoom khi đang loading (4 item) ===
const ListRoomLoading = () => {
  const dummy = [1, 2, 3, 4];

  return (
    <Box>
      {/* Header title loading */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}>
        <Skeleton
          variant='text'
          width='35%'
          height={48}
          sx={{ bgcolor: "grey.200" }}
        />
        <Skeleton
          variant='text'
          width={100}
          height={32}
          sx={{ bgcolor: "grey.200" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflow: "hidden",
          justifyContent: "space-between",
        }}>
        {dummy.map((i) => (
          <Box
            key={i}
            sx={{ flex: "0 0 calc(25% - 16px)", maxWidth: "calc(25% - 16px)" }}>
            <Box width='98%' py={4} pl={0.8} pr={2}>
              <HotelCardSkeleton />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
