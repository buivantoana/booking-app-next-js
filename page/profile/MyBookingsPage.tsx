// app/my-bookings/MyBookingsPage.tsx
// hoặc components/my-bookings/MyBookingsPage.tsx tùy cấu trúc dự án

"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import {
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  TextField,
  Rating,
  CircularProgress,
  Pagination,
  Card,
  Skeleton,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";

import {
  AccessTime as AccessTimeIcon,
  DeleteOutline as DeleteIcon,
  Close as CloseIcon,
  PhotoCamera,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  SwapVert as SwapVertIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Check as CheckIcon,
  ReportGmailerrorred as ReportGmailerrorredIcon,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import { format } from "date-fns";

import no_room from "@/images/No Navigation.svg";
import buildingImg from "@/images/building.png";
import removeImg from "@/images/delete.png";

import { deleteBooking, issueBooking, reviewBooking } from "@/service/booking";

import { getErrorMessage, parseName } from "@/utils/utils";
import { getStatusPayment, retryPayment } from "@/service/payment";

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const parseJsonField = (field: string) => {
  try {
    const parsed = JSON.parse(field);
    return parsed.vi || parsed.en || "Không có tên";
  } catch {
    return field;
  }
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (iso: string) => {
  return format(new Date(iso), "HH:mm, dd/MM/yyyy");
};

const getThumbnail = (booking: any) => {
  if (booking.thumbnail_url) return booking.thumbnail_url;
  const imagesStr = booking.rooms[0]?.images;
  if (imagesStr) {
    try {
      const arr = JSON.parse(imagesStr.replace(/\\"/g, '"'));
      return arr[0] || "";
    } catch {}
  }
  return "";
};

// ────────────────────────────────────────────────
// Booking Card
// ────────────────────────────────────────────────
const getPaymentStatus = (payments = []) => {
  if (!payments.length) return null;

  // Ưu tiên theo thứ tự
  const priority = ["paid", "pending", "failed", "cancelled", "refunded"];

  // Tìm payment đầu tiên theo thứ tự ưu tiên
  for (const status of priority) {
    const p = payments.find((x) => x.status === status);
    if (p) return p.status;
  }

  return null;
};

const BookingCard = ({
  booking,
  setDetailBooking,
  getHistoryBooking,
  hastag,
  navigateToRoom,
  bookingRefs,
  lastBookingIdRef
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogOpenIssue, setDeleteDialogOpenIssue] = useState(false);
  const [deleteDialogOpenReview, setDeleteDialogOpenReview] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const locale = useLocale();
  const getBookingStatus = (booking: any) => {
    const paymentStatus = getPaymentStatus(booking.payments);
    const bookingStatus = booking.status;

    if (bookingStatus === "checked_out") {
      return { label: t("completed_status"), color: "#1A9A50", bg: "#E8F5E9" };
    }

    if (bookingStatus === "cancelled") {
      return { label: t("cancelled_status"), color: "#E91E1E", bg: "#FFEBEE" };
    }

    if (bookingStatus === "confirmed" ) {
      return {
        label: t("waiting_checkin_status"),
        color: "#0066CC",
        bg: "#E6F0FA",
      };
    }
    if (bookingStatus === "no_show" ) {
      return { label: t("no_show_status"), color: "#E91E1E", bg: "#FFEBEE" };
    }

    if (
      paymentStatus === "failed" ||
      paymentStatus === "pending" ||
      bookingStatus === "pending"
    ) {
      return {
        label: t("waiting_payment_status"),
        color: "#FF6D00",
        bg: "#FFF4E5",
      };
    }

    return {
      label: t("waiting_payment_status"),
      color: "#FF6D00",
      bg: "#FFF4E5",
    };
  };

  const statusConfig = getBookingStatus(booking);
  const hotelName = parseJsonField(booking.hotel_name);
  const roomName = parseName(booking.rooms[0]?.room_name, locale);
  const roomCount = booking.rooms.length;
  const timeDisplay = `${formatDateTime(booking.check_in)} - ${formatDateTime(
    booking.check_out
  )}`;
  const isCompleted = statusConfig.label === t("completed_status");
  const isWaitingPayment = statusConfig.label === t("waiting_payment_status");
  const isCancelled = statusConfig.label === t("cancelled_status");

  const handleDeleteBooking = async (id) => {
    try {
      const result = await deleteBooking(id);
      if (result.code === "OK") {
        toast.success(result.message);
        getHistoryBooking();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRetryPayment = async (body) => {
    setLoadingRetry(true);
    try {
      const result = await retryPayment(body);
      if (result?.payment_id) {
        checkPaymentStatusLoop(result?.payment_id);
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
        setLoadingRetry(false);
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus("failed");
    } finally {
      setLoadingRetry(false);
    }
  };

  const checkPaymentStatusLoop = async (paymentId) => {
    let retry = 0;

    const interval = setInterval(async () => {
      retry++;

      try {
        let result = await getStatusPayment(paymentId);
        const status = result?.status;

        switch (status) {
          case "paid":
            clearInterval(interval);
            setLoadingRetry(false);
            toast.success("Thanh toán thành công!");
            getHistoryBooking();
            return;

          case "failed":
            clearInterval(interval);
            setLoadingRetry(false);
            toast.error("Thanh toán thất bại!");
            return;

          case "refunded":
            clearInterval(interval);
            setLoadingRetry(false);
            toast.info("Thanh toán đã được hoàn tiền!");
            return;

          case "cancelled":
            clearInterval(interval);
            setLoadingRetry(false);
            toast.warning("Thanh toán đã bị hủy!");
            return;

          case "pending":
          default:
            break;
        }
      } catch (error) {
        console.error("Error:", error);
      }

      if (retry >= 30) {
        clearInterval(interval);
        setLoadingRetry(false);
        toast.error("Thanh toán quá thời gian! Vui lòng thử lại.", {
          position: "top-center",
        });
      }
    }, 2000);
  };

  return (
    <>
      <IssueBooking
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        id={booking.booking_id}
        title={`${t("booking_code_label")} ${booking.booking_code}`}
        setDeleteDialogOpen={setDeleteDialogOpen}
      />

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        hotelName={hotelName}
        roomType={`${roomCount} ${t("room")}`}
        bookingTime={timeDisplay}
        id={booking.booking_id}
        hastag={hastag}
        getHistoryBooking={getHistoryBooking}
        setIssueModalOpen={setIssueModalOpen}
      />

      <Box
       ref={(el:any) => (bookingRefs.current[booking.booking_id] = el)}
        sx={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          mb: 2,
          border: "1px solid #eee",
        }}>
        {/* Header */}
        <Box sx={{ px: 2.5, pt: 3 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Typography fontSize='14px' color='black'>
              {t("booking_code_label")}: {booking.booking_code}
            </Typography>
            <Box display='flex' alignItems='center' gap={2}>
              <Chip
                label={statusConfig.label}
                size='small'
                sx={{
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color,
                  fontWeight: 600,
                  fontSize: "12px",
                  height: "26px",
                  borderRadius: "13px",
                }}
              />
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                size='small'>
                <MoreVertIcon sx={{ color: "rgba(93, 102, 121, 1)" }} />
              </IconButton>
            </Box>
          </Stack>
        </Box>

        {/* Body */}
        <Box sx={{ p: 3 }}>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={isMobile ? 2 : 3}
            alignItems={isMobile ? "stretch" : "center"}>
            {/* Ảnh */}
            <Avatar
              variant='rounded'
              sx={{
                width: isMobile ? "100%" : 140,
                height: isMobile ? 120 : 105,
                borderRadius: "12px",
                flexShrink: 0,
              }}>
              <Image
                src={getThumbnail(booking)}
                alt='hotel'
                fill
                style={{ objectFit: "cover" }}
              />
            </Avatar>

            {/* Thông tin */}
            <Box flex={1}>
              <Typography
                fontSize='16px'
                fontWeight={500}
                lineHeight={1.3}
                color="#5D6679"
                mb={0.5}>
                {hotelName}
              </Typography>
              <Typography  fontSize='17px' fontWeight={700} color='#333' mb={1}>
                {roomName}
              </Typography>
             
              <Stack direction='row' alignItems='center' spacing={1}>
                <AccessTimeIcon sx={{ fontSize: 16, color: "#98b720" }} />
                <Typography fontSize='13px' color='#98b720'>
                  {timeDisplay}
                </Typography>
              </Stack>
              {booking.note && (
                <Typography fontSize='12px' color='#888' mt={1}>
                  {t("note_label")} {booking.note}
                </Typography>
              )}
            </Box>

            {/* Giá + hành động */}
            <Box textAlign='right'>
              <Typography fontSize='18px' fontWeight={700} color='#FF6D00'>
                {formatVND(booking.total_price)}
              </Typography>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='flex-end'
                mb={2}>
                <Box
                  sx={{
                    color: "rgba(93, 102, 121, 1)",
                    py: 0.5,
                    borderRadius: "6px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}>
                  <Image
                    src={buildingImg}
                    alt='Building'
                    width={16}
                    height={16}
                  />
                  {booking.payments[0]?.method === "momo"
                    ? t("momo_payment_label")
                    : t("vnpay_payment_label")}
                </Box>
              </Stack>
              <Typography
                onClick={() => {
                  lastBookingIdRef.current = booking.booking_id;
                  setDetailBooking(booking)
                  
                  requestAnimationFrame(() => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  });
                }}
                fontSize='14px'
                sx={{ textDecoration: "underline", cursor: "pointer" }}
                color='rgba(72, 80, 94, 1)'>
                {t("details_link")}
              </Typography>
            </Box>
          </Stack>

          {/* Divider */}
          {(isCompleted || isWaitingPayment || isCancelled) && (
            <Divider sx={{ my: 2.5 }} />
          )}

          {/* Nút hành động */}
          <Stack direction='row' justifyContent='flex-end' spacing={1}>
            {isCompleted && (
              <>
                {/* {!booking?.review && ( */}
                <Button
                  onClick={() => setReviewModalOpen(true)}
                  variant='outlined'
                  sx={{
                    borderRadius: "24px",
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#666",
                    borderColor: "#ddd",
                    minWidth: 120,
                  }}>
                  {t("review_button")}
                </Button>
                {/* )} */}
                <Button
                  variant='contained'
                  sx={{
                    borderRadius: "24px",
                    textTransform: "none",
                    minWidth: 120,
                    bgcolor: "#98b720",
                    "&:hover": { bgcolor: "#8ab020" },
                  }}>
                  {t("rebook_button")}
                </Button>
              </>
            )}

            {(isWaitingPayment || isCancelled) && (
              <Button
                variant='contained'
                disabled={loadingRetry}
                onClick={
                  isWaitingPayment
                    ? () =>
                        handleRetryPayment({
                          booking_id: booking?.booking_id,
                          method: booking.payments[0]?.method,
                        })
                    : () => navigateToRoom(booking)
                }
                sx={{
                  borderRadius: "24px",
                  textTransform: "none",
                  minWidth: 120,
                  bgcolor: "#98b720",
                  "&:hover": { bgcolor: "#8ab020" },
                }}>
                {loadingRetry ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {isWaitingPayment ? t("pay_button") : t("rebook_button")}...
                  </>
                ) : isWaitingPayment ? (
                  t("pay_button")
                ) : (
                  t("rebook_button")
                )}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Menu MoreVert */}
      <Menu
        anchorEl={menuAnchor}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            mt: 1,
            padding: 0,
          },
        }}>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setDeleteDialogOpen(true);
          }}>
          <ListItemIcon>
            <DeleteIcon
              fontSize='small'
              sx={{ color: "rgba(93, 102, 121, 1)" }}
            />
          </ListItemIcon>
          <ListItemText>
            <Typography fontSize='14px' color='rgba(93, 102, 121, 1)'>
              {t("delete_history_menu")}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setIssueModalOpen(true);
          }}>
          <ListItemIcon>
            <ReportGmailerrorredIcon
              fontSize='small'
              sx={{ color: "rgba(93, 102, 121, 1)" }}
            />
          </ListItemIcon>
          <ListItemText>
            <Typography fontSize='14px' color='rgba(93, 102, 121, 1)'>
              {t("report_menu")}
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
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
              }}>
              <Image src={removeImg} alt='Remove' width={40} height={40} />
            </Box>
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ position: "absolute", top: -40, left: -30 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 4, pb: 3 }}>
          <Typography fontWeight={600} fontSize='18px' mb={1}>
            {t("delete_history_menu")}
          </Typography>
          <Typography fontSize='14px' color='#666'>
            {t("delete_dialog_description")}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 4,
            gap: 2,
            flexDirection: "column",
          }}>
          <Button
            onClick={() => handleDeleteBooking(booking.booking_id)}
            variant='contained'
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              bgcolor: "#98b720",
              "&:hover": { bgcolor: "#8ab020" },
              width: "100%",
            }}>
            {t("agree")}
          </Button>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant='outlined'
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              borderColor: "#ddd",
              color: "#666",
              width: "100%",
            }}>
            {t("reason_cancel_button")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ────────────────────────────────────────────────
// Review Modal
// ────────────────────────────────────────────────

const ReviewModal = ({
  open,
  onClose,
  hotelName,
  roomType,
  bookingTime,
  id,
  hastag,
  getHistoryBooking,
  setIssueModalOpen,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const tags = hastag.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag.value)
        ? prev.filter((t) => t !== tag.value)
        : [...prev, tag.value]
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("rating", rating.toString());
    formData.append("content", reviewText.trim());
    formData.append("tags", JSON.stringify(selectedTags));

    // Thêm hình ảnh nếu có
    // Note: Nếu bạn cần upload file thật, cần xử lý file từ e.target.files, không phải URL.createObjectURL
    // Ở đây giả định uploadedImages là array URL, nhưng để upload cần file gốc

    try {
      const res = await reviewBooking(id, formData);
      if (res?.message) {
        onClose();
        toast.success(res?.message);
        setReviewText("");
        setRating(0);
        setSelectedTags([]);
        getHistoryBooking();
        setIssueModalOpen(false); // nếu cần
      } else {
        toast.error(getErrorMessage(res.code) || res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi mạng");
    }
    setLoading(false);
  };

  const isSubmitDisabled =
    !rating || rating === 0 || reviewText.trim().length === 0 || loading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : "24px", overflow: "hidden" },
      }}>
      <DialogTitle sx={{ pb: 1, position: "relative" }}>
        <Typography fontWeight={700}>{t("review_modal_title")}</Typography>
        <Typography variant='body2' color='#666' sx={{ mt: 1 }}>
          {t("review_modal_subtitle")}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#999" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography fontWeight={600} mb={2}>
          {t("write_review_label")}
        </Typography>
        <Box textAlign='center' mb={3}>
          <Rating
            name='hotel-rating'
            value={rating}
            onChange={(e, v) => setRating(v)}
            sx={{
              fontSize: { xs: "2.8rem", sm: "3.8rem", md: "4.2rem" },
              gap: "12px",
              "& .MuiRating-iconFilled": { color: "#FFB400" },
              "& .MuiRating-iconHover": { color: "#FFB400" },
            }}
          />
        </Box>

        <Stack direction='row' gap={1} flexWrap='wrap' mb={3}>
          {tags.map((item, index) => (
            <Chip
              key={index}
              label={item.label[locale]}
              onClick={() => handleTagClick(item)}
              color={selectedTags.includes(item.value) ? "success" : "default"}
              variant={
                selectedTags.includes(item.value) ? "filled" : "outlined"
              }
              sx={{
                borderRadius: "20px",
                bgcolor: selectedTags.includes(item.value)
                  ? "#98b720 !important"
                  : "transparent",
                color: selectedTags.includes(item.value) ? "white" : "#666",
                borderColor: "#ddd",
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>

        <TextField
          multiline
          rows={4}
          placeholder={t("review_placeholder")}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          fullWidth
          variant='outlined'
          inputProps={{ maxLength: 1000 }}
          helperText={`${reviewText.length}/1000`}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused fieldset": {
                borderColor: "#98b720",
                borderWidth: 1.5,
              },
            },
          }}
        />

        <Box>
          <Typography fontWeight={600} mb={2}>
            {t("upload_media_label")}
          </Typography>
          <Stack direction='row' gap={2} flexWrap='wrap'>
            <label htmlFor='upload-images'>
              <input
                accept='image/*,video/*'
                id='upload-images'
                multiple
                type='file'
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  border: "2px dashed #ccc",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "#fafafa",
                  "&:hover": { borderColor: "#98b720", bgcolor: "#f0f8f0" },
                }}>
                <PhotoCamera sx={{ color: "#999", fontSize: 32 }} />
              </Box>
            </label>

            {uploadedImages.map((src, i) => (
              <Box key={i} sx={{ position: "relative" }}>
                <Avatar
                  variant='rounded'
                  src={src}
                  sx={{ width: 80, height: 80, borderRadius: "12px" }}
                />
                <IconButton
                  size='small'
                  onClick={() => handleRemoveImage(i)}
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    bgcolor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}>
                  <ClearIcon sx={{ color: "#e91e63", fontSize: "12px" }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>

      <Box sx={{ p: 3, pt: 2 }}>
        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          sx={{
            borderRadius: "30px",
            py: 1.8,
            fontSize: "16px",
            fontWeight: 600,
            textTransform: "none",
            bgcolor: "#98b720",
            "&:hover": { bgcolor: "#f0f8f0" },
            "&.Mui-disabled": { bgcolor: "#ccc", color: "#999" },
          }}>
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
              {t("submitting_review_button")}
            </>
          ) : (
            t("submit_review_button")
          )}
        </Button>
      </Box>
    </Dialog>
  );
};

