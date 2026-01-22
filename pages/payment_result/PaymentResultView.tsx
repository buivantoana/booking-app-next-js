"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Container,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
} from "@mui/material";
import {
  Home as HomeIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import success from "../../images/Frame 1321317962.png";
import failed from "../../images/Frame 1321317963.png";
import pending from "../../images/pending.png";
import pendingpayment from "../../images/pendingpayment.png";
import cancel from "../../images/cancel.png";
import image_room from "../../images/Rectangle 29975.png";

import { useRouter, useSearchParams } from "next/navigation"; // Thay thế react-router-dom
import { getStatusPayment } from "../../service/payment";
import dayjs from "dayjs";
import { useBookingContext } from "@/lib/context"; // Update path
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocale, useTranslations } from "next-intl"; // Thay thế react-i18next
import Image from "next/image"; // Thêm Image từ Next.js

const PaymentResultView = ({ getDetail, loadingDetail, detailBooking }) => {
  const t = useTranslations(); // Thay thế useTranslation()
  const locale = useLocale(); // Thêm locale nếu cần
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter(); // Thay thế useNavigate()
  const searchParams = useSearchParams(); // Thay thế useLocation()

  // Lấy data từ localStorage hoặc query params
  const [data, setData] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // Lấy data từ localStorage
    const bookingData = localStorage.getItem("booking");
    if (bookingData) {
      const parsedData = JSON.parse(bookingData);
      setData(parsedData);
      setPaymentId(parsedData?.payment?.payment_id);
    }
    
    // Hoặc lấy từ query params nếu có
    const bookingId = searchParams.get("booking_id");
    if (bookingId) {
      // Fetch booking data từ API nếu cần
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Format time
  let startTime = "";
  let endTime = "";
  let checkInDate = "";
  let checkOutDate = "";

  if (data?.type === "hourly") {
    const inTime = data.checkInTime && data.checkInTime !== "null" ? data.checkInTime : "00:00";
    const duration = Number(data.duration || 0);
    const start = dayjs(`${data.checkIn} ${inTime}`, "YYYY-MM-DD HH:mm");
    const end = start.add(duration, "hour");

    startTime = start.format("HH:mm");
    endTime = end.format("HH:mm");
    checkInDate = start.format("YYYY-MM-DD");
    checkOutDate = end.isSame(start, "day") ? checkInDate : end.format("YYYY-MM-DD");
  } else if (data) {
    const start = dayjs(data?.check_in);
    const end = dayjs(data?.check_out);
    startTime = start.format("HH:mm");
    endTime = end.format("HH:mm");
    checkInDate = start.format("YYYY-MM-DD");
    checkOutDate = end.format("YYYY-MM-DD");
  }

  const timeDisplay =
    data?.type === "hourly"
      ? `${startTime} – ${endTime}, ${checkInDate}${checkOutDate !== checkInDate ? ` → ${checkOutDate}` : ""}`
      : `${startTime} – ${endTime}, ${checkInDate} → ${checkOutDate}`;

  const cancelBefore = `${startTime}, ${checkInDate}`;

  // Auto check payment status
  useEffect(() => {
    if (!paymentId) {
      // setPaymentStatus("failed");
      // setLoading(false);
      return;
    }

    let count = 0;
    const checkPayment = async () => {
      try {
        const result = await getStatusPayment(paymentId);
        const status = result?.status;

        if (status === "failed" || status === "paid") {
          clearInterval(interval);
          setPaymentStatus(status === "paid" ? "paid" : "failed");
          setLoading(false);
          return;
        }

        count++;
        if (count >= 30) {
          clearInterval(interval);
          setPaymentStatus("failed");
          setLoading(false);
        }
      } catch (e) {
        console.log("ERR", e);
      }
    };

    checkPayment();
    const interval = setInterval(checkPayment, 2000);
    return () => clearInterval(interval);
  }, [paymentId]);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleViewBookingDetail = () => {
    // Logic để xem chi tiết booking
    if (data?.booking_id) {
      getDetail(data.booking_id);
    } else {
      router.push(`/${locale}/profile?type=booking`);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
      {detailBooking && (
        <Container maxWidth="lg">
          <MainContent 
            navigate={router} 
            detailBooking={detailBooking} 
            locale={locale}
          />
        </Container>
      )}

      {!detailBooking && (
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ borderRadius: "24px", bgcolor: "white", p: { xs: 3, sm: 4 }, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <Stack spacing={3} alignItems="center">
              {loading ? (
                <>
                  <CircularProgress sx={{ color: "#98b720" }} />
                  <Typography fontSize="0.9rem" color="#666">
                    {t("payment_verifying")}
                  </Typography>
                </>
              ) : paymentStatus === "failed" ? (
                <>
                  <Typography color="red" fontSize="1.2rem" fontWeight={600}>
                    {t("payment_failed_title")}
                  </Typography>
                  <Typography color="#666">
                    {t("payment_failed_desc")}
                  </Typography>
                </>
              ) : (
                <>
                  <Box sx={{ position: "relative", width: 90, height: 90 }}>
                    <Image
                      src={paymentStatus === "failed" ? failed : success}
                      alt={paymentStatus === "failed" ? t("payment_failed") : t("payment_failed_title")}
                      fill
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </Box>

                  <Typography
                    fontWeight={700}
                    fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
                    color={paymentStatus === "failed" ? "#FF3030" : "rgba(152, 183, 32, 1)"}
                  >
                    {paymentStatus === "failed" ? t("booking_failed_title") : t("booking_success_title")}
                  </Typography>

                  <Typography fontSize="0.9rem" color="#666" lineHeight={1.5}>
                    {paymentStatus === "failed" ? t("booking_failed_desc") : t("booking_success_desc")}{" "}
                    <strong>{data?.name}</strong>
                  </Typography>

                  <Paper elevation={0} sx={{ bgcolor: "#f5f5f5", borderRadius: "16px", p: isMobile ? 1 : 2.5, width: "100%", textAlign: "left" }}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 36, height: 36 }}>
                          <HomeIcon sx={{ fontSize: 20, color: "#666" }} />
                        </Box>
                        <Typography fontSize="0.95rem" color="#666" fontWeight={600}>
                          {t("room_quantity", { quantity: data?.rooms[0]?.quantity || 1 })}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 36, height: 36 }}>
                          <TimeIcon sx={{ fontSize: 20, color: "#666" }} />
                        </Box>
                        <Typography fontSize="0.9rem" color="#333">
                          {timeDisplay}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 36, height: 36 }}>
                          <LocationIcon sx={{ fontSize: 20, color: "#666" }} />
                        </Box>
                        <Typography fontSize="0.9rem" color="#333">
                          {t("payment_method", { method: data?.payment?.method?.toUpperCase() || "PAY_AT_HOTEL" })}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 36, height: 36 }}>
                          <InfoIcon sx={{ fontSize: 20, color: "#666" }} />
                        </Box>
                        <Typography fontSize="0.9rem" color="#333">
                          {t("free_cancel_before", { time: cancelBefore })}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </>
              )}

              {!loading && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} width="100%" mt={2}>
                  <Button 
                    fullWidth 
                    onClick={handleBackToHome} 
                    variant="text" 
                    sx={{ color: "#666", fontWeight: 600, textTransform: "none", fontSize: "0.95rem" }}
                  >
                    {t("back_to_home")}
                  </Button>

                  <Button
                    onClick={handleViewBookingDetail}
                    fullWidth
                    disabled={loadingDetail}
                    variant="contained"
                    sx={{
                      bgcolor: "#98b720",
                      color: "white",
                      borderRadius: "50px",
                      fontWeight: 600,
                      textTransform: "none",
                      py: 1.5,
                      fontSize: "0.95rem",
                      boxShadow: "0 4px 12px rgba(152, 183, 32, 0.3)",
                      "&:hover": { bgcolor: "#7a9a1a" },
                    }}
                  >
                    {loadingDetail ? <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} /> : t("view_booking_detail")}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Container>
      )}
    </Box>
  );
};

