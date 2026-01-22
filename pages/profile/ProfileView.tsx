// app/profile/ProfileView.tsx
// hoặc components/profile/ProfileView.tsx tùy cấu trúc dự án

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Room as RoomIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import image_room from "@/images/Rectangle 29975.png";
import logoutImg from "@/images/logout2.png";
import successImg from "@/images/15. Hotel.png";
import cancelImg from "@/images/cancel.png";
import pendingImg from "@/images/pending.png";
import pendingPaymentImg from "@/images/pendingpayment.png";

import { cancelBooking } from "@/service/booking";
import { toast } from "react-toastify";

import { getErrorMessage, parseName } from "@/utils/utils";
import { getStatusPayment, retryPayment } from "@/service/payment";
import dayjs from "dayjs";

import Account from "./Account";
import AccountSettingsPage from "./AccountSetting";
import MyBookingsPage from "./MyBookingsPage";
import { useBookingContext } from "@/lib/context";
import { useNavigateToRoom } from "@/components/useNavigateToRoom";

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────

const REASON_KEYS = [
  "change_time",
  "change_room",
  "change_hotel",
  "no_need",
  "hotel_request",
  "try_experience",
  "price_higher",
  "other",
];

// ────────────────────────────────────────────────
// Reason Modal (lý do hủy - dạng text tự do)
// ────────────────────────────────────────────────