// ────────────────────────────────────────────────
// BookingCard Skeleton
// ────────────────────────────────────────────────

const BookingCardSkeleton = () => {
  return (
    <Card sx={{ display: "flex", p: 2, gap: 2, borderRadius: 2 }}>
      <Skeleton
        variant='rectangular'
        width={120}
        height={80}
        sx={{ borderRadius: 1 }}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Skeleton variant='text' width={100} height={24} />
          <Skeleton variant='rounded' width={80} height={24} />
        </Box>

        <Skeleton variant='text' width='50%' height={28} />
        <Skeleton variant='text' width='30%' height={20} sx={{ mb: 1 }} />

        <Skeleton variant='text' width='70%' height={20} sx={{ mb: 1 }} />

        <Skeleton variant='text' width='60%' height={20} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}>
          <Skeleton variant='text' width={80} height={28} />
          <Skeleton
            variant='rectangular'
            width={100}
            height={36}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    </Card>
  );
};

// ────────────────────────────────────────────────
// Issue Booking
// ────────────────────────────────────────────────

function IssueBooking({ open, onClose, id, title }) {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [issueText, setIssueText] = useState("");
  const [issueTitle, setIssueTitle] = useState(title);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (issueText.trim() === "") return;

    const formData = new FormData();
    formData.append("title", issueTitle.trim());
    formData.append("description", issueText.trim());

    try {
      const res = await issueBooking(id, formData);
      if (res?.message) {
        onClose();
        toast.success("Báo cáo thành công");
        setIssueText("");
      } else {
        toast.error(getErrorMessage(res.code) || "Báo cáo thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi mạng");
    }
    setLoading(false);
  };

  const isSubmitDisabled = issueText.trim().length === 0 || loading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : "24px", overflow: "hidden" },
      }}>
      <DialogTitle sx={{ pb: 1, position: "relative" }}>
        <Typography variant='h6' fontWeight={700}>
          Báo cáo lỗi
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#999" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography fontWeight={600} mb={2}>
          Tiêu đề
        </Typography>
        <TextField
          placeholder='Viết suy nghĩ cảm nhận của bạn'
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
          fullWidth
          variant='outlined'
          inputProps={{ maxLength: 1000 }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused fieldset": {
                borderColor: "#98b720",
                borderWidth: 1.5,
              },
            },
          }}
        />
        <Typography fontWeight={600} mb={2}>
          Viết đánh giá
        </Typography>
        <TextField
          multiline
          rows={4}
          placeholder='Viết suy nghĩ cảm nhận của bạn'
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          fullWidth
          variant='outlined'
          inputProps={{ maxLength: 1000 }}
          helperText={`${issueText.length}/1000`}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "&.Mui-focused fieldset": {
                borderColor: "#98b720",
                borderWidth: 1.5,
              },
            },
          }}
        />
      </DialogContent>

      <Box sx={{ px: 3 }}>
        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          sx={{
            borderRadius: "30px",
            py: 1.8,
            fontSize: "16px",
            fontWeight: 600,
            textTransform: "none",
            bgcolor: "#98b720",
            "&:hover": { bgcolor: "#8ab020" },
            "&.Mui-disabled": { bgcolor: "#ccc", color: "#999" },
          }}>
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
              Gửi báo cáo...
            </>
          ) : (
            "Gửi báo cáo"
          )}
        </Button>
      </Box>
    </Dialog>
  );
}