const MainContent = ({ detailBooking, navigate, locale }) => {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!detailBooking) return null;

  const hotelName = JSON.parse(detailBooking.hotel_name)?.[locale] || 
                   JSON.parse(detailBooking.hotel_name)?.vi || 
                   JSON.parse(detailBooking.hotel_name)?.en || 
                   t("hotel");
  const hotelAddress = JSON.parse(detailBooking.hotel_address)?.[locale] || 
                      JSON.parse(detailBooking.hotel_address)?.vi || 
                      JSON.parse(detailBooking.hotel_address)?.en || 
                      t("no_address");

  const roomImages = detailBooking.rooms[0]?.images || [];
  const roomThumbnail = roomImages[0] || detailBooking.thumbnail_url;

  const formatDateTime = (isoString) => dayjs(isoString).format("HH:mm, D/M");
  const checkInTime = formatDateTime(detailBooking.check_in);
  const checkOutTime = formatDateTime(detailBooking.check_out);

  const getDurationLabel = () => {
    if (detailBooking.rent_type === "hourly") {
      const hours = dayjs(detailBooking.check_out).diff(dayjs(detailBooking.check_in), "hour");
      return `${hours < 10 ? "0" + hours : hours} ${t("hours")}`;
    }
    if (detailBooking.rent_type === "overnight") return `01 ${t("night")}`;
    if (detailBooking.rent_type === "daily") {
      const days = dayjs(detailBooking.check_out).diff(dayjs(detailBooking.check_in), "day");
      return `${days} ${t("nights")}`;
    }
    return "01";
  };

  const getRentTypeLabel = () => {
    switch (detailBooking.rent_type) {
      case "hourly": return t("hourly");
      case "overnight": return t("overnight");
      case "daily": return t("daily");
      default: return t("hourly");
    }
  };

  const getPaymentTextStatus = (payments = []) => {
    if (!payments.length) return t("pay_at_hotel");
    const priority = ["paid", "pending", "failed", "cancelled", "refunded"];
    for (const st of priority) {
      const found = payments.find((p) => p.status === st);
      if (found) {
        return t(`payment_status_${found.status}`);
      }
    }
    return t("pay_at_hotel");
  };

  const payments = detailBooking.payments || [];
  const paymentStatus = getPaymentTextStatus(payments);
  const bestPayment = payments.find(p => ["paid", "pending", "failed", "cancelled", "refunded"].includes(p.status)) || {};

  const paymentMethodLabel = bestPayment?.method
    ? bestPayment.method === "momo" ? t("momo")
      : bestPayment.method === "vnpay" ? t("vnpay")
        : t("pay_at_hotel")
    : t("pay_at_hotel");

  const totalPrice = Number(detailBooking.total_price || 0).toLocaleString("vi-VN");

  const handleRebook = () => {
    // Logic rebook
    navigate.push(`/${locale}/search?hotel_id=${detailBooking.hotel_id}`);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography display="flex" alignItems="center" gap={2} fontWeight={600} fontSize="1.1rem" color="#333">
          <ArrowBackIcon 
            onClick={() => navigate.push(`/${locale}`)} 
            sx={{ cursor: "pointer" }} 
          />
          {t("my_bookings")}
        </Typography>
      </Stack>

      {detailBooking.status === "checked_out" && (
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src={success}
                  alt={t("booking_completed")}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Stack>
                <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                  {t("booking_completed")}
                </Typography>
                <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                  {t("booking_completed_desc")}
                </Typography>
              </Stack>
            </Stack>
            <Button 
              onClick={handleRebook}
              variant="contained" 
              sx={{ 
                bgcolor: "#98b720", 
                color: "white", 
                borderRadius: "50px", 
                fontWeight: 600, 
                textTransform: "none", 
                px: 3, 
                py: 1, 
                fontSize: "0.9rem", 
                minWidth: 120, 
                "&:hover": { bgcolor: "#7a9a1a" } 
              }}
            >
              {t("rebook")}
            </Button>
          </Stack>
        </Paper>
      )}

      {detailBooking.status === "confirmed" && bestPayment?.status === "paid" && (
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src={pending}
                  alt={t("awaiting_checkin")}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Stack>
                <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                  {t("awaiting_checkin")}
                </Typography>
                <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                  {t("awaiting_checkin_desc")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      )}

      {detailBooking.status === "pending" && (bestPayment?.status === "failed" || bestPayment?.status === "pending") && (
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src={pendingpayment}
                  alt={t("awaiting_payment")}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Stack>
                <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                  {t("awaiting_payment")}
                </Typography>
                <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                  {t("awaiting_payment_timer", { timer: "00:14:59" })}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      )}

      {detailBooking.status === "cancelled" && (
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: "relative", width: 48, height: 48 }}>
                <Image
                  src={cancel}
                  alt={t("no_show")}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Stack>
                <Typography fontWeight={700} fontSize="1rem" color="red">
                  {t("no_show")}
                </Typography>
                <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                  {t("no_show_desc", { time: "10:00, 04/11/2025" })}
                </Typography>
              </Stack>
            </Stack>
            <Button 
              onClick={handleRebook}
              variant="contained" 
              sx={{ 
                bgcolor: "#98b720", 
                color: "white", 
                borderRadius: "50px", 
                fontWeight: 600, 
                textTransform: "none", 
                px: 3, 
                py: 1, 
                fontSize: "0.9rem", 
                minWidth: 120, 
                "&:hover": { bgcolor: "#7a9a1a" } 
              }}
            >
              {t("rebook")}
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
        <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
          {t("your_selection")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
          <Box sx={{ 
            position: "relative", 
            width: 120, 
            height: 120, 
            bgcolor: "#f0f0f0", 
            borderRadius: "12px", 
            overflow: "hidden", 
            flexShrink: 0 
          }}>
            {roomThumbnail ? (
              <Image
                src={roomThumbnail}
                alt={hotelName}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 120px"
              />
            ) : (
              <Box sx={{ width: 120, height: 120, bgcolor: "#ddd" }} />
            )}
          </Box>

          <Stack spacing={0.5} flex={1}>
            <Typography fontWeight={600} fontSize="0.95rem" color="#333">
              {hotelName}
            </Typography>
            <Typography fontSize="0.9rem" fontWeight={500} color="#333">
              {t("standard_room")}
            </Typography>
            <Typography fontSize="0.8rem" color="#666">
              {hotelAddress}
            </Typography>
          </Stack>

          <Paper elevation={0} sx={{ 
            bgcolor: "#f8fcf8", 
            borderRadius: "12px", 
            p: 1.5, 
            border: "1px solid #98b720", 
            textAlign: "center", 
            width: { xs: "100%", sm: 300 } 
          }}>
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="start" mb={1}>
              <CheckCircle sx={{ fontSize: 16, color: "#98b720" }} />
              <Typography fontSize="0.75rem" color="#98b720" fontWeight={600}>
                {getRentTypeLabel()}
              </Typography>
            </Stack>
            <Divider />
            <Grid container spacing={0.5} mt={1} fontSize="0.7rem">
              <Grid item xs={4}>
                <Typography color="#888" fontSize="0.75rem">{t("check_in")}</Typography>
                <Typography fontWeight={600} color="#333" fontSize="0.8rem">{checkInTime}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ borderLeft: "1px solid #ddd", textAlign: "center" }}>
                <Typography color="#888" fontSize="0.75rem">{t("check_out")}</Typography>
                <Typography fontWeight={600} color="#333" fontSize="0.8rem">{checkOutTime}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ borderLeft: "1px solid #ddd", textAlign: "center" }}>
                <Typography color="#888" fontSize="0.75rem">
                  {detailBooking.rent_type === "daily" ? t("nights") : t("hours")}
                </Typography>
                <Typography fontWeight={600} color="#333" fontSize="0.8rem">{getDurationLabel()}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
        <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
          {t("booking_info")}
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize="0.9rem" color="#666">{t("booking_code")}</Typography>
            <Typography fontWeight={600} color="#333" fontSize="0.95rem">{detailBooking.booking_code}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize="0.9rem" color="#666">{t("contact_phone")}</Typography>
            <Typography fontWeight={600} color="#333" fontSize="0.95rem">
              +84 {detailBooking?.contact_phone?.slice(3) || ""}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontSize="0.9rem" color="#666">{t("contact_name")}</Typography>
            <Typography fontWeight={600} color="#333" fontSize="0.95rem">{detailBooking?.contact_name}</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
        <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
          {t("payment_details")}
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize="0.9rem" color="#666">{t("payment_status")}</Typography>
            <Typography 
              fontWeight={600} 
              color={bestPayment?.status === "paid" ? "#98b720" : "#ff4444"} 
              fontSize="0.95rem"
            >
              {paymentStatus}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize="0.9rem" color="#666">{t("payment_method_label")}</Typography>
            <Typography fontWeight={600} color="#333" fontSize="0.95rem">{paymentMethodLabel}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize="0.9rem" color="#666">{t("room_price")}</Typography>
            <Typography fontWeight={600} color="#333" fontSize="0.95rem">{totalPrice}đ</Typography>
          </Stack>
          <Divider sx={{ bgcolor: "#eee" }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontSize="1rem" fontWeight={700} color="#333">{t("total_payment")}</Typography>
            <Typography fontSize="1.1rem" fontWeight={700} color="#333">{totalPrice}đ</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PaymentResultView;