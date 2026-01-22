// app/checkout/CheckOutView.tsx  (hoặc đặt ở components/checkout/CheckOutView.tsx tùy dự án)

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  AccessTime,
  ArrowBack as ArrowBackIcon,
  CalendarToday,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  LocalOffer as OfferIcon,
  Nightlight,
} from "@mui/icons-material";

import Flag from "react-country-flag";
import { toast } from "react-toastify";

import imgMain from "@/images/Rectangle 12.png";
import vnpayImg from "@/images/Rectangle 30024 (1).png";
import momoImg from "@/images/Rectangle 30024.png";
import walletImg from "@/images/wallet-3.png";
import buildingImg from "@/images/building.png";

import { createBooking } from "@/service/booking"; // điều chỉnh đường dẫn nếu cần
import { getErrorMessage } from "@/utils/utils";   // điều chỉnh nếu cần
import Image from "next/image";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

interface CheckoutData {
  type?: "hourly" | "overnight" | "daily";
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  duration?: number;
  name?: string;
  address?: string;
  image?: string;
  price?: number;
  room_name?: string;
  hotel_id?: string | number;
  rooms?: any[];
  rent_types?: Record<string, { from: string; to: string }>;
}

interface CheckOutViewProps {
  dataCheckout: CheckoutData | null;
}

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const normalizePhone = (phone: string): string => {
  if (!phone) return "";
  let p = phone.trim().replace(/\D/g, "");
  if (p.startsWith("84")) p = "0" + p.slice(2);
  if (!p.startsWith("0")) p = "0" + p;
  return p;
};