// ────────────────────────────────────────────────
// Main MyBookingsPage
// ────────────────────────────────────────────────

export default function MyBookingsPage({
  historyBooking = [],
  getHistoryBooking,
  hastag,
  loading,
  pagination,
  onPageChange,
  setDetailBooking,
  navigateToRoom,
  bookingRefs,
  lastBookingIdRef,
  sortValue,
  setSortValue

}) {
  const t = useTranslations();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  

  const getBookingStatus = (booking: any) => {
    const paymentStatus = getPaymentStatus(booking.payments);
    const bookingStatus = booking.status;

    if (bookingStatus === "checked_out") {
      return { label: t("completed_status"), color: "#1A9A50", bg: "#E8F5E9" };
    }

    if (bookingStatus === "cancelled") {
      return { label: t("cancelled_status"), color: "#E91E1E", bg: "#FFEBEE" };
    }

    if (bookingStatus === "confirmed" && paymentStatus === "paid") {
      return {
        label: t("waiting_checkin_status"),
        color: "#0066CC",
        bg: "#E6F0FA",
      };
    }
    if (bookingStatus === "no_show" && paymentStatus === "paid") {
      return { label: t("no_show_status"), color: "#E91E1E", bg: "#FFEBEE" };
    }

    if (
      paymentStatus === "failed" ||
      paymentStatus === "pending" ||
      bookingStatus === "pending"
    ) {
      return {
        label: t("waiting_payment_status"),
        color: "#FF6D00",
        bg: "#FFF4E5",
      };
    }

    return {
      label: t("waiting_payment_status"),
      color: "#FF6D00",
      bg: "#FFF4E5",
    };
  };

  const filtered = historyBooking.filter((booking) => {
    if (sortValue === "all") return true;
    const status = getBookingStatus(booking).label;
    if (
      sortValue === "waiting_checkin" &&
      status === t("waiting_checkin_status")
    )
      return true;
    if (
      sortValue === "waiting_payment" &&
      status === t("waiting_payment_status")
    )
      return true;
    if (sortValue === "completed" && status === "Hoàn thành") return true;
    if (sortValue === "no_show" && status === "Không nhận phòng") return true;
    if (sortValue === "cancelled" && status === "Đã hủy") return true;
    return false;
  });

  return (
    <Box>
      <Box
        display='flex'
        alignItems='center'
        mb={3}
        justifyContent='space-between'>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight={600}
          color='#212529'>
          {t("my_bookings_title")}
        </Typography>
        {/* SortButton - giả định bạn có component này, nếu không thì thêm code */}
        <SortButton
          selected={sortValue}
          isMobile={isMobile}
          onSelect={setSortValue}
        />
      </Box>

      <Box>
        {loading ? (
          <BookingCardSkeleton />
        ) : (
          <>
            {historyBooking.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                gap={3}
                mt={8}
                alignItems='center'
                justifyContent='center'>
                <Image
                  src={no_room}
                  alt='No bookings'
                  width={200}
                  height={200}
                />
                <Typography textAlign='center' color='#999' fontSize='1.1rem'>
                  {t("no_bookings_message")}
                </Typography>
              </Box>
            ) : (
              <>
                {historyBooking.map((booking) => (
                  <BookingCard
                    key={booking.booking_id}
                    booking={booking}
                    setDetailBooking={setDetailBooking}
                    getHistoryBooking={getHistoryBooking}
                    hastag={hastag}
                    navigateToRoom={navigateToRoom}
                    bookingRefs={bookingRefs}
                    lastBookingIdRef={lastBookingIdRef}
                  />
                ))}

                <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
                  <Pagination
                    key={pagination.page}
                    count={pagination.total_pages}
                    page={pagination.page}
                    onChange={onPageChange}
                    siblingCount={1}
                    boundaryCount={1}
                    color='primary'
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#98b720 !important",
                        color: "white",
                        fontWeight: "bold",
                        boxShadow: "0 4px 8px rgba(139,195,74,0.4)",
                        "&:hover": { backgroundColor: "#7cb342 !important" },
                      },
                      "& .MuiPaginationItem-root": {
                        borderRadius: "8px",
                        margin: "0 4px",
                        "&:hover": { backgroundColor: "#e8f5e9" },
                      },
                      "& .MuiPaginationItem-ellipsis": { color: "#666" },
                    }}
                  />
                </Stack>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
const SortButton = ({
  selected,
  onSelect,
  isMobile,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const t = useTranslations();
  const sortOptions = [
    { label: t("all_states"), value: "all" },
    { label: t("waiting_checkin_status"), value: "waiting_checkin" },
    { label: t("waiting_payment_status"), value: "waiting_payment" },
    { label: t("completed_status"), value: "completed" },
    { label: t("cancelled_status"), value: "cancelled" },
    { label: t("no_show"), value: "no_show" },
  ];

  const selectedLabel =
    sortOptions.find((o) => o.value === selected)?.label || "Sắp xếp";

  return (
    <>
      <Button
        variant='outlined'
        size='small'
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          borderColor: "#eee",
          color: "#333",
          textTransform: "none",
          borderRadius: "12px",
          fontSize: "0.9rem",
          minWidth: 140,
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: "white",
          "&:hover": { borderColor: "#98b720", bgcolor: "transparent" },
        }}
        startIcon={
          !isMobile && <SwapVertIcon sx={{ fontSize: "22px !important" }} />
        }
        endIcon={
          open ? (
            <ArrowDropUpIcon
              sx={{ fontSize: "30px !important", color: "#98b720" }}
            />
          ) : (
            <ArrowDropDownIcon
              sx={{ fontSize: "30px !important", color: "#666" }}
            />
          )
        }>
        {selectedLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: 260,
          },
        }}>
        {sortOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => {
              onSelect(opt.value);
              setAnchorEl(null);
            }}
            sx={{
              height: 48,
              bgcolor: selected === opt.value ? "#f9f9f9" : "white",
            }}>
            <ListItemText>
              <Typography
                suppressHydrationWarning
                fontSize='0.9rem'
                color={selected === opt.value ? "#98b720" : "#666"}
                fontWeight={selected === opt.value ? 600 : 400}>
                {opt.label}
              </Typography>
            </ListItemText>
            {selected === opt.value && (
              <CheckIcon sx={{ fontSize: 18, color: "#98b720", ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
