"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  Button,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Container,
  Modal,
  TextField,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  LocalOffer as OfferIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  AccessTime,
  Nightlight,
  CalendarToday,
} from "@mui/icons-material";
import dayjs from "dayjs";
import imgMain from "../../images/Rectangle 12.png";
import vnpay from "../../images/Rectangle 30024 (1).png";
import momo from "../../images/Rectangle 30024.png";
import wallet from "../../images/wallet-3.png";
import building from "../../images/building.png";
import { createBooking } from "../../service/booking";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/utils";
import Flag from "react-country-flag";
import { useTranslation } from "react-i18next";
const normalizePhone = (phone) => {
  if (!phone) return "";
  let p = phone.trim().replace(/\D/g, "");

  // Nếu bắt đầu bằng 84 → thay thành 0
  if (p.startsWith("84")) {
    p = "0" + p.slice(2);
  }

  // Nếu không có 84 và người dùng không nhập 0 ở đầu → tự thêm 0
  if (!p.startsWith("0")) {
    p = "0" + p;
  }

  return p;
};


const isValidVietnamPhone = (phone) => {
  if (!phone) return false;

  const normalized = normalizePhone(phone);

  // chỉ cho phép đúng 10 hoặc 11 số
  if (normalized.length !== 10 && normalized.length !== 9) return false;

  // đầu số VN hợp lệ
  if (!/^0[35789]/.test(normalized)) return false;

  return true;
};
const CheckOutView = ({ dataCheckout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [openOfferModal, setOpenOfferModal] = useState(false);
  const [openCancelPolicyModal, setOpenCancelPolicyModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(
    JSON.parse(localStorage.getItem("user"))?.phone.replace(/^\+84/, "") ||
      JSON.parse(localStorage.getItem("booking"))?.phone.replace(/^\+84/, "")
  );
  const [name, setName] = useState(
    JSON.parse(localStorage.getItem("user"))?.name
  );
  const {t} = useTranslation()
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [touchedPhone, setTouchedPhone] = useState(false);
const [touchedName, setTouchedName] = useState(false);

const isPhoneEmpty = phone.trim() === "";
const isNameEmpty = name.trim() === "";
const phoneError =
  touchedPhone && (isPhoneEmpty || !isValidVietnamPhone(phone));

const nameError =
  touchedName && isNameEmpty;

  // Dữ liệu từ props
  const {
    type = "hourly",
    checkIn,
    checkOut,
    checkInTime = "10:00",
    duration = 2,
    name: hotelName = "Khách sạn",
    address = "Chưa có địa chỉ",
    image = imgMain, // fallback nếu không có ảnh
    price = 0,
    room_name
  } = dataCheckout || {};

  // Format tiền
  const formattedPrice = Number(price).toLocaleString("vi-VN");

  // Xử lý hiển thị loại phòng + thời gian
  const getBookingTypeLabel = () => {
    if (type === "hourly") return t("booking_type_hourly");
    if (type === "overnight") return t("booking_type_overnight");
    if (type === "daily") return t("booking_type_daily");
    return t("booking_type_hourly");
  };

  const getBookingTypeIcon = () => {
    if (type === "hourly")
      return <AccessTime sx={{ fontSize: 18, color: "#98b720" }} />;
    if (type === "overnight")
      return <Nightlight sx={{ fontSize: 18, color: "#98b720" }} />;
    if (type === "daily")
      return <CalendarToday sx={{ fontSize: 18, color: "#98b720" }} />;
    return <AccessTime sx={{ fontSize: 18, color: "#98b720" }} />;
  };

  // Format ngày + giờ
  const formatCheckIn = () => {
    if (!checkIn) return "Chưa chọn";

    const date = dayjs(checkIn);

    const cfg = dataCheckout?.rent_types?.[dataCheckout?.type];
    if (!cfg) return "Chưa chọn";

    // Nếu không có checkInTime thì dùng config.from
    const usedCheckInTime =
      checkInTime && checkInTime !== "null" ? checkInTime : cfg.from || "00:00";

    return `${usedCheckInTime}, ${dayjs(checkIn).format("D/M")}`;
  };

  const formatCheckOut = () => {
    const cfg = dataCheckout?.rent_types?.[dataCheckout?.type];
    if (!cfg) return "Chưa chọn";

    // ---------- HOURLY ----------
    if (type === "hourly" && checkIn) {
      const usedCheckInTime =
        checkInTime && checkInTime !== "null"
          ? checkInTime
          : cfg.from || "00:00";
      const [hh, mm] = usedCheckInTime.split(":").map(Number);
      const start = dayjs(checkIn).hour(hh).minute(mm).second(0);
      const end = start.add(Number(duration || 0), "hour");
      return `${end.format("HH:mm")}, ${end.format("D/M")}`;
    }

    // ---------- OVERNIGHT ----------
    if (type === "overnight" && checkIn) {
      // nếu FE có checkOut cụ thể thì dùng checkOut + cfg.to (giờ "to")
      if (checkOut) {
        const [toH, toM] = (cfg.to || "12:00").split(":").map(Number);
        const end = dayjs(checkOut).hour(toH).minute(toM).second(0);
        return `${end.format("HH:mm")}, ${end.format("D/M")}`;
      }
      // ngược lại => mặc định +1 ngày và giờ = cfg.to
      const [toH, toM] = (cfg.to || "12:00").split(":").map(Number);
      const end = dayjs(checkIn).add(1, "day").hour(toH).minute(toM).second(0);
      return `${end.format("HH:mm")}, ${end.format("D/M")}`;
    }

    // ---------- DAILY ----------
    if (type === "daily") {
      // nếu FE gửi checkOut => dùng ngày đó + giờ cfg.to
      if (checkOut) {
        const [toH, toM] = (cfg.to || "12:00").split(":").map(Number);
        const end = dayjs(checkOut).hour(toH).minute(toM).second(0);
        return `${end.format("HH:mm")}, ${end.format("D/M")}`;
      }
      // nếu FE không gửi checkOut => mặc định +1 ngày với giờ cfg.to
      const [toH, toM] = (cfg.to || "12:00").split(":").map(Number);
      const end = dayjs(checkIn).add(1, "day").hour(toH).minute(toM).second(0);
      return `${end.format("HH:mm")}, ${end.format("D/M")}`;
    }

    return "Chưa chọn";
  };

  const formatDuration = () => {
    if (type === "hourly")
      return `${duration < 10 ? "0" + duration : duration}`;
    if (type === "overnight") return "01 đêm";
    if (type === "daily" && checkIn && checkOut) {
      const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
      return nights < 10 ? `0${nights}` : nights;
    }
    return "01";
  };

  const offers = [
    {
      id: "1",
      discount: "15K",
      title: "Super sale - quà 50% cho thành viên mới đăng ký",
      desc: "Giảm tới 50% 50k",
    },
    {
      id: "2",
      discount: "15K",
      title: "Super sale - quà 50% cho thành viên mới đăng ký",
      desc: "Giảm tới 50% 50k",
    },
    {
      id: "3",
      discount: "15K",
      title: "Super sale - quà 50% cho thành viên mới đăng ký",
      desc: "Giảm tới 50% 50k",
    },
  ];
  const handleCreateBooking = async () => {
    setLoading(true);

    if (!dataCheckout) {
      alert("Thiếu thông tin đặt phòng!");
      return;
    }

    try {
      const formatFullDateTime = (dateStr, timeStr) => {
        if (!dateStr) return null;
        const [hh, mm] = timeStr.split(":");
        return dayjs(dateStr)
          .hour(Number(hh))
          .minute(Number(mm))
          .second(0)
          .format("YYYY-MM-DD HH:mm:ss");
      };

      const { type } = dataCheckout; // hourly | daily | overnight
      const timeConfig = dataCheckout.rent_types[type];

      // ================================
      // 1) TÍNH CHECK-IN
      // ================================
      let checkInTime =
        dataCheckout.checkInTime && dataCheckout.checkInTime !== "null"
          ? dataCheckout.checkInTime
          : timeConfig.from;

      const checkInDateTime = formatFullDateTime(
        dataCheckout.checkIn,
        checkInTime
      );

      // ================================
      // 2) TÍNH CHECK-OUT
      // ================================
      let checkOutDateTime = null;

      if (type === "hourly") {
        // hourly = +duration giờ tính từ check-in
        checkOutDateTime = dayjs(checkInDateTime)
          .add(Number(dataCheckout.duration), "hour")
          .format("YYYY-MM-DD HH:mm:ss");
      }

      if (type === "daily" || type === "overnight") {
        /**
         * QUY TẮC:
         * FE gửi checkOut (date) → dùng ngày đó
         * FE KHÔNG gửi → +1 ngày
         */

        let checkOutDate = dataCheckout.checkOut;

        if (!checkOutDate) {
          // FE không gửi → +1 ngày
          checkOutDate = dayjs(dataCheckout.checkIn)
            .add(1, "day")
            .format("YYYY-MM-DD");
        }

        const [toH, toM] = timeConfig.to.split(":");

        checkOutDateTime = dayjs(checkOutDate)
          .hour(Number(toH))
          .minute(Number(toM))
          .second(0)
          .format("YYYY-MM-DD HH:mm:ss");
      }

      // ================================
      // 3) TẠO BODY GỬI API
      // ================================
      const body = {
        hotel_id: dataCheckout.hotel_id,
        check_in: checkInDateTime,
        check_out: checkOutDateTime,
        rent_type: dataCheckout.type,
        payment_method: paymentMethod,
        contact_info: {
          full_name: (name && name.trim()) || "Khách lẻ",
          phone: phone.replace(/[^0-9]/g, ""),
          email: "khachle@gmail.com",
        },
        rooms: dataCheckout.rooms || [],
        note: "ghi chú",
      };

      console.log("Gửi booking:", body);

      const result = await createBooking(body);

      if (result?.booking_id) {
        localStorage.setItem(
          "booking",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("booking")),
            ...result,
          })
        );

        setTimeout(() => {
          navigate("/payment-result");
        }, 300);
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
      }
    } catch (error) {
      console.error("Lỗi đặt phòng:", error);
      alert(error.message || "Đặt phòng thất bại, vui lòng thử lại!");
    }

    setLoading(false);
  };



  return (
    <Box sx={{ bgcolor: "#f9f9f9", py: { xs: 2, md: 3 } }}>
      <Container maxWidth='lg'>
        <Stack spacing={3}>
          {/* HEADER */}
          <Stack
            direction='row'
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
            alignItems='center'
            spacing={1}>
            <IconButton size='small'>
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
             { t("checkout_back_hint")}
            </Typography>
          </Stack>

        <Typography suppressHydrationWarning  variant="h5" fontWeight={"bold"} textAlign={"center"}>  { t("confirmation_and_payment")}</Typography>
          <Grid container spacing={isMobile?0:2}>
            {/* CỘT TRÁI */}
            <Grid item xs={12} md={6}>
              {/* BOOKING SUMMARY */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  bgcolor: "white",
                  p: 2.5,
                  border: "1px solid #e0e0e0",
                  height: "max-content",
                }}>
                <Stack spacing={2.5}>
                  {/* LOẠI PHÒNG */}
                  <Box
                    sx={{
                      bgcolor: "#f0f8f0",
                      borderRadius: "12px",
                      p: 2,
                      border: "1px solid #98b720",
                    }}>
                    <Stack
                      direction='row'
                      alignItems='center'
                      spacing={1}
                      mb={1.5}>
                      {getBookingTypeIcon()}
                      <Typography suppressHydrationWarning 
                        fontSize='0.9rem'
                        color='#98b720'
                        fontWeight={600}>
                        {getBookingTypeLabel()}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Grid container mt={1} spacing={1}>
                      <Grid item xs={4}>
                        <Typography suppressHydrationWarning  fontSize='0.75rem' color='#666'>
                        { t("check_in_label")}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='0.85rem'
                          color='#333'>
                          {formatCheckIn()}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        sx={{
                          borderLeft: "1px solid #ccc",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Typography suppressHydrationWarning  fontSize='0.75rem' color='#666'>
                        { t("check_out_label")}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='0.85rem'
                          color='#333'>
                          {formatCheckOut()}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        sx={{
                          borderLeft: "1px solid #ccc",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Typography suppressHydrationWarning  fontSize='0.75rem' color='#666'>
                          {type === "daily" ? "Số đêm" : "Số giờ"}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='0.85rem'
                          color='#333'>
                          {formatDuration()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* LỰA CHỌN CỦA BẠN */}
                  <Stack spacing={2}>
                    <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    { t("your_selection")}
                    </Typography>
                    <Stack direction='row' spacing={2} alignItems='flex-start'>
                      <Box
                        component='img'
                        src={image || imgMain}
                        alt='room'
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "12px",
                          objectFit: "cover",
                        }}
                      />
                      <Stack spacing={0.2}>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='16px'
                          color='rgba(93, 102, 121, 1)'>
                          {t("hotels")} : {hotelName}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontSize='14px'
                          fontWeight={500}
                          color='rgba(93, 102, 121, 1)'>
                          {t("room")} : {room_name}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontSize='0.8rem'
                          color='rgba(152, 159, 173, 1)'>
                          {t("address")} : {address}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              {/* NGƯỜI ĐẶT PHÒNG */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  bgcolor: "white",
                  p: 2.5,
                  border: "1px solid #e0e0e0",
                  mt: 2,
                }}>
                <Stack spacing={2}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'>
                    <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    { t("booker_info_title")}
                    </Typography>
                    <IconButton
                      size='small'

                      onClick={() => setIsEditing(!isEditing)}
                      sx={{ color: "#98b720" , pointerEvents:phoneError || nameError ? "none": "auto",cursor:"pointer",opacity:phoneError || nameError ?.5:1 }}>
                      {isEditing ? <CheckIcon  /> : <EditIcon />}
                    </IconButton>
                  </Stack>

                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'>
                    <Typography suppressHydrationWarning 
                      fontSize='0.9rem'
                      color='#666'
                      sx={{ minWidth: 80 }}>
                      { t("phone_label")}
                    </Typography>

                    <Box sx={{ position: "relative", width: 200 }}>
                      <TextField
                       value={phone}
                       onChange={(e) => {
                         let val = e.target.value.replace(/\D/g, "");
                         if (val.length > 20) val = val.slice(0, 20);
                         setPhone(val);
                       }}
                       onBlur={() => setTouchedPhone(true)}
                       error={phoneError}
                       helperText={
                         touchedPhone && isPhoneEmpty
                           ? t("phone_required")           // "Phone number is required"
                           : touchedPhone && !isValidVietnamPhone(phone)
                           ? t("phone_invalid")            // "Invalid phone number"
                           : ""
                       }
                        placeholder=  { t("phone_placeholder")}
                        variant='outlined'
                        size='small'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}>
                                <Flag
                                  countryCode='VN'
                                  svg
                                  style={{ width: 24, height: 24 }}
                                />
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                        disabled={!isEditing}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            border: isEditing
                              ? "1px solid #98b720"
                              : "none !important",
                            bgcolor: isEditing ? "#f0f8f0" : "transparent",
                            pr: 5,
                          },
                          "& .Mui-disabled": {
                            bgcolor: "transparent",
                            color: "#333",
                            WebkitTextFillColor: "#333",
                            border: "none",
                          },
                        }}
                      />
                      {isEditing && (
                        <CheckIcon
                          sx={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#98b720",
                            fontSize: 20,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>

                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'>
                    <Typography suppressHydrationWarning 
                      fontSize='0.9rem'
                      color='#666'
                      sx={{ minWidth: 80 }}>
                      {t("name_label")}
                    </Typography>
                    <Box sx={{ position: "relative", width: 200 }}>
                      <TextField
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         onBlur={() => setTouchedName(true)}
                         error={nameError}
                         helperText={
                           touchedName && isNameEmpty ? t("name_required") : ""
                         }
                        placeholder= {t("name_placeholder")}
                        variant='outlined'
                        size='small'
                        disabled={!isEditing}
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            border: isEditing
                              ? "1px solid #98b720"
                              : "none !important",
                            bgcolor: isEditing ? "#f0f8f0" : "transparent",
                            pr: 5,
                          },
                          "& .Mui-disabled": {
                            bgcolor: "transparent",
                            color: "#333",
                            WebkitTextFillColor: "#333",
                            border: "none",
                          },
                        }}
                      />
                      {isEditing && (
                        <CheckIcon
                          sx={{
                            position: "absolute",
                            right: 8,
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

              {/* ƯU ĐÃI */}
              {/* <Paper
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  bgcolor: "white",
                  p: 2.5,
                  border: "1px solid #e0e0e0",
                  mt: 2,
                }}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <OfferIcon sx={{ fontSize: 20, color: "#98b720" }} />
                    <Typography suppressHydrationWarning  fontWeight={600} color='#333'>
                      Ưu đãi
                    </Typography>
                  </Stack>
                  <Typography suppressHydrationWarning 
                    fontSize='0.9rem'
                    color='#98b720'
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => setOpenOfferModal(true)}>
                    Chọn ưu đãi
                  </Typography>
                </Stack>
              </Paper> */}
            </Grid>

            {/* CỘT PHẢI */}
            <Grid item xs={12} sx={{mt: isMobile?2:0}} md={6}>
              <Stack spacing={2}>
                {/* CHI TIẾT THANH TOÁN */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    bgcolor: "white",
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                  }}>
                  <Stack spacing={2}>
                    <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    {t("payment_details_title")}
                    </Typography>
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666'>
                      {t("room_price")}
                      </Typography>
                      <Typography suppressHydrationWarning  color='#666'>{formattedPrice}đ</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography suppressHydrationWarning 
                        fontSize='0.9rem'
                        fontWeight={700}
                        color='rgba(43, 47, 56, 1)'>
                        {t("total_payment")}
                      </Typography>
                      <Typography suppressHydrationWarning 
                        fontWeight={700}
                        color='rgba(43, 47, 56, 1)'
                        fontSize='1.1rem'>
                        {formattedPrice}đ
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {/* PHƯƠNG THỨC THANH TOÁN */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    bgcolor: "white",
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                  }}>
                  <Stack spacing={3}>
                    <Typography suppressHydrationWarning  fontWeight={600} fontSize='1rem' color='#333'>
                    {t("payment_method_title")}
                    </Typography>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                        sx={{ py: 1, px: 1 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Box
                            component='img'
                            src={momo}
                            alt='Momo'
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography suppressHydrationWarning  fontWeight={600}>{t("payment_momo")}</Typography>
                        </Stack>
                        <Radio value='momo' size='small' />
                      </Stack>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                        sx={{ py: 1, px: 1 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Box
                            component='img'
                            src={vnpay}
                            alt='VN Pay'
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography suppressHydrationWarning  fontWeight={600}>{t("payment_vnpay")}</Typography>
                        </Stack>
                        <Radio value='vnpay' size='small' />
                      </Stack>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'
                        sx={{ py: 1, px: 1 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                          <Box
                            component='img'
                            src={wallet}
                            alt='Hotel'
                            sx={{ width: 32, height: 32 }}
                          />
                          <Stack spacing={0.5}>
                            <Typography suppressHydrationWarning  fontWeight={600}>{t("payment_card")}</Typography>
                          </Stack>
                        </Stack>
                        <Radio value='card' size='small' />
                      </Stack>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'
                        sx={{ py: 1, px: 1 }}>
                        <Stack
                          direction='row'
                          spacing={2}
                          alignItems='flex-start'>
                          <Box
                            component='img'
                            src={building}
                            alt='Hotel'
                            sx={{ width: 32, height: 32 }}
                          />
                          <Stack spacing={0.5}>
                            <Typography suppressHydrationWarning  fontWeight={600}>
                            {t("payment_hotel")}
                            </Typography>
                            <Typography suppressHydrationWarning 
                              fontSize='0.8rem'
                              color='#999'
                              lineHeight={1.4}>
                               {t("payment_hotel_note")}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Radio value='hotel' size='small' />
                      </Stack>
                    </RadioGroup>
                  </Stack>
                </Paper>

                {/* CHÍNH SÁCH + NÚT THANH TOÁN */}
                <Stack
                  direction={isMobile?"column":'row'}
                  pt={3}
                  justifyContent={isMobile?"start":'space-between'}
                  alignItems={isMobile?"start":'center'}>
                  <Typography suppressHydrationWarning 
                    fontSize='16px'
                    fontWeight={600}
                    sx={{ textDecoration: "underline", cursor: "pointer" }}
                    color='rgba(43, 47, 56, 1)'
                    onClick={() => setOpenCancelPolicyModal(true)}>
                      {t("cancel_policy_title")}
                  </Typography>
                  <Button
                    onClick={handleCreateBooking}
                    disabled={loading||phoneError||nameError}
                    variant='contained'
                    sx={{
                      bgcolor: "#98b720",
                      color: "white",
                      borderRadius: "50px",
                      fontWeight: 600,
                      textTransform: "none",
                      py: 1.8,
                      fontSize: "1rem",
                      "&:hover": { bgcolor: "#7a9a1a" },
                      width: isMobile ? "100%" : "282px",
                      mt:isMobile?2:0
                    }}>
                    {loading ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ color: "#fff", mr: 1 }}
                        />
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

      {/* MODAL ƯU ĐÃI & CHÍNH SÁCH HỦY - GIỮ NGUYÊN 100% */}
      {/* (Không thay đổi gì, copy nguyên từ code cũ của bạn) */}
      <Modal open={openOfferModal} onClose={() => setOpenOfferModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "white",
            borderRadius: "16px",
            boxShadow: 24,
            p: 3,
            maxHeight: "80vh",
            overflow: "auto",
          }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={2}>
            <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
             {   t("offer_modal_title")}
            </Typography>
            <IconButton onClick={() => setOpenOfferModal(false)} size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography suppressHydrationWarning  fontSize='0.85rem' color='#666' mb={3}>
          {   t("available_offers")}
          </Typography>
          <RadioGroup
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}>
            {offers.map((offer) => (
              <Paper
                key={offer.id}
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  p: 2,
                  mb: 2,
                  bgcolor: selectedOffer === offer.id ? "#f0f8f0" : "white",
                }}>
                <FormControlLabel
                  value={offer.id}
                  control={<Radio size='small' />}
                  label={
                    <Stack
                      direction='row'
                      spacing={2}
                      alignItems='center'
                      sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          bgcolor: "#98b720",
                          color: "white",
                          borderRadius: "8px",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}>
                        {offer.discount}
                      </Box>
                      <Stack>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='0.9rem'
                          color='#333'>
                          {offer.title}
                        </Typography>
                        <Typography suppressHydrationWarning  fontSize='0.8rem' color='#666'>
                          {offer.desc}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                  sx={{ mx: -1.5, "& .MuiFormControlLabel-label": { flex: 1 } }}
                />
              </Paper>
            ))}
          </RadioGroup>
          <Button
            fullWidth
            variant='contained'
            sx={{
              bgcolor: "#f5f5f5",
              color: "#666",
              borderRadius: "50px",
              fontWeight: 600,
              textTransform: "none",
              py: 1.5,
              mt: 2,
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
            onClick={() => setOpenOfferModal(false)}>
                      {   t("apply_offer")}
          </Button>
        </Box>
      </Modal>

      <Modal
        open={openCancelPolicyModal}
        onClose={() => setOpenCancelPolicyModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 750 },
            bgcolor: "white",
            borderRadius: "16px",
            boxShadow: 24,
            p: 3,
          }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            mb={2}>
            <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {   t("cancel_policy_title")}
            </Typography>
            <IconButton
              onClick={() => setOpenCancelPolicyModal(false)}
              size='small'>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack
            spacing={2}
            sx={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6 }}>
            <Typography suppressHydrationWarning >
              {t("cancel_policy_free",{date:checkIn
                  ? dayjs(checkIn).format("D/M/YYYY")
                  : "ngày nhận phòng"})}
            </Typography>
            <Typography suppressHydrationWarning >
             {t("cancel_policy_suggest")}
            </Typography>
            <Box display='flex' justifyContent='space-between'>
              <Typography suppressHydrationWarning  fontSize='14px'>
              {t("view_more")}
                <Typography suppressHydrationWarning 
                  component='span'
                  color='#98b720'
                  sx={{ textDecoration: "underline", cursor: "pointer" }}>
                  {t("terms_link")}
                </Typography>
              </Typography>
              <Typography suppressHydrationWarning  fontSize='14px'>
              {t("support_prefix")}
                <Typography suppressHydrationWarning 
                  component='span'
                  color='#98b720'
                  sx={{ textDecoration: "underline", cursor: "pointer" }}>
                   {t("contact_support")}
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default CheckOutView;
