"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper,
  Button,
  Modal,
  IconButton,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TextField,
  Rating,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  AcUnit as AcIcon,
  Wifi as WifiIcon,
  Bathtub as BathIcon,
  Weekend as SofaIcon,
  Pool as PoolIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Bathtub,
  PhotoCamera,
  Clear,
} from "@mui/icons-material";
import start from "../../images/star.svg";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import remove from "../../images/delete.png";
import { editReviewBooking, reviewDelete } from "../../service/booking";
import { toast } from "react-toastify";
import { useBookingContext } from "../../App";
import { facilities, getErrorMessage } from "../../utils/utils";
import { useTranslation } from "react-i18next";
interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  content: string;
}

const HotelDetailInfo = ({
  info,
  reviews,
  getReviewHotel,
  hastag,
  section2Ref,
  section3Ref,
  section4Ref,
  section5Ref,
  section6Ref,
  amenities,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const context = useBookingContext();
  const toggleExpand = (id: number) => {
    setExpandedReviews((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        sx={{
          fontSize: 14,
          color: i < Math.floor(rating) ? "#98b720" : "#e0e0e0",
        }}
      />
    ));
  };
  const avgRate =
    reviews.reduce((acc, r) => acc + r.rate, 0) / (reviews.length || 1);
  const starCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rate === star).length
  );
  const handleDeleteReview = async () => {
    setLoadingReview(true);
    try {
      let result = await reviewDelete(reviewDetail.id);
      if (result?.review_id) {
        toast.success(result?.message);
        getReviewHotel();
        setDeleteDialogOpen(false);
        setReviewDetail(null);
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
      }
    } catch (error) {
      console.log(error);
    }
    setLoadingReview(false);
  };
  console.log("AAAA context", context);
  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={5} sx={{ mx: "auto" }}>
        {/* === 1. GIỚI THIỆU KHÁCH SẠN === */}
        <Stack ref={section2Ref} spacing={2}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {t("hotel_intro_title")}
          </Typography>
          <Typography suppressHydrationWarning  fontSize='0.95rem' color='#666' lineHeight={1.7}>
            {info?.description?.vi}
            <Typography suppressHydrationWarning 
              component='span'
              color='#98b720'
              sx={{ cursor: "pointer", textDecoration: "underline" }}>
              {t("view_more")}
            </Typography>
          </Typography>
        </Stack>

        {/* === 2. TIỆN ÍCH KHÁCH SẠN === */}
        <Stack ref={section3Ref} spacing={3}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {t("hotel_amenities_title")}
          </Typography>
          <Grid container spacing={2}>
            {(() => {
              // Parse facilities từ DB (là JSON string dạng array id)
              const facilityIds = () => {
                if (!info?.amenities) return [];
                try {
                  const parsed =
                    typeof info.amenities === "string"
                      ? JSON.parse(info.amenities)
                      : Array.isArray(info.amenities)
                      ? info.amenities
                      : [];
                  return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  console.warn("Parse facilities error:", e);
                  return [];
                }
              };

              // Map id → object đầy đủ (label + icon)
              const selectedFacilities = amenities.filter((fac) =>
                facilityIds().includes(fac.id)
              );

              if (selectedFacilities.length === 0) {
                return (
                  <Typography suppressHydrationWarning  color='#999' fontStyle='italic'>
                    {t("no_amenities")}
                  </Typography>
                );
              }

              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                  {selectedFacilities.map((fac) => (
                    <Box
                      key={fac.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        bgcolor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: 3,
                        px: 1,
                        py: 0.5,
                      }}>
                      <Box
                        component='img'
                        src={fac.icon}
                        alt={fac.name.vi}
                        sx={{ width: 20, height: 20, objectFit: "contain" }}
                      />
                      <Typography suppressHydrationWarning  fontWeight={500} fontSize='0.85rem'>
                        {fac.name[currentLang]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })()}
          </Grid>
        </Stack>

        {/* === 3. ĐÁNH GIÁ === */}
        <Stack ref={section4Ref} spacing={4}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {t("reviews")}
          </Typography>

          {/* TỔNG ĐIỂM */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              py: 3,
              bgcolor: "#f9f9f9",
              px: 0,
            }}>
            <Grid container alignItems='start'>
              {/* Tổng điểm */}
              <Grid item xs={12} md={6}>
                <Box display={"flex"} gap={2}>
                  <Box
                    sx={{
                      bgcolor: "#98b720",
                      color: "white",
                      borderRadius: "12px",
                      px: 3,
                      py: 1.5,
                      fontSize: "2rem",
                      fontWeight: 700,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                    <Typography suppressHydrationWarning  variant='h2'>{avgRate.toFixed(1)}</Typography>
                  </Box>
                  <Box>
                    <Typography suppressHydrationWarning 
                      fontWeight={600}
                      fontSize='1.4rem'
                      color='rgba(152, 183, 32, 1)'>
                      {t("excellent")}
                    </Typography>
                    <Typography suppressHydrationWarning  fontSize='0.85rem' color='rgba(43, 47, 56, 1)'>
                      {t("from_reviews", { count: reviews.length })}
                    </Typography>
                    {/* <Typography suppressHydrationWarning  fontSize='0.8rem' color='#999'>
                    {t("from_reviews")}
                    </Typography> */}
                  </Box>
                </Box>
              </Grid>

              {/* Biểu đồ rating */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <Stack
                      key={star}
                      direction='row'
                      alignItems='center'
                      spacing={2}>
                      <Typography suppressHydrationWarning 
                        width={40}
                        fontSize='0.9rem'
                        display={"flex"}
                        alignItems={"center"}
                        gap={1}
                        color='#666'>
                        {star} <img src={start} alt='' />
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant='determinate'
                          value={starCounts[idx]}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#98b720",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='0.9rem'
                        color='#98b720'>
                        {starCounts[idx]}/100
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* DANH SÁCH REVIEW */}
          <Grid container gap={2} justifyContent={"space-between"}>
            {reviews.slice(0, 3).map((review) => {
              const isExpanded = expandedReviews.includes(review.created_at);
              const shortContent = review.comment.slice(0, 120) + "...";
              return (
                <Grid item xs={12} md={3.8} key={review.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "16px",
                      p: 2.5,
                      border: "1px solid #eee",
                      bgcolor: "white",
                    }}>
                    <Stack spacing={1.5}>
                      <Stack
                        direction='row'
                        spacing={1.5}
                        justifyContent={"space-between"}
                        alignItems='center'>
                        <img
                          src={review?.avatar}
                          width={40}
                          height={40}
                          style={{ borderRadius: "50%" }}
                          alt=''
                        />
                        <Box
                          display={"flex"}
                          width={"90%"}
                          justifyContent={"space-between"}>
                          <Box>
                            <Typography suppressHydrationWarning 
                              fontWeight={600}
                              fontSize='0.95rem'
                              color='#333'>
                              {review.user_name}
                            </Typography>
                            <Stack direction='row' spacing={0.5}>
                              {renderStars(review.rate)}
                            </Stack>
                          </Box>

                          <Box display={"flex"} alignItems={"start"} gap={1}>
                            <Typography suppressHydrationWarning  fontSize='0.75rem' color='#999'>
                              {review.created_at}
                            </Typography>
                            {Object.keys(context?.state?.user).length > 0 &&
                              context?.state?.user?.id == review?.user_id && (
                                <BorderColorIcon
                                  onClick={() => {
                                    setReviewDetail(review);
                                    setReviewModalOpen(true);
                                  }}
                                  sx={{ fontSize: "15px", cursor: "pointer" }}
                                />
                              )}
                            {Object.keys(context?.state?.user).length > 0 &&
                              context?.state?.user?.id == review?.user_id && (
                                <DeleteForeverIcon
                                  onClick={() => {
                                    setReviewDetail(review);
                                    setDeleteDialogOpen(true);
                                  }}
                                  sx={{
                                    color: "red",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                          </Box>
                        </Box>
                      </Stack>

                      <Typography suppressHydrationWarning 
                        fontSize='0.9rem'
                        color='#666'
                        lineHeight={1.6}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: isExpanded ? "unset" : 3,
                          WebkitBoxOrient: "vertical",
                        }}>
                        {review.comment}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          {reviews.length > 0 && (
            <Button
              variant='outlined'
              sx={{
                borderColor: "#98b720",
                color: "#98b720",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                mt: 3,
                px: 2,
                py: 1,
                alignSelf: "flex-start",
                "&:hover": { borderColor: "#7a9a1a", bgcolor: "#f0f8f0" },
              }}
              onClick={() => setOpenModal(true)}>
              {t("show_all_reviews")}
            </Button>
          )}
        </Stack>

        {/* === 4. CHÍNH SÁCH NHẬN - TRẢ PHÒNG === */}
        <Stack ref={section5Ref} spacing={3}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {t("checkin_policy_title")}
          </Typography>
          <Grid container>
            {[
              info?.rent_types?.hourly && {
                label: t("rent_type_hourly"),
                time: `${info?.rent_types?.hourly.from} - ${info?.rent_types?.hourly.to}`,
              },
              info?.rent_types?.overnight && {
                label: t("rent_type_overnight"),
                time: `${info?.rent_types?.overnight.from} - ${info?.rent_types?.overnight.to}`,
              },
              info?.rent_types?.daily && {
                label: t("rent_type_daily"),
                time: `${info?.rent_types?.daily.from} - ${info?.rent_types?.daily.to}`,
              },
            ]
              .filter(Boolean)
              .map((item) => (
                <Grid item xs={12} sm={2} key={item.label}>
                  <Stack>
                    <Typography suppressHydrationWarning  fontWeight={600} color='#333'>
                      {item.label}
                    </Typography>
                    <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666' mt={0.5}>
                      {item.time}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
          </Grid>
          <Typography suppressHydrationWarning  fontSize='0.85rem' color='#999'>
            {t("cancellation_note")}
          </Typography>
        </Stack>

        {/* === 5. CHÍNH SÁCH KHÁCH SẠN === */}
        <Stack ref={section6Ref} spacing={2}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem' color='#333'>
            {t("hotel_policy_title")}
          </Typography>
          <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666' lineHeight={1.7}>
            <strong>{t("policy_checkin_out_label")}</strong>{" "}
            {t("policy_checkin_time")} - {t("policy_checkout_time")} -{" "}
            {t("policy_early_checkin")}
            <br />
            {/* Phần trả phòng muộn */}
            <strong>{t("policy_late_checkout_label")}</strong>{" "}
            {t("policy_late_checkout_desc")} - {t("policy_after_17")}
          </Typography>
        </Stack>

        {/* === MODAL ĐÁNH GIÁ === */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            className='hidden-add-voice'
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: 700 },
              maxHeight: "90vh",
              bgcolor: "white",
              borderRadius: "16px",
              boxShadow: 24,
              p: 4,
              overflow: "auto",
            }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={3}>
              <Typography suppressHydrationWarning  fontWeight={700} fontSize='1.25rem' color='#333'>
                {t("reviews_title")}
              </Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* TỔNG ĐIỂM */}
            <Paper elevation={0} sx={{ borderRadius: "12px", p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid
                  container
                  alignItems='start'
                  justifyContent={"space-between"}>
                  <Grid item xs={12} md={5}>
                    <Box display={"flex"} gap={2}>
                      <Box
                        sx={{
                          bgcolor: "#98b720",
                          color: "white",
                          borderRadius: "12px",
                          px: 3,
                          py: 1.5,
                          fontSize: "2rem",
                          fontWeight: 700,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Typography suppressHydrationWarning  variant='h2'>
                          {avgRate.toFixed(1)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography suppressHydrationWarning 
                          fontWeight={600}
                          fontSize='1.4rem'
                          color='rgba(152, 183, 32, 1)'>
                          {t("excellent")}
                        </Typography>
                        <Typography suppressHydrationWarning 
                          fontSize='0.85rem'
                          color='rgba(43, 47, 56, 1)'>
                          {t("from_reviews", { count: reviews.length })}
                        </Typography>
                        <Typography suppressHydrationWarning  fontSize='0.8rem' color='#999'>
                          {t("by_users")}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={7}>
                    <Stack spacing={2}>
                      {[5, 4, 3, 2, 1].map((star, idx) => (
                        <Stack
                          key={star}
                          direction='row'
                          alignItems='center'
                          spacing={2}>
                          <Typography suppressHydrationWarning 
                            width={40}
                            fontSize='0.9rem'
                            display={"flex"}
                            alignItems={"center"}
                            gap={1}
                            color='#666'>
                            {star} <img src={start} alt='' />
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant='determinate'
                              value={starCounts[idx]}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: "#e0e0e0",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: "#98b720",
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                          <Typography suppressHydrationWarning 
                            fontWeight={600}
                            fontSize='0.9rem'
                            color='#98b720'>
                            {starCounts[idx]}/100
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>

            {/* DANH SÁCH REVIEW */}
            <Stack spacing={3}>
              {reviews.map((review) => (
                <Paper
                  key={review.id}
                  elevation={0}
                  sx={{ p: 3, borderRadius: "12px", border: "1px solid #eee" }}>
                  <Stack direction='row' spacing={2} alignItems='start' mb={1}>
                    <img
                      src={review?.avatar}
                      width={40}
                      height={40}
                      style={{ borderRadius: "50%" }}
                      alt=''
                    />

                    <Box>
                      <Typography suppressHydrationWarning  fontWeight={600}>
                        {review.user_name}
                        <br />
                        {renderStars(review.rate)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    <Stack direction='row' spacing={0.3}></Stack>
                    <Box display={"flex"} alignItems={"start"} gap={1}>
                      <Typography suppressHydrationWarning  fontSize='0.8rem' color='#999'>
                        {review.created_at}
                      </Typography>
                      {Object.keys(context?.state?.user).length > 0 &&
                        context?.state?.user?.id == review?.user_id && (
                          <BorderColorIcon
                            onClick={() => {
                              setReviewDetail(review);
                              setReviewModalOpen(true);
                            }}
                            sx={{ fontSize: "14px", cursor: "pointer" }}
                          />
                        )}
                      {Object.keys(context?.state?.user).length > 0 &&
                        context?.state?.user?.id == review?.user_id && (
                          <DeleteForeverIcon
                            onClick={() => {
                              setReviewDetail(review);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{
                              color: "red",
                              fontSize: "18px",
                              cursor: "pointer",
                            }}
                          />
                        )}
                    </Box>
                  </Stack>
                  <Typography suppressHydrationWarning  fontSize='0.9rem' color='#666' lineHeight={1.6}>
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
            </Stack>

            {/* <Button
              fullWidth
              variant='outlined'
              sx={{
                mt: 3,
                borderColor: "#98b720",
                color: "#98b720",
                borderRadius: "50px",
                py: 1.5,
                textTransform: "none",
              }}>
              Show All 100 Reviews
            </Button> */}
          </Box>
        </Modal>
      </Stack>
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
              <img src={remove} alt='' />
            </Box>
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ position: "absolute", top: -40, left: -30 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 4, pb: 3 }}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='18px' mb={1}>
            {t("delete_review_title")}
          </Typography>
          <Typography suppressHydrationWarning  fontSize='14px' color='#666'>
            {t("delete_confirm")}
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
            onClick={handleDeleteReview}
            variant='contained'
            disabled={loadingReview}
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              bgcolor: "#98b720",
              "&:hover": { bgcolor: "#8ab020" },
              width: "100%",
            }}>
            {loadingReview ? (
              <>
                <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                {t("deleting")}
              </>
            ) : (
              t("agree")
            )}{" "}
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
            {t("cancel")}
          </Button>
        </DialogActions>
      </Dialog>
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        id={reviewDetail?.id}
        hastag={hastag}
        reviewDetail={reviewDetail}
        getReviewHotel={getReviewHotel}
      />
    </Box>
  );
};

export default HotelDetailInfo;

function ReviewModal({
  open,
  onClose,
  id, // booking_id
  hastag,
  reviewDetail, // ← có thể null hoặc object như bạn gửi
  getReviewHotel,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
  hastag: any[];
  reviewDetail?: {
    id: string;
    rate: number;
    comment: string;
    hashtags: string[]; // dạng ["[\"roombeautyfull\",\"good\"]"] → cần parse
    attachments: { url: string }[];
  } | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const [rating, setRating] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // preview
  const [fileObjects, setFileObjects] = useState<File[]>([]); // file mới upload
  const [loading, setLoading] = useState(false);
  // Danh sách hashtag từ backend
  const tags = hastag.map((item) => ({
    label: item.name.vi,
    value: item.id,
  }));

  // Khi có reviewDetail → tự động fill dữ liệu
  useEffect(() => {
    if (reviewDetail) {
      setRating(reviewDetail.rate);
      setReviewText(reviewDetail.comment || "");

      // Xử lý hashtags: backend lưu dạng ["[\"tag1\",\"tag2\"]"] → cần parse
      const rawHashtags = reviewDetail.hashtags || [];
      const parsedTags: string[] = [];

      rawHashtags.forEach((item) => {
        try {
          const arr = JSON.parse(item); // ["roombeautyfull", "good"]
          parsedTags.push(...arr);
        } catch (e) {
          // nếu không parse được thì bỏ qua
        }
      });

      setSelectedTags(parsedTags);

      // Load ảnh cũ từ attachments
      if (reviewDetail.attachments && reviewDetail.attachments.length > 0) {
        const oldImages = reviewDetail.attachments.map((att: any) => att.url);
        setUploadedImages(oldImages);
      }
    } else {
      // Reset form khi tạo mới
      setRating(0);
      setReviewText("");
      setSelectedTags([]);
      setUploadedImages([]);
      setFileObjects([]);
    }
  }, [reviewDetail, open]);

  const handleTagClick = (tagValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFileObjects((prev) => [...prev, ...newFiles]);
    setUploadedImages((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setFileObjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!rating || rating === 0 || reviewText.trim() === "") {
      alert("Vui lòng chọn sao và viết đánh giá");
      return;
    }

    const formData = new FormData();
    formData.append("rate", rating.toString());
    formData.append("comment", reviewText.trim());
    formData.append("booking_id", id);

    // Hashtags: gửi dưới dạng JSON string của mảng id
    if (selectedTags.length > 0) {
      formData.append("hashtags", JSON.stringify(selectedTags));
    }

    // Gửi file mới (nếu có)
    fileObjects.forEach((file) => {
      formData.append("files", file);
    });

    // Nếu có ảnh cũ nhưng bị xóa → cần gửi thêm danh sách xóa (tùy API)
    // Ở đây tạm bỏ qua, bạn có thể thêm sau nếu cần

    try {
      const res = await editReviewBooking(id, formData);
      if (res?.review_id) {
        toast.success(res.message);
        await getReviewHotel(reviewDetail?.hotel_id);
        setUploadedImages([]);
        setFileObjects([]);
        onClose();
      } else {
        toast.error(getErrorMessage(res.code) || res.message);
      }
      console.log("Cập nhật thành công:", res);
    } catch (err) {
      console.error(err);
      alert("Lỗi mạng");
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
      fullScreen={isMobile}>
      <DialogTitle sx={{ pb: 1, position: "relative" }}>
        <Typography suppressHydrationWarning  variant='h6' fontWeight={700}>
          {reviewDetail ? t("edit_title") : t("create_title")}
        </Typography>

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box textAlign='center' mb={4}>
          <Rating
            value={rating}
            onChange={(e, v) => setRating(v)}
            size='large'
            sx={{
              fontSize: { xs: "3rem", sm: "4rem" },
              "& .MuiRating-iconFilled": { color: "#FFB400" },
            }}
          />
        </Box>

        <Stack direction='row' gap={1} flexWrap='wrap' mb={3}>
          {tags.map((tag) => (
            <Chip
              key={tag.value}
              label={tag.label}
              clickable
              onClick={() => handleTagClick(tag.value)}
              color={selectedTags.includes(tag.value) ? "success" : "default"}
              variant={selectedTags.includes(tag.value) ? "filled" : "outlined"}
              sx={{
                borderRadius: "20px",
                fontWeight: 500,
                bgcolor: selectedTags.includes(tag.value)
                  ? "#98b720"
                  : "transparent",
                color: selectedTags.includes(tag.value)
                  ? "white"
                  : "text.primary",
              }}
            />
          ))}
        </Stack>

        <Typography suppressHydrationWarning  fontWeight={600} mb={1}>
          {t("write_review")}
        </Typography>
        <TextField
          multiline
          rows={4}
          placeholder={t("placeholder")}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          fullWidth
          variant='outlined'
          inputProps={{ maxLength: 1000 }}
          helperText={`${reviewText.length}/1000`}
          sx={{ mb: 3 }}
        />

        <Typography suppressHydrationWarning  fontWeight={600} mb={2}>
          {t("images_videos")}
        </Typography>
        <Stack direction='row' gap={2} flexWrap='wrap'>
          <label htmlFor='upload-review-images'>
            <input
              accept='image/*,video/*'
              id='upload-review-images'
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
                "&:hover": { borderColor: "#98b720", bgcolor: "#f5f9f0" },
              }}>
              <PhotoCamera sx={{ fontSize: 32, color: "#999" }} />
            </Box>
          </label>

          {uploadedImages.map((src, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <Avatar
                variant='rounded'
                src={src}
                sx={{ width: 80, height: 80, borderRadius: "12px" }}
              />
              <IconButton
                size='small'
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  bgcolor: "white",
                  boxShadow: 3,
                  "&:hover": { bgcolor: "#ffebee" },
                }}>
                <Clear sx={{ fontSize: 16, color: "#e91e63" }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant='contained'
          size='large'
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          sx={{
            borderRadius: "30px",
            py: 1.8,
            fontSize: "1.1rem",
            fontWeight: 600,
            bgcolor: "#98b720",
            "&:hover": { bgcolor: "#8ab020" },
            "&.Mui-disabled": { bgcolor: "#ddd" },
          }}>
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
              {t("updating")}
            </>
          ) : (
            t("submit_button")
          )}
        </Button>
      </Box>
    </Dialog>
  );
}