const ReasonModal = ({ open, onClose, onSubmit, loadingSubmit }) => {
  const t = useTranslations();
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    onSubmit(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("reason_modal_title")}</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          rows={3}
          placeholder={t("reason_placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 1000 }}
          helperText={`${reason.length}/1000`}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused fieldset": { borderColor: "#98b720", borderWidth: 1.5 },
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          sx={{ borderColor: "#98b720", color: "#98b720" }}
          onClick={handleClose}
        >
          {t("reason_cancel_button")}
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "#98b720", color: "white" }}
          onClick={handleSubmit}
          disabled={!reason.trim() || loadingSubmit}
        >
          {loadingSubmit ? (
            <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
          ) : (
            t("reason_submit_button")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ────────────────────────────────────────────────
// Cancel Booking Modal (chọn lý do có sẵn + other)
// ────────────────────────────────────────────────

const CancelBookingModal = ({ open, onClose, getHistoryBooking, detailBooking }) => {
  const t = useTranslations();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) {
      setReason("");
      setNote("");
    }
  }, [confirmOpen]);

  const handleSubmit = async () => {
    if (!reason) return;
    try {
      const fullReason = reason + (reason === t(`cancel_booking.reasons.other`) ? ` - ${note}` : "");
      const result = await cancelBooking({ id: detailBooking.booking_id, reason: fullReason });
      if (result?.code === "OK") {
        toast.success(result?.message);
        getHistoryBooking();
        setConfirmOpen(false);
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isDisableSubmit = !reason || (reason === t(`cancel_booking.reasons.other`) && !note.trim());

  return (
    <>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#ffebee",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Image src={logoutImg} alt="Logout" width={40} height={40} />
            </Box>
            <IconButton
              onClick={() => setConfirmOpen(false)}
              sx={{ position: "absolute", top: -40, left: -30 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 4, pb: 3 }}>
          <Typography fontWeight={600} fontSize="18px" mb={1}>
            {t("button_cancel_booking")}
          </Typography>
          <Typography fontSize="14px" color="#666">
            {t("cancel_booking_confirm")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 4, gap: 2, flexDirection: "column" }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              bgcolor: "#98b720",
              "&:hover": { bgcolor: "#8ab020" },
              width: "100%",
            }}
          >
            {t("logout_confirm_button")}
          </Button>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              borderColor: "#ddd",
              color: "#666",
              width: "100%",
            }}
          >
            {t("logout_cancel_button")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {t("cancel_booking.title")}
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 40, top: 26 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASON_KEYS.map((key) => (
              <FormControlLabel
                key={key}
                value={t(`cancel_booking.reasons.${key}`)}
                control={<Radio />}
                label={t(`cancel_booking.reasons.${key}`)}
                labelPlacement="start"
                sx={{
                  mb: 0.5,
                  justifyContent: "space-between",
                  width: "100%",
                  marginLeft: 0,
                }}
              />
            ))}
          </RadioGroup>

          {reason === t(`cancel_booking.reasons.other`) && (
            <Box mt={1}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t("cancel_booking.placeholder_other")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                inputProps={{ maxLength: 1000 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right", mt: 0.5 }}>
                {note.length}/1000
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={isDisableSubmit}
            onClick={() => {
              setConfirmOpen(true);
              onClose();
            }}
            sx={{
              height: 44,
              borderRadius: 999,
              fontWeight: 600,
              bgcolor: "#98b720",
              "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
            }}
          >
            {t("cancel_booking.submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ────────────────────────────────────────────────
// Main Component: ProfileView
// ────────────────────────────────────────────────

const ProfileView = ({
  historyBooking,
  getHistoryBooking,
  hastag,
  loading,
  pagination,
  onPageChange,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigateToRoom = useNavigateToRoom();
  const context = useBookingContext();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(t("profile_menu"));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [openCancelBooking, setOpenCancelBooking] = useState(false);
  const [openReason, setOpenReason] = useState(false);

  const menuItems = [
    { text: t("profile_menu"), icon: <PersonIcon />, active: false },
    { text: t("account_settings_menu"), icon: <SettingsIcon />, active: false },
    { text: t("my_bookings_menu"), icon: <RoomIcon />, active: true },
    { text: t("logout_menu"), icon: <LogoutIcon />, active: false },
  ];

  useEffect(() => {
    if (detailBooking) {
      setDetailBooking(historyBooking.find((item) => item.booking_id === detailBooking.booking_id));
    }
  }, [historyBooking]);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      if (type === "booking") {
        setActiveMenu(t("my_bookings_menu"));
      }
      if (type === "profile") {
        setActiveMenu(t("profile_menu"));
      }
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("type");
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router, t]);

  const handleClickItemMenu = (text) => {
    setDetailBooking(null);
    setActiveMenu(text);
  };

  // ── Sidebar ──
  const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const sidebarContent = (
      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", md: 280 },
          height: { xs: "100vh", md: "fit-content" },
          borderRadius: { xs: 0, md: "16px" },
          bgcolor: "white",
          p: { xs: 2, md: 3 },
          position: { xs: "fixed", md: "sticky" },
          top: { xs: 0, md: 16 },
          left: 0,
          zIndex: { xs: 1200, md: 1 },
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {isMobile && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} color="#333">
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle} sx={{ color: "#98b720" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        )}

        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 }, bgcolor: "#e8f5e8" }}>
              <PersonIcon sx={{ color: "#98b720", fontSize: { xs: 24, md: 28 } }} />
            </Avatar>
            <Stack>
              <Typography fontWeight={600} fontSize={{ xs: "0.9rem", md: "1rem" }} color="#333">
                {context?.state?.user?.name || "Người dùng"}
              </Typography>
              <Typography fontSize={{ xs: "0.75rem", md: "0.8rem" }} color="#666">
                +84 {context?.state?.user?.phone?.slice(3) || "123456789"}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ bgcolor: "#eee" }} />

          <List disablePadding sx={{ cursor: "pointer" }}>
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                {item.text === t("logout_menu") && <Divider sx={{ my: 2 }} />}
                <ListItem
                  onClick={() => {
                    if (item.text === t("logout_menu")) {
                      setDeleteDialogOpen(true);
                    } else {
                      handleClickItemMenu(item.text);
                    }
                    if (isMobile) setMobileOpen(false);
                  }}
                  disablePadding
                  sx={{
                    borderRadius: "12px",
                    mb: 1,
                    bgcolor: activeMenu === item.text ? "#f0f8f0" : "transparent",
                    border: activeMenu === item.text ? "1px solid #98b720" : "none",
                    px: 1,
                    py: { xs: 1.5, md: 1 },
                    "&:hover": { bgcolor: activeMenu === item.text ? "#f0f8f0" : "#f9f9f9" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: { xs: 32, md: 36 },
                      color: activeMenu === item.text ? "rgba(152, 183, 32, 1)" : "#999",
                      "& .MuiSvgIcon-root": { fontSize: { xs: "1.25rem", md: "1.375rem" } },
                    }}
                  >
                    {React.cloneElement(item.icon)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={activeMenu === item.text ? 600 : 500}
                        fontSize={{ xs: "0.85rem", md: "0.9rem" }}
                        color={activeMenu === item.text ? "rgba(152, 183, 32, 1)" : "#666"}
                      >
                        {item.text}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Stack>
      </Paper>
    );

    if (isMobile) {
      return (
        <>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              bgcolor: "#98b720",
              color: "white",
              "&:hover": { bgcolor: "#7a9a1a" },
              zIndex: 1100,
              width: 56,
              height: 56,
              boxShadow: 3,
              display: { xs: "flex", md: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: "100%", bgcolor: "transparent", boxShadow: "none" },
            }}
          >
            {sidebarContent}
          </Drawer>
        </>
      );
    }

    return sidebarContent;
  };

  // ── Booking Detail Content ──
  const MainContent = () => {
    if (!detailBooking) return null;

    const hotelName = JSON.parse(detailBooking.hotel_name)?.vi || JSON.parse(detailBooking.hotel_name)?.en || "Khách sạn";
    const roomName = parseName(detailBooking.rooms[0]?.room_name, locale);
    const hotelAddress = JSON.parse(detailBooking.hotel_address)?.vi || JSON.parse(detailBooking.hotel_address)?.en || "Chưa có địa chỉ";

    const roomImages = detailBooking.rooms[0]?.images ? JSON.parse(detailBooking.rooms[0].images) : [];
    const roomThumbnail = roomImages[0] || detailBooking.thumbnail_url || image_room;

    const formatDateTime = (isoString) => dayjs(isoString).format("HH:mm, D/M");

    const checkInTime = formatDateTime(detailBooking.check_in);
    const checkOutTime = formatDateTime(detailBooking.check_out);

    const getDurationLabel = () => {
      if (detailBooking.rent_type === "hourly") {
        const hours = dayjs(detailBooking.check_out).diff(dayjs(detailBooking.check_in), "hour");
        return `${hours < 10 ? "0" + hours : hours} giờ`;
      }
      if (detailBooking.rent_type === "overnight") return "01 đêm";
      if (detailBooking.rent_type === "daily") {
        const days = dayjs(detailBooking.check_out).diff(dayjs(detailBooking.check_in), "day");
        return `${days} đêm`;
      }
      return "01";
    };

    const getRentTypeLabel = () => {
      switch (detailBooking.rent_type) {
        case "hourly": return t("rent_type_hourly");
        case "overnight": return t("rent_type_overnight");
        case "daily": return t("rent_type_daily");
        default: return t("rent_type_hourly");
      }
    };

    const getBestPayment = (payments = []) => {
      if (!payments.length) return null;
      const priority = ["paid", "pending", "failed", "cancelled", "refunded"];
      for (const st of priority) {
        const found = payments.find((p) => p.status === st);
        if (found) return found;
      }
      return null;
    };

    const getPaymentTextStatus = (payments = []) => {
      if (!payments || payments.length === 0) return t("payment_status_at_hotel");

      const priority = ["paid", "pending", "failed", "cancelled", "refunded"];
      let status = null;
      for (const st of priority) {
        const found = payments.find((p) => p.status === st);
        if (found) {
          status = found.status;
          break;
        }
      }

      switch (status) {
        case "paid": return t("payment_status_paid");
        case "pending": return t("payment_status_pending");
        case "failed": return t("payment_status_failed");
        case "cancelled": return t("payment_status_cancelled");
        case "refunded": return t("payment_status_refunded");
        default: return t("payment_status_refunded");
      }
    };

    const payments = detailBooking.payments || [];
    const bestPayment = getBestPayment(payments);
    const paymentStatus = getPaymentTextStatus(payments);

    const paymentMethodLabel = bestPayment?.method
      ? bestPayment.method === "momo"
        ? "Ví MoMo"
        : bestPayment.method === "vnpay"
        ? "VNPay"
        : t("payment_status_at_hotel")
      : t("payment_status_at_hotel");

    const totalPrice = Number(detailBooking.total_price || 0).toLocaleString("vi-VN");

    const handleCopyCode = () => {
      navigator.clipboard.writeText(detailBooking.booking_code);
      toast.success("Đã sao chép mã đặt phòng!");
    };

    const getPaymentStatus = (payments = []) => {
      if (!payments.length) return null;
      const priority = ["paid", "pending", "failed", "cancelled", "refunded"];
      for (const status of priority) {
        const found = payments.find((p) => p.status === status);
        if (found) return found.status;
      }
      return null;
    };

    const getBookingNameStatus = () => {
      const paymentStatus = getPaymentStatus(payments);
      const bookingStatus = detailBooking.status;

      if (bookingStatus === "checked_out" || bookingStatus === "cancelled" || detailBooking.status === "no_show") {
        return t("button_rebook");
      }

      if (bookingStatus === "confirmed" && paymentStatus === "paid") {
        return t("button_cancel_booking");
      }

      if (paymentStatus === "failed" || paymentStatus === "pending" || bookingStatus === "pending") {
        return t("button_continue_payment");
      }

      return t("button_continue_payment");
    };

    const handleSubmit = async () => {
      setLoadingSubmit(true);
      const action = getBookingNameStatus();

      try {
        if (action === t("button_cancel_booking")) {
          setOpenCancelBooking(true);
        } else if (action === t("button_rebook")) {
          navigateToRoom(detailBooking);
        } else if (action === t("button_continue_payment")) {
          await handleRetryPayment({ booking_id: detailBooking?.booking_id, method: detailBooking.payments[0]?.method });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (action !== t("button_continue_payment")) setLoadingSubmit(false);
      }
    };

    const handleRetryPayment = async (body) => {
      setLoadingSubmit(true);
      try {
        const result = await retryPayment(body);
        if (result?.payment_id) {
          checkPaymentStatusLoop(result.payment_id);
        } else {
          toast.error(getErrorMessage(result.code) || result.message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const checkPaymentStatusLoop = async (paymentId) => {
      let retry = 0;
      const interval = setInterval(async () => {
        retry++;
        try {
          const result = await getStatusPayment(paymentId);
          const status = result?.status;

          switch (status) {
            case "paid":
              clearInterval(interval);
              setLoadingSubmit(false);
              toast.success("Thanh toán thành công!");
              getHistoryBooking();
              return;
            case "failed":
              clearInterval(interval);
              setLoadingSubmit(false);
              toast.error("Thanh toán thất bại!");
              return;
            case "refunded":
              clearInterval(interval);
              setLoadingSubmit(false);
              toast.info("Thanh toán đã được hoàn tiền!");
              return;
            case "cancelled":
              clearInterval(interval);
              setLoadingSubmit(false);
              toast.warning("Thanh toán đã bị hủy!");
              return;
            default:
              break;
          }
        } catch (error) {
          console.error("Error:", error);
        }

        if (retry >= 30) {
          clearInterval(interval);
          setLoadingSubmit(false);
          toast.error("Thanh toán quá thời gian! Vui lòng thử lại.", { position: "top-center" });
        }
      }, 2000);
    };

    const handleSubmitReason = async (value) => {
      setLoadingSubmit(true);
      try {
        const result = await cancelBooking({ id: detailBooking.booking_id, reason: value });
        if (result?.code === "OK") {
          toast.success(result?.message);
          getHistoryBooking();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSubmit(false);
        setOpenReason(false);
      }
    };

    return (
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => setDetailBooking(null)}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography fontWeight={600} fontSize="1.1rem" color="#333">
            {t("booking_detail_title")}
          </Typography>
        </Stack>

        <ReasonModal
          open={openReason}
          onClose={() => setOpenReason(false)}
          onSubmit={handleSubmitReason}
          loadingSubmit={loadingSubmit}
        />

        {/* Các banner trạng thái */}
        {detailBooking.status === "checked_out" && (
          <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Image src={successImg} alt="Thành công" width={48} height={48} />
                <Stack>
                  <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                    {t("status_completed")}
                  </Typography>
                  <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                    {t("completed_message")}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="contained"
                onClick={() => navigateToRoom(detailBooking)}
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
                  "&:hover": { bgcolor: "#7a9a1a" },
                }}
              >
                {t("button_rebook")}
              </Button>
            </Stack>
          </Paper>
        )}

        {detailBooking.status === "confirmed" && bestPayment?.status === "paid" && (
          <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Image src={pendingImg} alt="Pending" width={48} height={48} />
                <Stack>
                  <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                    {t("status_waiting_checkin")}
                  </Typography>
                  <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                    {t("waiting_checkin_message")}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        )}

        {detailBooking.status === "pending" &&
          (bestPayment?.status === "failed" || bestPayment?.status === "pending") && (
            <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Image src={pendingPaymentImg} alt="Pending Payment" width={48} height={48} />
                  <Stack>
                    <Typography fontWeight={700} fontSize="1rem" color="#98b720">
                      {t("status_waiting_payment")}
                    </Typography>
                    <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                      {t("waiting_payment_message")}
                    </Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="contained"
                  disabled={loadingSubmit}
                  onClick={() =>
                    handleRetryPayment({
                      booking_id: detailBooking?.booking_id,
                      method: detailBooking.payments[0]?.method,
                    })
                  }
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
                    "&:hover": { bgcolor: "#7a9a1a" },
                  }}
                >
                  {loadingSubmit ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                      {t("button_loading_continue")}
                    </>
                  ) : (
                    t("button_continue_payment")
                  )}
                </Button>
              </Stack>
            </Paper>
          )}

        {(detailBooking.status === "cancelled" || detailBooking.status === "no_show") && (
          <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Image src={cancelImg} alt="Cancelled" width={48} height={48} />
                <Stack>
                  <Typography fontWeight={700} fontSize="1rem" color="red">
                    {detailBooking.status === "cancelled" ? t("cancelled_status") : t("status_no_show")}
                  </Typography>
                  <Typography fontSize="0.8rem" color="#666" lineHeight={1.4}>
                    {detailBooking.status === "cancelled"
                      ? `${t("reason_modal_title")}: ${detailBooking?.cancel_reason}`
                      : t("no_show_message")}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="contained"
                onClick={() => navigateToRoom(detailBooking)}
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
                  "&:hover": { bgcolor: "#7a9a1a" },
                }}
              >
                {t("button_rebook")}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Your Choice */}
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
            {t("your_choice_title")}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-start">
            <Box sx={{ width: 120, height: 120, bgcolor: "#f0f0f0", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
              <Image src={roomThumbnail} alt="Phòng" width={120} height={120} style={{ objectFit: "cover" }} />
            </Box>

            <Stack spacing={0.5} flex={1}>
              <Typography fontWeight={600} fontSize="0.95rem" color="#333">
                {hotelName}
              </Typography>
              <Typography fontSize="0.9rem" fontWeight={500} color="#333">
                {roomName}
              </Typography>
              <Typography fontSize="0.8rem" color="#666">
                {hotelAddress}
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                bgcolor: "#f8fcf8",
                borderRadius: "12px",
                p: 1.5,
                border: "1px solid #98b720",
                textAlign: "center",
                width: "300px",
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="start" mb={1}>
                <CheckCircleIcon sx={{ fontSize: 16, color: "#98b720" }} />
                <Typography fontSize="0.75rem" color="#98b720" fontWeight={600}>
                  {getRentTypeLabel()}
                </Typography>
              </Stack>
              <Divider />
              <Grid container spacing={0.5} mt={1} fontSize="0.7rem">
                <Grid item xs={4}>
                  <Typography color="#888" fontSize="0.75rem">
                    {t("checkin_label")}
                  </Typography>
                  <Typography fontWeight={600} color="#333" fontSize="0.8rem">
                    {checkInTime}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ borderLeft: "1px solid #ddd", textAlign: "center" }}>
                  <Typography color="#888" fontSize="0.75rem">
                    {t("checkout_label")}
                  </Typography>
                  <Typography fontWeight={600} color="#333" fontSize="0.8rem">
                    {checkOutTime}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ borderLeft: "1px solid #ddd", textAlign: "center" }}>
                  <Typography color="#888" fontSize="0.75rem">
                    {detailBooking.rent_type === "daily" ? "Số đêm" : "Số giờ"}
                  </Typography>
                  <Typography fontWeight={600} color="#333" fontSize="0.8rem">
                    {getDurationLabel()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Paper>

        {/* Check-in Info */}
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
            {t("checkin_info_title")}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontSize="0.9rem" color="#666">
                {t("booking_code_label")}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography fontWeight={600} color="#333" fontSize="0.95rem">
                  {detailBooking.booking_code}
                </Typography>
                <IconButton size="small" onClick={handleCopyCode} sx={{ color: "#98b720", p: 0.5 }}>
                  <CopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontSize="0.9rem" color="#666">
                {t("phone_label")}
              </Typography>
              <Typography fontWeight={600} color="#333" fontSize="0.95rem">
                +84 {context.state?.user?.phone?.slice(3)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontSize="0.9rem" color="#666">
                {t("full_name_label")}
              </Typography>
              <Typography fontWeight={600} color="#333" fontSize="0.95rem">
                {context.state?.user?.name}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Payment Details */}
        <Paper elevation={0} sx={{ borderRadius: "16px", bgcolor: "white", p: 2.5 }}>
          <Typography fontWeight={600} mb={2} fontSize="1rem" color="#333">
            {t("payment_details_title")}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize="0.9rem" color="#666">
                {t("payment_status_label")}
              </Typography>
              <Typography
                fontWeight={600}
                color={bestPayment?.status === "paid" ? "#98b720" : "#ff4444"}
                fontSize="0.95rem"
              >
                {paymentStatus}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize="0.9rem" color="#666">
                {t("payment_method_label")}
              </Typography>
              <Typography fontWeight={600} color="#333" fontSize="0.95rem">
                {paymentMethodLabel}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize="0.9rem" color="#666">
                {t("room_price_label")}
              </Typography>
              <Typography fontWeight={600} color="#333" fontSize="0.95rem">
                {totalPrice}đ
              </Typography>
            </Stack>
            <Divider sx={{ bgcolor: "#eee" }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize="1rem" fontWeight={700} color="#333">
                {t("total_payment_label")}
              </Typography>
              <Typography fontSize="1.1rem" fontWeight={700} color="#333">
                {totalPrice}đ
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          mt={3}
          spacing={2}
        >
          <Typography
            onClick={() => {
              if (detailBooking.status === "confirmed" || detailBooking.status === "pending") {
                setOpenCancelBooking(true);
              } else {
                toast.warning("Đặt phòng đã quá thời gian huỷ");
              }
            }}
            fontSize="16px"
            color="rgba(43, 47, 56, 1)"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            {t("cancellation_policy")}
          </Typography>

          <Button
            fullWidth={isMobile}
            onClick={handleSubmit}
            variant="contained"
            disabled={loadingSubmit}
            sx={{
              bgcolor: "#98b720",
              color: "white",
              borderRadius: "50px",
              fontWeight: 600,
              textTransform: "none",
              px: 4,
              py: 1,
              fontSize: "1rem",
              "&:hover": { bgcolor: "#7a9a1a" },
              minWidth: isMobile ? "100%" : "220px",
            }}
          >
            {loadingSubmit ? (
              <>
                <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                {getBookingNameStatus()}
              </>
            ) : (
              getBookingNameStatus()
            )}
          </Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9", py: { xs: 2, md: 6 } }}>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#ffebee",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Image src={logoutImg} alt="Logout" width={40} height={40} />
            </Box>
            <IconButton onClick={() => setDeleteDialogOpen(false)} sx={{ position: "absolute", top: -40, left: -30 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 4, pb: 3 }}>
          <Typography fontWeight={600} fontSize="18px" mb={1}>
            {t("logout_dialog_title")}
          </Typography>
          <Typography fontSize="14px" color="#666">
            {t("logout_dialog_message")}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 4, gap: 2, flexDirection: "column" }}>
          <Button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");

              context.dispatch({
                type: "LOGOUT",
                payload: { ...context.state, user: {} },
              });
              router.push("/");
              setDeleteDialogOpen(false);
            }}
            variant="contained"
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              bgcolor: "#98b720",
              "&:hover": { bgcolor: "#8ab020" },
              width: "100%",
            }}
          >
            {t("logout_confirm_button")}
          </Button>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              borderColor: "#ddd",
              color: "#666",
              width: "100%",
            }}
          >
            {t("logout_cancel_button")}
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={3.5}>
            <Sidebar />
          </Grid>
          <Grid item xs={12} md={8} lg={8.5}>
            {detailBooking && <MainContent />}
            {activeMenu === t("profile_menu") && <Account context={context} />}
            {activeMenu === t("account_settings_menu") && <AccountSettingsPage setActiveMenu={setActiveMenu} />}
            {activeMenu === t("my_bookings_menu") && !detailBooking && (
              <MyBookingsPage
                historyBooking={historyBooking}
                setDetailBooking={setDetailBooking}
                getHistoryBooking={getHistoryBooking}
                hastag={hastag}
                loading={loading}
                pagination={pagination}
                onPageChange={onPageChange}
                navigateToRoom={navigateToRoom}
              />
            )}
          </Grid>
        </Grid>
      </Container>

      <CancelBookingModal
        open={openCancelBooking}
        onClose={() => setOpenCancelBooking(false)}
        getHistoryBooking={getHistoryBooking}
        detailBooking={detailBooking}
      />
    </Box>
  );
};

export default ProfileView;