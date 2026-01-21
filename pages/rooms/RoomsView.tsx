"use client";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  Grid,
  Paper,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import React, { useCallback, useEffect, useRef, useState } from "react";
// === ICONS (giữ nguyên) ===
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FilterListIcon from "@mui/icons-material/FilterList";
import no_room from "../../images/No Navigation.svg";
import map from "../../images/maps.png";
import {
  default as starActive,
  default as starInactive,
} from "../../images/star.svg";
interface Amenity {
  label: string;
  icon: string;
  iconActive: string;
  active: boolean;
}

const ratings = [
  { label: "≥ 3.5", active: false, value: 3.5 },
  { label: "≥ 4.0", active: false, value: 4 },
  { label: "≥ 4.5", active: false, value: 4.5 },
];

const RoomsView = ({
  dataHotel,
  loading,
  setPage,
  total,
  page,
  getHotelLatLon,
  getHotel,
  totalAll,
  amenities,
  queryHotel,
  setQueryHotel,
  searchParams,
  loadingScroll,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [amenityList, setAmenityList] = useState(amenities);
  const [activeMap, setActiveMap] = useState(false);
  const [ratingList, setRatingList] = useState(ratings);
  // const [priceRange, setPriceRange] = useState<[number, number]>([
  //   20000, 10000000,
  // ]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const context = useBookingContext();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [center, setCenter] = useState({
    lat: 21.0285,
    lng: 105.8542,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    setAmenityList(amenities);
  }, [amenities]);
  useEffect(() => {
    if (activeMap) {
      getHotelLatLon({ lat: center.lat, lng: center.lng });
    }
  }, [center]);
  const handleAmenityToggle = (index: number) => {
    const newList = [...amenityList];
    newList[index].active = !newList[index].active;
    setQueryHotel({
      ...queryHotel,
      amenities: newList
        .filter((item) => item.active)
        .map((item) => item.id)
        .join(","),
    });
    setPage(1);
    setAmenityList(newList);
  };
  const formatPrice = (value: number): string => {
    if (value >= 10000000) return "10.000.000đ+";
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
  };
  const handleRatingToggle = (index: number) => {
    const clickedRating = ratingList[index];

    // Nếu đang active → click để bỏ chọn → tất cả false
    if (clickedRating.active) {
      const newList = ratingList.map(item => ({ ...item, active: false }));
      setRatingList(newList);

      setQueryHotel({
        ...queryHotel,
        page: 1,
        min_rating: null,  // Xóa filter rating
      });
      return;
    }

    // Nếu chưa active → chọn nó (và bỏ chọn các cái khác)
    const newList = ratingList.map((item, i) => ({
      ...item,
      active: i === index,
    }));

    setRatingList(newList);

    setQueryHotel({
      ...queryHotel,
      page: 1,
      min_rating: ratingList[index].value.toString(), // chỉ 1 giá trị
    });
  };
  const [priceRange, setPriceRange] = useState<[number, number]>([20000, 10000000]);
  const [minPriceRaw, setMinPriceRaw] = useState<string>(""); // raw khi focus
  const [maxPriceRaw, setMaxPriceRaw] = useState<string>("");
  // Hàm xử lý khi kéo slider (onChange)


  // Hàm chung để gọi API sau debounce (dùng cho cả slider và input)
  const debounceUpdateQuery = (newMin: number, newMax: number) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      console.log("Debounce gọi API với giá:", newMin, newMax); // debug
      setQueryHotel(prev => ({
        ...prev,
        min_price: newMin,
        max_price: newMax,
        page: 1,
      }));
    }, 800); // 800ms hoặc 1000ms tùy bạn
  };
  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    let [newMin, newMax] = newValue as [number, number];

    // Nếu kéo min vượt quá max → giữ nguyên min cũ
    if (newMin > newMax) {
      newMin = priceRange[0];  // Giữ nguyên min cũ
    }

    // Nếu kéo max nhỏ hơn min → giữ nguyên max cũ
    if (newMax < newMin) {
      newMax = priceRange[1];  // Giữ nguyên max cũ
    }

    // Cập nhật state
    setPriceRange([newMin, newMax]);

    // Debounce gọi API
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceUpdateQuery(newMin, newMax);
  };

  // Hàm xử lý khi người dùng nhập tay vào input min/max


  // Hàm format VND (dùng khi blur hoặc hiển thị không focus)
  const formatVND = (value: number | string): string => {
    const num = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '') || '0') : value;
    if (num === 0) return '';
    if (num >= 10000000) return '10.000.000+';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Khi focus: hiển thị số thô
  const handleMinFocus = () => {
    setMinPriceRaw(priceRange[0] === 0 ? "" : priceRange[0].toString());
  };

  const handleMaxFocus = () => {
    setMaxPriceRaw(priceRange[1] >= 10000000 ? "10000000" : priceRange[1].toString());
  };

  // Khi blur: format lại đẹp và cập nhật priceRange
  const handleMinBlur = () => {
    const num = parseInt(minPriceRaw.replace(/[^0-9]/g, '') || '0');
    const newMin = Math.max(0, Math.min(num, priceRange[1]));
    setPriceRange([newMin, priceRange[1]]);
    // Không cần set lại raw, vì focus sẽ set lại
  };

  const handleMaxBlur = () => {
    const num = parseInt(maxPriceRaw.replace(/[^0-9]/g, '') || '0');
    const newMax = Math.min(10000000, Math.max(num, priceRange[0]));
    setPriceRange([priceRange[0], newMax]);
    // Không set raw ở đây
  };

  // onChange: chỉ cập nhật raw (giữ nguyên số khi gõ)
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMinPriceRaw(value);

    const num = value ? Number(value) : 0;
    const newMin = Math.max(0, Math.min(num, priceRange[1]));
    setPriceRange([newMin, priceRange[1]]);
    debounceUpdateQuery(newMin, priceRange[1]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMaxPriceRaw(value);

    const num = value ? Number(value) : 0;
    const newMax = Math.min(10000000, Math.max(num, priceRange[0]));
    setPriceRange([priceRange[0], newMax]);
    debounceUpdateQuery(priceRange[0], newMax);
  };

  // Quan trọng: value của TextField sẽ thay đổi theo trạng thái focus/blur
  const isMinFocused = document.activeElement?.id === 'min-price';
  const isMaxFocused = document.activeElement?.id === 'max-price';

  // Đừng quên cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  const [locationAddress, setLocationAddress] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (location.pathname == "/rooms") {
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
  }, [location.pathname]);
  return (
    <Container
      maxWidth='lg'
      sx={{
        bgcolor: "#f9f9f9",
        py: { xs: 2, md: activeMap ? 0 : 3 },
        mb: activeMap ? 3 : 0,
      }}>
      {isMobile && !activeMap && (
        <SearchBarWithDropdown locationAddress={locationAddress} />
      )}
      {activeMap ? (
        <FilterMap
          setActiveMap={setActiveMap}
          getHotel={getHotel}
          setCenter={setCenter}
          center={center}
          dataHotel={dataHotel}
          page={page}
          setPage={setPage}
          isMobile={isMobile}
          isTablet={isTablet}
          loading={loading}
          total={total}
          searchParams={searchParams}
        />
      ) : (
        <Stack spacing={3} sx={{}}>
          {/* ================= HEADER: KẾT QUẢ + SẮP XẾP ================= */}

          <Grid container justifyContent={"space-between"}>
            {/* ================= LEFT: FILTERS ================= */}
            <Grid item xs={12} md={4} lg={3.3}>
              {/* NÚT MỞ FILTER - CHỈ HIỆN TRÊN MOBILE */}

              {/* FILTER DESKTOP - GIỮ NGUYÊN 100% */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Paper
                  elevation={0}
                  sx={{ borderRadius: "16px", p: 3, bgcolor: "white" }}>
                  <Stack spacing={4}>
                    {/* MAP */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 180,
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: `url("${map}")`,
                        backgroundRepeat: "no-repeat",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundSize: "100%",
                      }}>
                      <Box
                        onClick={() => setActiveMap(true)}
                        sx={{
                          bgcolor: "white",
                          borderRadius: "12px",
                          px: 2,
                          py: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          boxShadow: 1,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          border: "1px solid rgba(152, 183, 32, 1)",
                          color: "rgba(152, 183, 32, 1)",
                          height: "40px",
                          cursor: "pointer",
                        }}>
                        <LocationOnIcon
                          sx={{ fontSize: 16, color: "rgba(152, 183, 32, 1)" }}
                        />
                        {t("view_on_map")}
                      </Box>
                    </Box>

                    {/* KHOẢNG GIÁ */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={2}>
                        {t("price_range")}
                      </Typography>
                      <Typography suppressHydrationWarning  fontSize='0.8rem' color='#666' mb={2}>
                        {t("price_includes_all")}
                      </Typography>

                      <Box display="flex" justifyContent="center">
                        <Slider
                          value={priceRange}
                          onChange={handlePriceChange}
                          valueLabelDisplay="auto"           // ← Bật để thấy giá khi kéo (tùy chọn)
                          valueLabelFormat={(value) => formatPrice(value)}
                          min={0}
                          max={10000000}
                          step={10000}
                          sx={{
                            color: "#98b720",
                            width: "90%",
                            height: 6,
                            "& .MuiSlider-thumb": {
                              width: 18,
                              height: 18,
                              bgcolor: "white",
                              border: "3px solid #98b720",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                              "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0 0 0 8px rgba(152, 183, 32, 0.16)",
                              },
                            },
                            "& .MuiSlider-track": {
                              bgcolor: "#98b720",
                              border: "none",
                            },
                            "& .MuiSlider-rail": {
                              bgcolor: "#e0e0e0",
                              opacity: 1,
                            },
                          }}
                        />
                      </Box>

                      {/* Input nhập tay min & max - UX tốt hơn khi nhập thủ công */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={3} spacing={2}>
                        <Box flex={1}>
                          <Typography suppressHydrationWarning  fontSize="0.8rem" color="#666" mb={0.5}>
                            {t("min_price")}
                          </Typography>
                          <TextField
                            id="min-price"
                            fullWidth
                            size="small"
                            type="text"
                            value={isMinFocused ? minPriceRaw : formatVND(priceRange[0])}
                            onChange={handleMinInputChange}
                            onFocus={handleMinFocus}
                            onBlur={handleMinBlur}
                            InputProps={{
                              startAdornment: <Typography suppressHydrationWarning  sx={{ mr: 1 }}>₫</Typography>,
                            }}
                            placeholder="0"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",

                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#98b720",
                                  borderWidth: 1.5,
                                },
                              },
                            }}
                          />
                        </Box>



                        <Box flex={1}>
                          <Typography suppressHydrationWarning  fontSize="0.8rem" color="#666" mb={0.5}>
                            {t("max_price")}
                          </Typography>
                          <TextField
                            id="max-price"
                            fullWidth
                            size="small"
                            type="text"
                            value={isMaxFocused ? maxPriceRaw : formatVND(priceRange[1])}
                            onChange={handleMaxInputChange}
                            onFocus={handleMaxFocus}
                            onBlur={handleMaxBlur}
                            InputProps={{
                              startAdornment: <Typography suppressHydrationWarning  sx={{ mr: 1 }}>₫</Typography>,
                              endAdornment: priceRange[1] >= 10000000 ? (
                                <Typography suppressHydrationWarning  sx={{ ml: 1, color: "#98b720" }}>+</Typography>
                              ) : null,
                            }}
                            placeholder="10.000.000"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",

                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#98b720",
                                  borderWidth: 1.5,
                                },
                              },
                            }}
                          />
                        </Box>
                      </Stack>



                    </Stack>
                    <Divider />

                    {/* ĐIỂM ĐÁNH GIÁ */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={1.5}>
                        {t("rating_title")}
                      </Typography>
                      <Stack direction='row' flexWrap='wrap' gap={1}>
                        {ratingList.map((rating, i) => (
                          <Chip
                            key={i}
                            icon={
                              <Box
                                component='img'
                                src={rating.active ? starActive : starInactive}
                                sx={{ width: 16, height: 16 }}
                              />
                            }
                            label={rating.label}
                            onClick={() => handleRatingToggle(i)}
                            sx={{
                              bgcolor: rating.active ? "#f0f8f0" : "#fff",
                              color: rating.active
                                ? "#98b720"
                                : "rgba(185, 189, 199, 1)",
                              border: `1px solid ${rating.active ? "#98b720" : "#eee"
                                }`,
                              borderRadius: "50px",
                              fontSize: "0.85rem",
                              height: 36,
                              fontWeight: rating.active ? 600 : 400,
                              cursor: "pointer",
                              "& .MuiChip-icon": { ml: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* TIỆN ÍCH */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={1.5}>
                        {t("amenities_title")}
                      </Typography>
                      <Grid container spacing={1}>
                        {amenityList.map((item, i) => (
                          <Grid item xs={"auto"} key={i}>
                            <Chip
                              icon={
                                <Box
                                  component='img'
                                  src={item.icon}
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              }
                              label={item.name[currentLang] || item.name.vi}
                              onClick={() => handleAmenityToggle(i)}
                              sx={{
                                justifyContent: "flex-start",
                                bgcolor: item.active ? "#f0f8f0" : "white",
                                color: item.active
                                  ? "#98b720"
                                  : "rgba(185, 189, 199, 1)",
                                border: `1px solid ${item.active ? "#98b720" : "#eee"
                                  }`,
                                borderRadius: "50px",
                                fontSize: "0.8rem",
                                height: 40,
                                cursor: "pointer",
                                fontWeight: item.active ? 600 : 400,
                                "& .MuiChip-icon": { ml: 1.5, mr: 0.5 },
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>

              {/* DRAWER FILTER CHO MOBILE - MỞ TỪ DƯỚI LÊN */}
              <Drawer
                anchor='bottom'
                open={drawerOpen}
                className='hidden-story'
                onClose={() => setDrawerOpen(false)}
                sx={{
                  "& .MuiDrawer-paper": {
                    borderRadius: "14px 14px 0 0",
                    maxHeight: "90vh",

                    bgcolor: "white",
                  },
                }}>
                <Box className='hidden-story' sx={{ width: "100%" }}>
                  {/* Nút kéo */}
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 5,
                        bgcolor: "#ddd",
                        borderRadius: "10px",
                        mx: "auto",
                      }}
                    />
                  </Box>

                  {/* Tiêu đề */}
                  <Typography suppressHydrationWarning 
                    fontWeight={700}
                    fontSize='1.3rem'
                    textAlign='center'
                    mb={3}>
                    {t("filter_title")}
                  </Typography>

                  {/* Copy nguyên phần filter ở trên vào đây */}
                  <Stack spacing={4}>
                    {/* MAP */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 180,
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: `url("${map}")`,
                        backgroundRepeat: "no-repeat",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundSize: "100%",
                      }}>
                      <Box
                        onClick={() => setActiveMap(true)}
                        sx={{
                          bgcolor: "white",
                          borderRadius: "12px",
                          px: 2,
                          py: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          boxShadow: 1,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          border: "1px solid rgba(152, 183, 32, 1)",
                          color: "rgba(152, 183, 32, 1)",
                          height: "40px",
                          cursor: "pointer",
                        }}>
                        <LocationOnIcon
                          sx={{ fontSize: 16, color: "rgba(152, 183, 32, 1)" }}
                        />
                        {t("view_on_map")}
                      </Box>
                    </Box>

                    {/* KHOẢNG GIÁ */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={2}>
                        {t("price_range")}
                      </Typography>
                      <Typography suppressHydrationWarning  fontSize='0.8rem' color='#666' mb={2}>
                        {t("price_includes_all")}
                      </Typography>

                      <Box display="flex" justifyContent="center">
                        <Slider
                          value={priceRange}
                          onChange={handlePriceChange}
                          valueLabelDisplay="auto"           // ← Bật để thấy giá khi kéo (tùy chọn)
                          valueLabelFormat={(value) => formatPrice(value)}
                          min={0}
                          max={10000000}
                          step={10000}
                          sx={{
                            color: "#98b720",
                            width: "90%",
                            height: 6,
                            "& .MuiSlider-thumb": {
                              width: 18,
                              height: 18,
                              bgcolor: "white",
                              border: "3px solid #98b720",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                              "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0 0 0 8px rgba(152, 183, 32, 0.16)",
                              },
                            },
                            "& .MuiSlider-track": {
                              bgcolor: "#98b720",
                              border: "none",
                            },
                            "& .MuiSlider-rail": {
                              bgcolor: "#e0e0e0",
                              opacity: 1,
                            },
                          }}
                        />
                      </Box>

                      {/* Input nhập tay min & max - UX tốt hơn khi nhập thủ công */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={3} spacing={2}>
                        <Box flex={1}>
                          <Typography suppressHydrationWarning  fontSize="0.8rem" color="#666" mb={0.5}>
                            {t("min_price")}
                          </Typography>
                          <TextField
                            id="min-price"
                            fullWidth
                            size="small"
                            type="text"
                            value={isMinFocused ? minPriceRaw : formatVND(priceRange[0])}
                            onChange={handleMinInputChange}
                            onFocus={handleMinFocus}
                            onBlur={handleMinBlur}
                            InputProps={{
                              startAdornment: <Typography suppressHydrationWarning  sx={{ mr: 1 }}>₫</Typography>,
                            }}
                            placeholder="0"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",

                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#98b720",
                                  borderWidth: 1.5,
                                },
                              },
                            }}
                          />
                        </Box>



                        <Box flex={1}>
                          <Typography suppressHydrationWarning  fontSize="0.8rem" color="#666" mb={0.5}>
                            {t("max_price")}
                          </Typography>
                          <TextField
                            id="max-price"
                            fullWidth
                            size="small"
                            type="text"
                            value={isMaxFocused ? maxPriceRaw : formatVND(priceRange[1])}
                            onChange={handleMaxInputChange}
                            onFocus={handleMaxFocus}
                            onBlur={handleMaxBlur}
                            InputProps={{
                              startAdornment: <Typography suppressHydrationWarning  sx={{ mr: 1 }}>₫</Typography>,
                              endAdornment: priceRange[1] >= 10000000 ? (
                                <Typography suppressHydrationWarning  sx={{ ml: 1, color: "#98b720" }}>+</Typography>
                              ) : null,
                            }}
                            placeholder="10.000.000"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "16px",

                                backgroundColor: "#fff",
                                "&.Mui-focused fieldset": {
                                  borderColor: "#98b720",
                                  borderWidth: 1.5,
                                },
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Stack>
                    <Divider />

                    {/* ĐIỂM ĐÁNH GIÁ */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={1.5}>
                        {t("rating_title")}
                      </Typography>
                      <Stack direction='row' flexWrap='wrap' gap={1}>
                        {ratingList.map((rating, i) => (
                          <Chip
                            key={i}
                            icon={
                              <Box
                                component='img'
                                src={rating.active ? starActive : starInactive}
                                sx={{ width: 16, height: 16 }}
                              />
                            }
                            label={rating.label}
                            onClick={() => handleRatingToggle(i)}
                            sx={{
                              bgcolor: rating.active ? "#f0f8f0" : "#fff",
                              color: rating.active
                                ? "#98b720"
                                : "rgba(185, 189, 199, 1)",
                              border: `1px solid ${rating.active ? "#98b720" : "#eee"
                                }`,
                              borderRadius: "50px",
                              fontSize: "0.85rem",
                              height: 36,
                              fontWeight: rating.active ? 600 : 400,
                              cursor: "pointer",
                              "& .MuiChip-icon": { ml: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* TIỆN ÍCH */}
                    <Stack>
                      <Typography suppressHydrationWarning 
                        fontWeight={600}
                        fontSize='1rem'
                        color='#333'
                        mb={1.5}>
                        {t("amenities_title")}
                      </Typography>
                      <Grid container spacing={1}>
                        {amenityList.map((item, i) => (
                          <Grid item xs={"auto"} key={i}>
                            <Chip
                              icon={
                                <Box
                                  component='img'
                                  src={item.icon}
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              }
                              label={item.name[currentLang] || item.name.vi}
                              onClick={() => handleAmenityToggle(i)}
                              sx={{
                                justifyContent: "flex-start",
                                bgcolor: item.active ? "#f0f8f0" : "white",
                                color: item.active
                                  ? "#98b720"
                                  : "rgba(185, 189, 199, 1)",
                                border: `1px solid ${item.active ? "#98b720" : "#eee"
                                  }`,
                                borderRadius: "50px",
                                fontSize: "0.8rem",
                                height: 40,
                                cursor: "pointer",
                                fontWeight: item.active ? 600 : 400,
                                "& .MuiChip-icon": { ml: 1.5, mr: 0.5 },
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Stack>
                </Box>
                <Button
                  variant='contained'
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    bgcolor: "rgba(152, 183, 32, 1)",
                    color: "white",
                    borderRadius: "50px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(152,183,32,0.3)",
                    "&:hover": { bgcolor: "#43a047" },
                    mt: 1,
                  }}>
                  {t("apply_filter")}
                </Button>
              </Drawer>
            </Grid>

            {/* ================= RIGHT: DANH SÁCH KHÁCH SẠN (DỌC) ================= */}
            <Grid item xs={12} md={8} lg={8.4}>
              {Object.keys(context.state.user).length == 0 && (
                <PromotionBanner />
              )}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  bgcolor: "white",

                  top: 0,
                  zIndex: 100,
                  borderBottom: "1px solid #eee",
                  borderRadius: "10px",
                  mb: 2,
                }}>
                <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem'>
                  {t("filter_title")}
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<FilterListIcon />}
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    bgcolor: "rgba(152, 183, 32, 1)",
                    color: "white",
                    borderRadius: "50px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(152,183,32,0.3)",
                    "&:hover": { bgcolor: "#43a047" },
                  }}>
                  {t("apply_filter")}
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { xs: "row", sm: "row" },
                  gap: 2,
                  mb: 2,
                  pl: isMobile ? 2 : "unset",
                }}>
                <Box>
                  {searchParams.get("category") == "recommend" && (
                    <Typography suppressHydrationWarning  variant='h5' fontWeight={"bold"}>
                      {t("suggestions_for_you")}
                    </Typography>
                  )}
                  {searchParams.get("category") == "new" && (
                    <Typography suppressHydrationWarning  variant='h5' fontWeight={"bold"}>
                      {t("new_hotels")}
                    </Typography>
                  )}
                  {searchParams.get("category") == "toprated" && (
                    <Typography suppressHydrationWarning  variant='h5' fontWeight={"bold"}>
                      {t("top_voted")}
                    </Typography>
                  )}

                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Typography suppressHydrationWarning 
                      fontWeight={600}
                      fontSize={{ xs: "0.95rem", sm: "1rem" }}>
                      {loading ? (
                        <CircularProgress
                          size={14}
                          sx={{ color: "#98b720", fontSize: "15px" }}
                        />
                      ) : (
                        <>{totalAll}</>
                      )}{" "}
                      {t("search_results")}
                    </Typography>
                  </Stack>
                </Box>

                <SortButton
                  queryHotel={queryHotel}
                  setQueryHotel={setQueryHotel}
                />
              </Box>
              <ItemHotel
                dataHotel={dataHotel}
                page={page}
                setPage={setPage}
                isMobile={isMobile}
                isTablet={isTablet}
                loading={loading}
                total={total}
                searchParams={searchParams}
                loadingScroll={loadingScroll}
              />
            </Grid>
          </Grid>
        </Stack>
      )}
    </Container>
  );
};

export default RoomsView;

const FilterMap = ({
  dataHotel,
  loading,
  isMobile,
  isTablet,
  total,
  page,
  setPage,
  setCenter,
  center,
  setActiveMap,
  getHotel,
  searchParams,
}) => {
  const containerStyle = {
    width: "100%",
    height: "60vh",
    borderRadius: "10px",
  };

  const itemRefs = useRef({});
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [activeHotel, setActiveHotel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  const { t } = useTranslation();
  // Khi map dừng di chuyển (drag, zoom…)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setCenter(newPos);
          setUserLocation(newPos);
          // Optional: zoom gần hơn khi có vị trí thật
          if (mapRef.current) {
            mapRef.current.panTo(newPos);
            mapRef.current.setZoom(15);
          }
        },
        (error) => {
          console.warn("Không lấy được vị trí:", error.message);
          // fallback về Hà Nội hoặc vị trí mặc định
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);
  const onIdle = () => {
    if (!mapRef.current) return;

    const newCenter = mapRef.current.getCenter();
    const lat = newCenter.lat();
    const lng = newCenter.lng();

    // kiểm tra nếu giống nhau thì không update
    if (
      Math.abs(center.lat - lat) < 0.000001 &&
      Math.abs(center.lng - lng) < 0.000001
    ) {
      return;
    }

    setCenter({ lat, lng });
  };
  const parseField = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };
  return (
    <>
      {isMobile && (
        <Typography suppressHydrationWarning 
          my={2}
          onClick={() => {
            getHotel();
            setActiveMap(false);
          }}
          fontSize={"20px"}
          color='#48505E'
          display={"flex"}
          sx={{ cursor: "pointer" }}
          alignItems={"center"}
          gap={1}>
          <ArrowBackIosNewIcon sx={{ fontSize: "19px" }} />
          {t("view_list")}
        </Typography>
      )}
      <Grid
        justifyContent={"space-between"}
        flexDirection={isMobile ? "column-reverse" : "row"}
        container>
        <Grid item xs={12} md={5}>
          {!isMobile && (
            <Typography suppressHydrationWarning 
              my={2}
              onClick={() => {
                getHotel();
                setActiveMap(false);
              }}
              fontSize={"20px"}
              color='#48505E'
              display={"flex"}
              sx={{ cursor: "pointer" }}
              alignItems={"center"}
              gap={1}>
              <ArrowBackIosNewIcon sx={{ fontSize: "19px" }} />
              {t("view_list")}
            </Typography>
          )}
          <Box
            height={"50vh"}
            className='hidden-add-voice'
            sx={{ overflowY: "scroll" }}>
            <ItemHotel
              setActiveHotel={setActiveHotel}
              dataHotel={dataHotel}
              page={page}
              setPage={setPage}
              isMobile={isMobile}
              isTablet={isTablet}
              loading={loading}
              total={total}
              isMap={true}
              searchParams={searchParams}
              activeHotel={activeHotel}
              itemRefs={itemRefs}
            />
          </Box>
        </Grid>
        <Grid itemxs={12} md={6.8}>
          <LoadScript googleMapsApiKey='AIzaSyASJk1hzLv6Xoj0fRsYnfuO6ptOXu0fZsc'>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14}
              onLoad={onLoad}
              onIdle={onIdle}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }],
                  },
                ],
              }}>
              {/* MARKERS */}
              {dataHotel?.map((hotel) => {
                const type = searchParams.get("type") || "default"; // lấy type từ params, fallback nếu ko có
                const price = hotel?.price_min?.[type];

                const priceText = price
                  ? `${price.toLocaleString("vi-VN")}đ`
                  : "N/A";

                return (
                  <Marker
                    key={hotel.id}
                    position={{ lat: hotel.latitude, lng: hotel.longitude }}
                    onClick={() => setActiveHotel(hotel)}
                    label={{
                      text: priceText,                    // ví dụ: "1.250.000đ"
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "bold",
                      className: "custom-marker-label",   // thêm class để style
                    }}
                  // Ẩn icon mặc định nếu chỉ muốn label (tùy chọn)
                  // icon={{ url: "data:image/svg+xml,<svg></svg>" }} // transparent
                  />
                );
              })}

              {/* INFO WINDOW */}
              {activeHotel && (
                <InfoWindow
                  position={{
                    lat: activeHotel.latitude,
                    lng: activeHotel.longitude,
                  }}
                  onCloseClick={() => setActiveHotel(null)}>
                  <Box sx={{ width: 230 }}>
                    {(() => {
                      const imgs = parseField(activeHotel.images) || [];
                      const nameObj = parseField(activeHotel.name) || {};
                      const addressObj = parseField(activeHotel.address) || {};

                      const hotelName = nameObj.vi || nameObj.en || "Unnamed";
                      const hotelAddress = addressObj.vi || addressObj.en || "";

                      return (
                        <Box
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            const current = Object.fromEntries([
                              ...searchParams,
                            ]);

                            // ---- xử lý mặc định ---- //
                            const now = new Date();

                            // format yyyy-MM-dd
                            const formatDate = (d) =>
                              d.toISOString().split("T")[0];

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
                            current.checkIn =
                              current.checkIn || formatDate(now);
                            current.checkOut =
                              current.checkOut || formatDate(now);
                            current.checkInTime =
                              current.checkInTime || formatHour(now);
                            current.duration = current.duration || 2;

                            // ---- build URL ---- //
                            navigate(
                              `/room/${activeHotel.id}?${new URLSearchParams(
                                current
                              ).toString()}&name=${hotelName}`
                            );
                          }}>
                          <img
                            src={imgs[0]}
                            style={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />

                          <Typography suppressHydrationWarning  sx={{ fontWeight: 700, mt: 1 }}>
                            {hotelName}
                          </Typography>

                          <Typography suppressHydrationWarning  sx={{ fontSize: 13, color: "#666" }}>
                            {hotelAddress}
                          </Typography>

                          <Typography suppressHydrationWarning  sx={{ mt: 1, fontSize: 14 }}>
                            ⭐ {activeHotel?.rating} / 5
                          </Typography>

                          <Typography suppressHydrationWarning  sx={{ fontSize: 14, color: "#FF5722" }}>
                            Từ{" "}
                            {activeHotel?.price_min?.[
                              searchParams.get("type")
                            ]?.toLocaleString("vi-VN")}
                            đ / đêm
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </Grid>
      </Grid>
    </>
  );
};

const ItemHotel = ({
  dataHotel,
  loading,
  isMobile,
  isTablet,
  total,
  page,
  setPage,
  isMap,
  setActiveHotel,
  searchParams,
  activeHotel,
  itemRefs,
  loadingScroll,
}) => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const isRequesting = useRef(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (!activeHotel) return;

    const el = itemRefs.current[activeHotel.id];
    if (!el) return;

    // scroll vào giữa
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeHotel, dataHotel]);
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];

      if (target.isIntersecting && !loading && !isRequesting.current) {
        if (page < total) {
          isRequesting.current = true;
          setPage((prev) => prev + 1);
        }
      }
    });

    observer.observe(node);

    return () => observer.unobserve(node);
  }, [loadMoreRef.current, loading, page, total]);
  useEffect(() => {
    if (!loadingScroll) {
      isRequesting.current = false; // 🔓 mở khóa để cho phép load tiếp trang sau
    }
  }, [loadingScroll]);

  return (
    <>
      {loading ? (
        /* LOADING + ICON LOADING */
        <Stack spacing={3} alignItems='center'>
          {/* SKELETON CARDS - GIỐNG HỆT ẢNH */}
          <Stack spacing={3} width='100%'>
            {[...Array(isMobile ? 1 : isTablet ? 2 : 3)].map((_, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  bgcolor: "white",
                  height: { xs: 200, sm: isMap ? 160 : 200 },
                }}>
                <Grid container>
                  {/* Ảnh + tag */}
                  <Grid item xs={12} sm={5} md={4}>
                    <Box sx={{ position: "relative", height: "100%" }}>
                      <Skeleton
                        variant='rectangular'
                        width='100%'
                        height={isMap ? "80%" : "100%"}
                        sx={{ borderRadius: "20px" }}
                      />
                      {/* <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                width: 80,
                                height: 24,
                                borderRadius: "4px",
                              }}>
                              <Skeleton width='100%' height='100%' />
                            </Box> */}
                    </Box>
                  </Grid>

                  {/* Nội dung */}
                  <Grid item xs={12} sm={7} md={8}>
                    <Stack
                      p={2}
                      spacing={1.5}
                      height='100%'
                      justifyContent='space-between'>
                      <Box>
                        <Skeleton width='80%' height={28} />
                        <Skeleton width='60%' height={20} mt={0.5} />
                        <Skeleton width='50%' height={20} mt={0.5} />
                      </Box>

                      <Stack alignItems='flex-end'>
                        <Skeleton width='40%' height={20} />
                        <Skeleton width='60%' height={32} mt={1} />
                        <Skeleton
                          width='50%'
                          height={36}
                          mt={1}
                          sx={{ borderRadius: "6px" }}
                        />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Stack>
      ) : (
        <>
          {dataHotel.length > 0 ? (
            <Stack spacing={3}>
              {dataHotel.map((hotel, i) => (
                <Paper
                  key={i}
                  ref={(el) => isMap && (itemRefs.current[hotel.id] = el)}
                  onClick={() => {
                    const current = Object.fromEntries([...searchParams]);

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
                    current.checkInTime =
                      current.checkInTime || formatHour(now);
                    current.duration = current.duration || 2;

                    // ---- build URL ---- //
                    navigate(
                      `/room/${hotel.id}?${new URLSearchParams(
                        current
                      ).toString()}&name=${JSON.parse(hotel.name).vi || JSON.parse(hotel.name).en
                      }`
                    );
                  }}
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    bgcolor: "white",
                    transition: "0.2s",
                    "&:hover": { boxShadow: 3 },
                    height: { xs: "auto", sm: isMap ? "160px" : "200px" }, // responsive height mobile
                    minHeight: { xs: 380, sm: "unset" }, // tránh card quá ngắn trên mobile
                    cursor: "pointer",
                    border:
                      isMap && activeHotel?.id == hotel.id
                        ? "1px solid #98b720"
                        : "unset",
                  }}>
                  <Grid container>
                    {/* Ảnh */}
                    <Grid item xs={12} sm={5} md={4}>
                      <Box
                        sx={{
                          position: "relative",
                          height: { xs: 200, sm: isMap ? "160px" : "200px" },
                        }}>
                        {hotel?.tag && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              bgcolor: "#ff9800",
                              color: "white",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              zIndex: 1,
                            }}>
                            {hotel?.tag}
                          </Box>
                        )}
                        <img
                          src={JSON.parse(hotel.images)[0]}
                          alt={JSON.parse(hotel.images)[0]}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "15px",
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Nội dung */}
                    <Grid item xs={12} sm={7} md={8}>
                      <Stack
                        px={2}
                        py={{ xs: 2, sm: 0 }} // thêm chút padding dọc trên mobile cho dễ đọc
                        spacing={1.5}
                        height='100%'
                        justifyContent='space-between'>
                        <Box>
                          <Typography suppressHydrationWarning  fontWeight={600} fontSize='1.1rem'>
                            {parseName(hotel.name)}
                          </Typography>
                          <Typography suppressHydrationWarning  fontSize='0.85rem' color='#999' mt={0.5}>
                            {parseName(hotel.address)}
                          </Typography>
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={0.5}
                            ml={"2px"}
                            mt={0.5}>
                            <Box
                              component='img'
                              src={starActive}
                              sx={{ width: 16, height: 16 }}
                            />
                            <Typography suppressHydrationWarning 
                              fontSize='0.9rem'
                              color='#98b720'
                              fontWeight={600}>
                              {hotel.rating}
                            </Typography>
                            <Typography suppressHydrationWarning  fontSize='0.8rem' color='#666'>
                              ({hotel.review_count || 100})
                            </Typography>
                          </Stack>
                          <Stack
                            direction='row'
                            alignItems='center'
                            spacing={0.5}
                            mt={0.5}>
                            <LocationOnIcon
                              sx={{ fontSize: "18px", color: "#ccc" }}
                            />
                            <Typography suppressHydrationWarning 
                              fontSize='0.9rem'
                              color='#98b720'
                              fontWeight={600}>
                              {hotel?.distance_km?.toFixed(1)}km
                            </Typography>
                            <Typography suppressHydrationWarning  fontSize='0.8rem' color='#666'>
                              ({parseName(hotel?.address) || 100})
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack
                          direction='row'
                          justifyContent='end'
                          alignItems='flex-end'>
                          <Stack alignItems={"end"}>
                            <Typography suppressHydrationWarning  fontSize='14px' color='#999'>
                              {t("price_for_short_stay")}
                            </Typography>
                            <Typography suppressHydrationWarning 
                              fontWeight={700}
                              color='#98b720'
                              fontSize='1.25rem'
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "end",
                              }}>
                              <Typography suppressHydrationWarning 
                                fontSize='14px'
                                lineHeight={2}
                                color='#999'>
                                {t("from_price")}
                              </Typography>{" "}
                              {hotel?.price_min?.[
                                searchParams.get("type")
                              ]?.toLocaleString("vi-VN")}
                              đ
                            </Typography>

                            {/* <Box
                            sx={{
                              bgcolor: "rgba(255, 237, 233, 1)",
                              color: "rgba(204, 50, 0, 1)",
                              px: 2.5,
                              py: 1,
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}>
                            Chỉ còn {hotel.remaining || 1} phòng
                          </Box> */}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              {loadingScroll && (
                <>
                  <Stack spacing={3} width='100%'>
                    {[...Array(isMobile ? 1 : isTablet ? 2 : 3)].map((_, i) => (
                      <Paper
                        key={i}
                        elevation={0}
                        sx={{
                          borderRadius: "16px",
                          overflow: "hidden",
                          bgcolor: "white",
                          height: { xs: 200, sm: isMap ? 160 : 200 },
                        }}>
                        <Grid container>
                          {/* Ảnh + tag */}
                          <Grid item xs={12} sm={5} md={4}>
                            <Box sx={{ position: "relative", height: "100%" }}>
                              <Skeleton
                                variant='rectangular'
                                width='100%'
                                height={isMap ? "80%" : "100%"}
                                sx={{ borderRadius: "20px" }}
                              />
                              {/* <Box
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                width: 80,
                                height: 24,
                                borderRadius: "4px",
                              }}>
                              <Skeleton width='100%' height='100%' />
                            </Box> */}
                            </Box>
                          </Grid>

                          {/* Nội dung */}
                          <Grid item xs={12} sm={7} md={8}>
                            <Stack
                              p={2}
                              spacing={1.5}
                              height='100%'
                              justifyContent='space-between'>
                              <Box>
                                <Skeleton width='80%' height={28} />
                                <Skeleton width='60%' height={20} mt={0.5} />
                                <Skeleton width='50%' height={20} mt={0.5} />
                              </Box>

                              <Stack alignItems='flex-end'>
                                <Skeleton width='40%' height={20} />
                                <Skeleton width='60%' height={32} mt={1} />
                                <Skeleton
                                  width='50%'
                                  height={36}
                                  mt={1}
                                  sx={{ borderRadius: "6px" }}
                                />
                              </Stack>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
              {!isMap && (
                <Box display={"flex"} justifyContent={"center"}>
                  {/* <Pagination
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "#98b720",
                      },
                      "& .Mui-selected": {
                        backgroundColor: "#98b720 !important", // màu background khi active
                        color: "#fff", // chữ khi active
                      },
                      "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "#d0e65f", // màu hover
                      },
                    }}
                    count={total}
                  /> */}
                  <div ref={loadMoreRef} style={{ height: "1px" }} />
                </Box>
              )}
            </Stack>
          ) : (
            <Box
              display={"flex"}
              justifyContent={"center"}
              height={isMap ? "40vh" : "60vh"}
              alignItems={"center"}>
              <Box
                display={"flex"}
                justifyContent={"center"}
                flexDirection={"column"}
                alignItems={"center"}>
                <img src={no_room} alt='' />
                <Typography suppressHydrationWarning  mt={3}>{t("no_results")}</Typography>
              </Box>
            </Box>
          )}
        </>
      )}
    </>
  );
};

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CheckIcon from "@mui/icons-material/Check";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const SortButton = ({ queryHotel, setQueryHotel }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();
  const sortOptions = [
    { label: t("sort.most_relevant"), value: "all" },
    { label: t("sort.distance_near_to_far"), value: "distance" },
    { label: t("sort.rating_high_to_low"), value: "rating" },
    { label: t("sort.price_low_to_high"), value: "price_asc" },
    { label: t("sort.price_high_to_low"), value: "price_desc" },
  ];
  const [selected, setSelected] = useState(sortOptions[0].value);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value: string) => {
    setSelected(value);
    handleClose();
    setQueryHotel({ ...queryHotel, page: 1, sort_by: value });
  };

  const selectedLabel = sortOptions.find(
    (opt) => opt.value === selected
  )?.label;

  return (
    <>
      <Button
        variant='outlined'
        size='small'
        onClick={handleClick}
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
          "&:hover": {
            borderColor: "#98b720",
            bgcolor: "transparent",
          },
        }}
        startIcon={<SwapVertIcon sx={{ fontSize: "22px !important" }} />}
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
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: 260,
            overflow: "hidden",
          },
        }}
        MenuListProps={{
          sx: { p: 0 },
        }}>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            sx={{
              height: 48,
              bgcolor: selected === option.value ? "#f9f9f9" : "white",
              "&:hover": {
                bgcolor: selected === option.value ? "#f0f8f0" : "#f5f5f5",
              },
            }}>
            <ListItemText
              primary={
                <Typography suppressHydrationWarning 
                  fontSize='0.9rem'
                  color={selected === option.value ? "#98b720" : "#666"}
                  fontWeight={selected === option.value ? 600 : 400}>
                  {option.label}
                </Typography>
              }
            />
            {selected === option.value && (
              <ListItemIcon sx={{ minWidth: 24, justifyContent: "flex-end" }}>
                <CheckIcon sx={{ fontSize: 18, color: "#98b720" }} />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

import { useBookingContext } from "../../App";
import SearchBarWithDropdown from "../../components/SearchBarWithDropdownHeader";
import gift from "../../images/image 8.png";
import { getLocation } from "../../service/hotel";
import { parseName } from "../../utils/utils";
import { useTranslation } from "react-i18next";

function PromotionBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        borderRadius: "16px",
        // ĐÃ SỬA: thêm md và đóng ngoặc đúng
        my: 2,
        position: "relative",
        overflow: "hidden",
        background: "white",
        py: { xs: 2, md: 0 },
      }}>
      <Container maxWidth='lg'>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 6 }}
          alignItems='center'
          justifyContent='space-between'>
          {/* Phần trái: quà + text */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems='center'
            textAlign={{ xs: "center", md: "left" }}
            flex={1}>
            {/* Icon quà tặng */}
            <Box
              sx={{
                fontSize: { xs: 80, md: 80 },
                color: "#e91e63",
              }}>
              {/* Nếu bạn có hình quà tặng thì dùng, không thì dùng icon */}
              <img
                src={gift}
                alt='Quà tặng'
                style={{ width: "100%", height: "auto", maxWidth: "120px" }}
              />
              {/* Hoặc dùng icon MUI nếu không có ảnh */}
              {/* <Gift sx={{ fontSize: "inherit" }} /> */}
            </Box>

            <Box>
              <Typography suppressHydrationWarning 
                variant='h6'
                fontWeight='bold'
                color='#2B2F38'
                gutterBottom
                sx={{ lineHeight: 1.3, fontSize: "17px" }}>
                {t("promotion_title")}
              </Typography>
              <Typography suppressHydrationWarning  fontSize={"12px"} color='#5D6679'>
                {t("promotion_desc")}
              </Typography>
            </Box>
          </Stack>

          {/* Nút Đăng ký ngay */}
          <Button
            onClick={() => {
              navigate("/register");
            }}
            variant='contained'
            sx={{
              bgcolor: "#98b720",
              color: "white",
              borderRadius: "16px",
              px: 3,
              py: 1.2,
              textTransform: "none",
            }}>
            {t("register_now")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