const isValidVietnamPhone = (phone: string): boolean => {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  if (normalized.length !== 9 && normalized.length !== 10) return false;
  return /^0[35789]/.test(normalized);
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export default function CheckOutView({ dataCheckout }: CheckOutViewProps) {
  const t = useTranslations("");
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ── State ───────────────────────────────────────

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "vnpay" | "card" | "hotel">("momo");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const booking = JSON.parse(localStorage.getItem("booking") || "{}");

    const value = (user.phone || booking.phone || "").replace(/^\+84/, "");
    setPhone(value);
    setName(user?.name || "")
  }, []);


  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedName, setTouchedName] = useState(false);

  const [openOfferModal, setOpenOfferModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  // ── Computed / Validation ───────────────────────

  const phoneNormalized = normalizePhone(phone);
  const isPhoneEmpty = phone.trim() === "";
  const phoneError = touchedPhone && (isPhoneEmpty || !isValidVietnamPhone(phone));
  const nameError = touchedName && name.trim() === "";

  const {
    type = "hourly",
    checkIn,
    checkOut,
    checkInTime = "10:00",
    duration = 2,
    name: hotelName = "Khách sạn",
    address = "Chưa có địa chỉ",
    image,
    price = 0,
    room_name = "",
    rent_types = {},
  } = dataCheckout || {};

  const totalPrice = Number(price).toLocaleString("vi-VN") + "đ";

  // ── Format hiển thị ────────────────────────────

  const getBookingTypeLabel = () => {
    const map: Record<string, string> = {
      hourly: "booking_type_hourly",
      overnight: "booking_type_overnight",
      daily: "booking_type_daily",
    };
    return t(map[type] || "booking_type_hourly");
  };

  const getBookingTypeIcon = () => {
    const map = {
      hourly: <AccessTime sx={{ fontSize: 18, color: "#98b720" }} />,
      overnight: <Nightlight sx={{ fontSize: 18, color: "#98b720" }} />,
      daily: <CalendarToday sx={{ fontSize: 18, color: "#98b720" }} />,
    };
    return map[type] || map.hourly;
  };

  const getCheckInDisplay = () => {
    if (!checkIn) return t("search_bar_not_selected");
    const cfg = rent_types[type];
    if (!cfg) return t("search_bar_not_selected");

    const time = checkInTime && checkInTime !== "null" ? checkInTime : cfg.from || "00:00";
    return `${time}, ${dayjs(checkIn).format("D/M")}`;
  };

  const getCheckOutDisplay = () => {
    const cfg = rent_types[type];
    if (!cfg) return t("search_bar_not_selected");

    if (type === "hourly" && checkIn) {
      const time = checkInTime && checkInTime !== "null" ? checkInTime : cfg.from || "00:00";
      const [h, m] = time.split(":").map(Number);
      const start = dayjs(checkIn).hour(h).minute(m).second(0);
      const end = start.add(Number(duration), "hour");
      return `${end.format("HH:mm")}, ${end.format("D/M")}`;
    }

    // overnight & daily
    let endDate = checkOut || dayjs(checkIn).add(1, "day").format("YYYY-MM-DD");
    const [h, m] = (cfg.to || "12:00").split(":").map(Number);
    const end = dayjs(endDate).hour(h).minute(m).second(0);
    return `${end.format("HH:mm")}, ${end.format("D/M")}`;
  };

  const getDurationDisplay = () => {
    if (type === "hourly") return String(duration).padStart(2, "0");
    if (type === "overnight") return "01 đêm";
    if (type === "daily" && checkIn && checkOut) {
      const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
      return String(nights).padStart(2, "0");
    }
    return "01";
  };

  // ── Booking creation ────────────────────────────

  const handleCreateBooking = async () => {
    if (!dataCheckout) {
      toast.error(t("missing_booking_info"));
      return;
    }

    setLoading(true);

    try {
      const formatDateTime = (date?: string, time = "00:00") => {
        if (!date) return null;
        const [hh, mm] = time.split(":").map(Number);
        return dayjs(date).hour(hh).minute(mm).second(0).format("YYYY-MM-DD HH:mm:ss");
      };

      const cfg = rent_types[type] || {};
      const checkInTimeUsed = checkInTime && checkInTime !== "null" ? checkInTime : cfg.from || "00:00";

      const checkInFull = formatDateTime(checkIn, checkInTimeUsed);

      let checkOutFull: string | null = null;

      if (type === "hourly") {
        checkOutFull = dayjs(checkInFull).add(Number(duration), "hour").format("YYYY-MM-DD HH:mm:ss");
      } else {
        const endDate = checkOut || dayjs(checkIn).add(1, "day").format("YYYY-MM-DD");
        const [h, m] = (cfg.to || "12:00").split(":").map(Number);
        checkOutFull = dayjs(endDate).hour(h).minute(m).second(0).format("YYYY-MM-DD HH:mm:ss");
      }

      const payload = {
        hotel_id: dataCheckout.hotel_id,
        check_in: checkInFull,
        check_out: checkOutFull,
        rent_type: type,
        payment_method: paymentMethod,
        contact_info: {
          full_name: name.trim() || "Khách lẻ",
          phone: phoneNormalized,
          email: "khachle@gmail.com",
        },
        rooms: dataCheckout.rooms || [],
        note: "ghi chú",
      };

      const res = await createBooking(payload);

      if (res?.booking_id) {
        const prev = JSON.parse(localStorage.getItem("booking") || "{}");
        localStorage.setItem("booking", JSON.stringify({ ...prev, ...res }));
        setTimeout(() => router.push("/payment-result"), 300);
      } else {
        toast.error(getErrorMessage(res?.code) || res?.message || t("booking_failed"));
      }
    } catch (err: any) {
      toast.error(err.message || t("booking_failed"));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────

  return (
    <Box sx={{ bgcolor: "#f9f9f9", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header / Back */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: "pointer" }}
            onClick={() => router.back()}
          >
            <IconButton size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography fontWeight={600} fontSize="1.1rem" color="#333">
              {t("checkout_back_hint")}
            </Typography>
          </Stack>

          <Typography variant="h5" fontWeight="bold" textAlign="center">
            {t("confirmation_and_payment")}
          </Typography>

          <Grid container spacing={isMobile ? 0 : 2}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} md={6}>
              {/* Booking Summary Card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  bgcolor: "white",
                  p: 2.5,
                }}
              >
                <Stack spacing={2.5}>
                  {/* Loại thuê + Thời gian */}
                  <Box
                    sx={{
                      bgcolor: "#f0f8f0",
                      border: "1px solid #98b720",
                      borderRadius: 3,
                      p: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                      {getBookingTypeIcon()}
                      <Typography fontSize="0.9rem" fontWeight={600} color="#98b720">
                        {getBookingTypeLabel()}
                      </Typography>
                    </Stack>

                    <Divider />

                    <Grid container mt={1.5} spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="#666">
                          {t("check_in_label")}
                        </Typography>
                        <Typography fontWeight={600} fontSize="0.85rem">
                          {getCheckInDisplay()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ borderLeft: "1px solid #ccc", textAlign: "center" }}>
                        <Typography variant="caption" color="#666">
                          {t("check_out_label")}
                        </Typography>
                        <Typography fontWeight={600} fontSize="0.85rem">
                          {getCheckOutDisplay()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ borderLeft: "1px solid #ccc", textAlign: "center" }}>
                        <Typography variant="caption" color="#666">
                          {type === "daily" ? t("duration_nights") : t("duration_hours")}
                        </Typography>
                        <Typography fontWeight={600} fontSize="0.85rem">
                          {getDurationDisplay()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Your selection */}
                  <Stack spacing={1.5}>
                    <Typography fontWeight={600}>{t("your_selection")}</Typography>
                    <Stack direction="row" spacing={2}>
                      <Image
                        src={image || imgMain}
                        alt="room"
                        width={80}
                        height={80}
                        style={{ borderRadius: 3, objectFit: "cover" }}
                      />
                      <Stack spacing={0.5}>
                        <Typography fontWeight={600} fontSize={16}>
                          {t("hotels")}: {hotelName}
                        </Typography>
                        <Typography fontSize={14} color="text.secondary">
                          {t("room")}: {room_name}
                        </Typography>
                        <Typography fontSize="0.8rem" color="grey.600">
                          {t("address")}: {address}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              {/* Booker Info */}
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  bgcolor: "white",
                  p: 2.5,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600}>{t("booker_info_title")}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => setIsEditing(!isEditing)}
                      sx={{
                        color: "#98b720",
                        opacity: phoneError || nameError ? 0.5 : 1,
                        pointerEvents: phoneError || nameError ? "none" : "auto",
                      }}
                    >
                      {isEditing ? <CheckIcon /> : <EditIcon />}
                    </IconButton>
                  </Stack>

                  {/* Phone */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" sx={{ minWidth: 80 }}>
                      {t("phone_label")}
                    </Typography>
                    <Box sx={{ position: "relative", width: 220 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 20);
                          setPhone(val);
                        }}
                        onBlur={() => setTouchedPhone(true)}
                        error={phoneError}
                        helperText={
                          touchedPhone
                            ? isPhoneEmpty
                              ? t("phone_required")
                              : !isValidVietnamPhone(phone)
                                ? t("phone_invalid")
                                : ""
                            : ""
                        }
                        placeholder={t("phone_placeholder")}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Flag countryCode="VN" svg style={{ width: 24, height: 24 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            ...(isEditing && { borderColor: "#98b720", bgcolor: "#f0f8f0" }),
                          },
                          "& .Mui-disabled": { bgcolor: "transparent", WebkitTextFillColor: "#333" },
                        }}
                      />
                      {isEditing && (
                        <CheckIcon
                          sx={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#98b720",
                            fontSize: 20,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>

                  {/* Name */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" sx={{ minWidth: 80 }}>
                      {t("name_label")}
                    </Typography>
                    <Box sx={{ position: "relative", width: 220 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setTouchedName(true)}
                        error={nameError}
                        helperText={touchedName && name.trim() === "" ? t("name_required") : ""}
                        placeholder={t("name_placeholder")}
                        disabled={!isEditing}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            ...(isEditing && { borderColor: "#98b720", bgcolor: "#f0f8f0" }),
                          },
                          "& .Mui-disabled": { bgcolor: "transparent", WebkitTextFillColor: "#333" },
                        }}
                      />
                      {isEditing && (
                        <CheckIcon
                          sx={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#98b720",
                            fontSize: 20,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {/* Payment Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid #e0e0e0",
                    bgcolor: "white",
                    p: 2.5,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography fontWeight={600}>{t("payment_details_title")}</Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">{t("room_price")}</Typography>
                      <Typography color="text.secondary">{totalPrice}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700} color="#2b2f38">
                        {t("total_payment")}
                      </Typography>
                      <Typography fontWeight={700} fontSize="1.1rem" color="#2b2f38">
                        {totalPrice}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Payment Methods */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid #e0e0e0",
                    bgcolor: "white",
                    p: 2.5,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography fontWeight={600}>{t("payment_method_title")}</Typography>
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                      {[
                        { value: "momo", label: t("payment_momo"), img: momoImg },
                        { value: "vnpay", label: t("payment_vnpay"), img: vnpayImg },
                        { value: "card", label: t("payment_card"), img: walletImg },
                        {
                          value: "hotel",
                          label: t("payment_hotel"),
                          note: t("payment_hotel_note"),
                          img: buildingImg,
                        },
                      ].map((item) => (
                        <Stack
                          key={item.value}
                          direction="row"
                          justifyContent="space-between"
                          alignItems={item.note ? "flex-start" : "center"}
                          sx={{ py: 1, px: 1 }}
                        >
                          <Stack direction="row" spacing={2} alignItems={item.note ? "flex-start" : "center"}>
                            <Image src={item.img} alt="" sx={{ width: 32, height: 32 }} />
                            <Stack>
                              <Typography fontWeight={600}>{item.label}</Typography>
                              {item.note && (
                                <Typography fontSize="0.8rem" color="#999">
                                  {item.note}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                          <Radio value={item.value} size="small" />
                        </Stack>
                      ))}
                    </RadioGroup>
                  </Stack>
                </Paper>

                {/* Cancel policy + Pay button */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  pt={3}
                  spacing={{ xs: 2, sm: 0 }}
                >
                  <Typography
                    fontSize={16}
                    fontWeight={600}
                    sx={{ textDecoration: "underline", cursor: "pointer", color: "#2b2f38" }}
                    onClick={() => setOpenCancelModal(true)}
                  >
                    {t("cancel_policy_title")}
                  </Typography>

                  <Button
                    variant="contained"
                    disabled={loading || phoneError || nameError}
                    onClick={handleCreateBooking}
                    sx={{
                      bgcolor: "#98b720",
                      borderRadius: 50,
                      px: 6,
                      py: 1.8,
                      fontWeight: 600,
                      textTransform: "none",
                      width: { xs: "100%", sm: 282 },
                      "&:hover": { bgcolor: "#7a9a1a" },
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                        {t("paying_button")}
                      </>
                    ) : (
                      t("pay_button")
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>

      {/* ── Modals (giữ nguyên logic, chỉ đổi text) ── */}
      {/* Offer Modal */}
      <Modal open={openOfferModal} onClose={() => setOpenOfferModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 420 },
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: 24,
            p: 3,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography fontWeight={600} fontSize="1.1rem">
              {t("offer_modal_title")}
            </Typography>
            <IconButton onClick={() => setOpenOfferModal(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography color="text.secondary" mb={3}>
            {t("available_offers")}
          </Typography>

          {/* <RadioGroup value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)}>
            {[
              { id: "1", discount: "15K", title: t("offer_title"), desc: t("offer_desc") },
              { id: "2", discount: "15K", title: t("offer_title"), desc: t("offer_desc") },
              { id: "3", discount: "15K", title: t("offer_title"), desc: t("offer_desc") },
            ].map((offer) => (
              <Paper
                key={offer.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 3,
                  bgcolor: selectedOffer === offer.id ? "#f0f8f0" : "white",
                }}
              >
                <FormControlLabel
                  value={offer.id}
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          bgcolor: "#98b720",
                          color: "white",
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {offer.discount}
                      </Box>
                      <Stack>
                        <Typography fontWeight={600} fontSize="0.9rem">
                          {offer.title}
                        </Typography>
                        <Typography fontSize="0.8rem" color="text.secondary">
                          {offer.desc}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                  sx={{ mx: -1.5, width: "100%" }}
                />
              </Paper>
            ))}
          </RadioGroup> */}

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              borderRadius: 50,
              bgcolor: "#f5f5f5",
              color: "#666",
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
            onClick={() => setOpenOfferModal(false)}
          >
            {t("apply_offer")}
          </Button>
        </Box>
      </Modal>

      {/* Cancel Policy Modal */}
      <Modal open={openCancelModal} onClose={() => setOpenCancelModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 680 },
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography fontWeight={600} fontSize="1.1rem">
              {t("cancel_policy_title")}
            </Typography>
            <IconButton onClick={() => setOpenCancelModal(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={2} sx={{ color: "#555", lineHeight: 1.6 }}>
            <Typography>
              {t("cancel_policy_free", {
                date: checkIn ? dayjs(checkIn).format("D/M/YYYY") : t("check_in"),
              })}
            </Typography>
            <Typography>{t("cancel_policy_suggest")}</Typography>

            <Stack direction="row" justifyContent="space-between" mt={3}>
              <Typography fontSize={14}>
                {t("view_more")}{" "}
                <Box component="span" color="#98b720" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                  {t("terms_link")}
                </Box>
              </Typography>
              <Typography fontSize={14}>
                {t("support_prefix")}{" "}
                <Box component="span" color="#98b720" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                  {t("contact_support")}
                </Box>
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}