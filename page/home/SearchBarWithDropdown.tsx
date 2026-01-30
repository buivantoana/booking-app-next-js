"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Button,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popper,
  useMediaQuery,
  useTheme,
  ClickAwayListener,
  IconButton,
  Container,
  Modal,
  CircularProgress,
} from "@mui/material";

import {
  LocationOn,
  AccessTime,
  Nightlight,
  CalendarToday,
  Event,
  PeopleOutline,
  Search,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Close,
} from "@mui/icons-material";

import { DateCalendar, LocalizationProvider, PickersCalendarHeader } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import in_time from "../../images/login.png";
import out_time from "../../images/logout.png";
import query from "../../images/location-load.gif";

import { getLocation, getSuggest } from "../../service/hotel";

import { mapLocale, parseName } from "../../utils/utils";
import building from "../../images/buildings.png";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import "dayjs/locale/ko";
import "dayjs/locale/ja";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
// === POPUP CHUNG ===
// === POPUP CHUNG ===
interface DateRangePickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: any;
  onApply: (
    checkIn: Dayjs | null,
    checkOut: Dayjs | null,
    time?: string,
    duration?: number
  ) => void;
  bookingType: "hourly" | "overnight" | "daily";
  initialCheckIn?: Dayjs | null;
  initialCheckOut?: Dayjs | null;
  initialTime?: string | null;
  initialDuration?: number | null;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  open,
  anchorEl,
  onClose,
  onApply,
  bookingType,
  initialCheckIn,
  initialCheckOut,
  initialTime,
  initialDuration,
}) => {
  const [checkIn, setCheckIn] = useState<Dayjs | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(initialCheckOut || null);
  const [time, setTime] = useState<string>(initialTime || "");
  const [duration, setDuration] = useState<number>(initialDuration || 2);
  const [selecting, setSelecting] = useState<"checkIn" | "checkOut">("checkIn");
  
  const now = dayjs();
  const hours = Array.from(
    { length: 24 },
    (_, i) => String(i).padStart(2, "0") + ":00"
  );
  const durations = [2, 3, 4, 5, 6, 8, 10, 12];
  const t = useTranslations();
  const locale = useLocale(); 
  const hourIndex = hours.indexOf(time);
  const durationIndex = durations.indexOf(duration);

  // Thiết lập giá trị mặc định khi mở popup
  useEffect(() => {
    if (open) {
      if (initialCheckIn) {
        setCheckIn(initialCheckIn);
      } else if (bookingType !== "hourly") {
        setCheckIn(now);
      }
      
      if (initialCheckOut) {
        setCheckOut(initialCheckOut);
      } else if (bookingType === "daily" && initialCheckIn) {
        setCheckOut(initialCheckIn.add(1, "day"));
      } else if (bookingType === "overnight" && initialCheckIn) {
        setCheckOut(initialCheckIn.add(1, "day"));
      }
      
      // Mặc định đang chọn checkIn
      setSelecting("checkIn");
    }
  }, [open, bookingType]);

  // Hiệu ứng tự động apply khi đóng (giữ nguyên logic cũ)
  useEffect(() => {
    if(!open){
      if (!checkIn) return;
      
      if (bookingType === "hourly") {
        if (time && duration) {
          const endTime = checkIn
            .hour(parseInt(time.split(":")[0]))
            .minute(0)
            .add(duration, "hour");
          onApply(checkIn, endTime, time, duration);
        }
      } else {
        // overnight & daily
        let finalCheckOut = checkOut;
        if (!finalCheckOut || finalCheckOut.isBefore(checkIn)) {
          finalCheckOut = checkIn.add(1, "day");
        }
        onApply(checkIn, finalCheckOut);
      }
    }
  }, [open]);

  const handleApply = () => {
    if (bookingType === "hourly" && checkIn) {
      const endTime = checkIn
        .hour(parseInt(time.split(":")[0]))
        .minute(0)
        .add(duration, "hour");
      onApply(checkIn, endTime, time, duration);
    } else {
      onApply(checkIn, checkOut);
    }
    onClose();
  };

  // Thiết lập thời gian mặc định cho hourly booking
  useEffect(() => {
    if (bookingType === "hourly" && !time) {
      const now = dayjs();
      const nextHour = now.add(1, "hour").startOf("hour");
      const formatted = nextHour.format("HH:00");
      setTime(formatted);
    }
  }, [bookingType]);

  const handleReset = () => {
    setCheckIn(dayjs());
    setCheckOut(null);
    setSelecting("checkIn");
    
    if (bookingType === "hourly") {
      const nextHour = now.add(1, "hour").startOf("hour");
      const formatted = nextHour.format("HH:00");
      setTime(formatted);
      setDuration(2);
    }
  };

  const isToday = checkIn && checkIn.isSame(now, "day");
  const disabledHours = isToday
    ? hours.filter((h) => {
      const hourNum = parseInt(h.split(":")[0]);
      return hourNum <= now.hour(); // disable những giờ đã qua
    })
    : [];

  // Hàm xử lý chọn ngày - Airbnb style chỉ cho daily booking
  const handleDateSelectDaily = (date: Dayjs) => {
    if (selecting === "checkIn") {
      // Chọn checkIn
      setCheckIn(date);
      // Nếu checkOut tồn tại và nhỏ hơn hoặc bằng checkIn mới, reset checkOut
      if (checkOut && (checkOut.isSame(date, "day") || checkOut.isBefore(date, "day"))) {
        setCheckOut(null);
      }
      setSelecting("checkOut");
    } else {
      // Chọn checkOut - phải sau checkIn
      if (date.isAfter(checkIn, "day")) {
        setCheckOut(date);
        setSelecting("checkIn"); // Chuẩn bị cho lần chọn tiếp theo
      } else {
        // Nếu chọn ngày trước checkIn, coi như reset và chọn checkIn mới
        setCheckIn(date);
        setCheckOut(null);
        setSelecting("checkOut");
      }
    }
  };

  // Hàm xử lý chọn ngày cho overnight - logic cũ
  const handleDateSelectOvernight = (date: Dayjs) => {
    setCheckIn(date);
    setCheckOut(date.add(1, "day"));
  };

  if (!open || !anchorEl) return null;

  const endTime = checkIn && time
    ? checkIn
      .hour(parseInt(time?.split(":")[0]))
      .minute(0)
      .add(duration, "hour")
    : null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement='bottom-start'
      modifiers={[
        {
          name: 'flip',
          enabled: false,
        },
      ]}
      sx={{ zIndex: 50 }}>
      <Paper
        elevation={8}
        sx={{
          mt: 1,
          borderRadius: "24px",
          overflow: "hidden",
          width: {
            xs: 340,
            sm:
              bookingType === "hourly"
                ? 760
                : bookingType === "daily"
                  ? 680
                  : 380,
          },
          bgcolor: "white",
        }}>
        <LocalizationProvider adapterLocale={locale} dateAdapter={AdapterDayjs}>
          <Stack>
            {/* Header - Hiển thị tháng và năm */}
            <Box p={2} bgcolor='#f9f9f9' borderBottom='1px solid #eee'>
              {/* <Typography suppressHydrationWarning fontWeight={600} color='#333'>
                {checkIn ? checkIn.format("MMMM YYYY") : dayjs().format("MMMM YYYY")}
              </Typography> */}
            </Box>

            {bookingType === "hourly" ? (
              /* === THEO GIỜ === */
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0}>
                {/* Calendar */}
                <Box sx={{ flex: 1, p: 1 }}>
                  <DateCalendar
                    value={checkIn}
                    onChange={() => { }}
                    disablePast
                    sx={{
                      width: "100%",
                      "& .MuiPickersDay-root": {
                        borderRadius: "50%",
                        "&.Mui-selected": {
                          bgcolor: "rgba(152, 183, 32, 1) !important",
                          color: "white",
                        },
                      },
                    }}
                    dayOfWeekFormatter={(date) => {
                      const shortDay = date.format('dd');
                      return shortDay;
                    }}
                    slots={{
                      day: (props) => {
                        const { disableHighlightToday, ...validProps } = props; 
                        const isSelected = checkIn?.isSame(props.day, "day");
                        return (
                          <Button
                            {...validProps}
                            onClick={() => {
                              setCheckIn(props.day);
                            }}
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: isSelected
                                ? "rgba(152, 183, 32, 1)"
                                : "transparent",
                              color: isSelected ? "white" : "inherit",
                            }}>
                            {props.day.format("D")}
                          </Button>
                        );
                      },
                    }}
                  />
                </Box>

                {/* Giờ + Số giờ + Trả phòng */}
                <Box sx={{ flex: 1, p: 2, bgcolor: "#fafafa" }}>
                  {/* Giờ nhận */}
                  <Box mb={2}>
                    <Typography suppressHydrationWarning 
                      fontWeight={500}
                      mb={1}
                      color='#666'
                      fontSize='0.95rem'>
                      {t('check_in_time')}
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <IconButton
                        size='small'
                        onClick={() =>
                          setTime(hours[Math.max(0, hourIndex - 1)])
                        }
                        disabled={hourIndex <= 0}>
                        <ChevronLeft />
                      </IconButton>
                      <Stack
                        direction='row'
                        spacing={1}
                        flex={1}
                        justifyContent='center'>
                        {hours
                          .slice(
                            Math.max(0, hourIndex - 1),
                            Math.min(hours.length, hourIndex + 3)
                          )
                          .map((h) => (
                            <Button
                              key={h}
                              disabled={disabledHours.includes(h)}
                              variant={time === h ? "contained" : "text"}
                              size='small'
                              onClick={() => setTime(h)}
                              sx={{
                                minWidth: 60,
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                bgcolor:
                                  time === h
                                    ? "rgba(152, 183, 32, 1)"
                                    : "#f5f5f5",
                                color: time === h ? "white" : "#666",
                                "&:hover": {
                                  bgcolor:
                                    time === h
                                      ? "rgba(152, 183, 32, 0.8)"
                                      : "#e0e0e0",
                                },
                              }}>
                              {h}
                            </Button>
                          ))}
                      </Stack>
                      <IconButton
                        size='small'
                        onClick={() =>
                          setTime(
                            hours[Math.min(hours.length - 1, hourIndex + 1)]
                          )
                        }
                        disabled={hourIndex >= hours.length - 1}>
                        <ChevronRight />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Số giờ */}
                  <Box mb={2}>
                    <Typography suppressHydrationWarning 
                      fontWeight={500}
                      mb={1}
                      color='#666'
                      fontSize='0.95rem'>
                      {t('hours_of_use')}
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <IconButton
                        size='small'
                        onClick={() =>
                          setDuration(durations[Math.max(0, durationIndex - 1)])
                        }
                        disabled={durationIndex <= 0}>
                        <ChevronLeft />
                      </IconButton>
                      <Stack
                        direction='row'
                        spacing={1}
                        flex={1}
                        justifyContent='center'>
                        {durations
                          .slice(
                            Math.max(0, durationIndex - 1),
                            Math.min(durations.length, durationIndex + 3)
                          )
                          .map((d) => (
                            <Button
                              key={d}
                              variant={duration === d ? "contained" : "text"}
                              size='small'
                              onClick={() => setDuration(d)}
                              sx={{
                                minWidth: 60,
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                bgcolor:
                                  duration === d
                                    ? "rgba(152, 183, 32, 1)"
                                    : "#f5f5f5",
                                color: duration === d ? "white" : "#666",
                                "&:hover": {
                                  bgcolor:
                                    duration === d
                                      ? "rgba(152, 183, 32, 0.8)"
                                      : "#e0e0e0",
                                },
                              }}>
                              {d} {t("hour")}
                            </Button>
                          ))}
                      </Stack>
                      <IconButton
                        size='small'
                        onClick={() =>
                          setDuration(
                            durations[
                            Math.min(durations.length - 1, durationIndex + 1)
                            ]
                          )
                        }
                        disabled={durationIndex >= durations.length - 1}>
                        <ChevronRight />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Trả phòng */}
                  <Box
                    p={2}
                    bgcolor='white'
                    borderRadius='12px'
                    border='1px solid #eee'>
                    <Typography suppressHydrationWarning 
                      fontWeight={500}
                      color='#666'
                      fontSize='0.9rem'
                      mb={0.5}>
                      {t('check_out_time')}
                    </Typography>
                    <Typography suppressHydrationWarning fontWeight={600} color='#333'>
                      {endTime
                        ? `${endTime.format("HH:mm, DD/MM/YYYY")}`
                        : "Chưa chọn"}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : bookingType === "daily" ? (
              /* === THEO NGÀY (Airbnb Style với 2 calendar) === */
              <Stack direction="row" spacing={0}>
                {/* Calendar bên trái - Tháng hiện tại */}
                <Box sx={{ flex: 1, p: 1, borderRight: "1px solid #eee" }}>
                  <DateCalendar
                    value={checkIn || dayjs()}
                    onChange={() => {}}
                    disablePast
                    reduceAnimations
                    sx={{
                      width: "100%",
                      "& .MuiPickersDay-root": {
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "rgba(152, 183, 32, 1) !important",
                          color: "white",
                        },
                        "&.MuiPickersDay-today": {
                          border: "1px solid rgba(152, 183, 32, 0.5)",
                        },
                      },
                    }}
                    dayOfWeekFormatter={(date) => date.format("dd")}
                    slots={{
                      day: (props) => {
                        const { day } = props;
                        const isStart = checkIn?.isSame(day, "day");
                        const isEnd = checkOut?.isSame(day, "day");
                        const isInRange =
                          checkIn &&
                          checkOut &&
                          day.isAfter(checkIn, "day") &&
                          day.isBefore(checkOut, "day");

                        const isDisabled = day.isBefore(now, "day");

                        return (
                          <Button
                            {...props}
                            disabled={isDisabled || props.disabled}
                            onClick={() => handleDateSelectDaily(day)}
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: "60px",
                              bgcolor: isStart || isEnd
                                ? "rgba(152, 183, 32, 1)"
                                : isInRange
                                  ? "rgba(152, 183, 32, 0.15)"
                                  : "transparent",
                              color: isStart || isEnd ? "white" : "inherit",
                              fontWeight: isStart || isEnd ? 600 : 400,
                              position: "relative",
                              "&:hover": {
                                bgcolor: isStart || isEnd
                                  ? "rgba(152, 183, 32, 0.9)"
                                  : "rgba(152, 183, 32, 0.1)",
                              },
                              // Hiệu ứng range (Airbnb style)
                              ...(isInRange && {
                                borderRadius: 0,
                              }),
                              ...(isStart && checkOut && {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              }),
                              ...(isEnd && checkIn && {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                              }),
                            }}
                          >
                            {day.format("D")}
                          </Button>
                        );
                      },
                    }}
                  />
                </Box>
          
                {/* Calendar bên phải - Tháng kế tiếp */}
                <Box sx={{ flex: 1, p: 1 }}>
                  <DateCalendar
                    value={checkIn ? checkIn.add(1, "month") : dayjs().add(1, "month")}
                    referenceDate={checkIn ? checkIn.add(1, "month") : dayjs().add(1, "month")}
                    onChange={() => {}}
                    disablePast
                    reduceAnimations
                    sx={{
                      width: "100%",
                      "& .MuiPickersDay-root": {
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "rgba(152, 183, 32, 1) !important",
                          color: "white",
                        },
                      },
                    }}
                    dayOfWeekFormatter={(date) => date.format("dd")}
                    slots={{
                      day: (props) => {
                        const { day } = props;
                        const isStart = checkIn?.isSame(day, "day");
                        const isEnd = checkOut?.isSame(day, "day");
                        const isInRange =
                          checkIn &&
                          checkOut &&
                          day.isAfter(checkIn, "day") &&
                          day.isBefore(checkOut, "day");

                        const isDisabled = day.isBefore(now, "day");

                        return (
                          <Button
                            {...props}
                            disabled={isDisabled || props.disabled}
                            onClick={() => handleDateSelectDaily(day)}
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: "60px",
                              bgcolor: isStart || isEnd
                                ? "rgba(152, 183, 32, 1)"
                                : isInRange
                                  ? "rgba(152, 183, 32, 0.15)"
                                  : "transparent",
                              color: isStart || isEnd ? "white" : "inherit",
                              fontWeight: isStart || isEnd ? 600 : 400,
                              position: "relative",
                              "&:hover": {
                                bgcolor: isStart || isEnd
                                  ? "rgba(152, 183, 32, 0.9)"
                                  : "rgba(152, 183, 32, 0.1)",
                              },
                              // Hiệu ứng range (Airbnb style)
                              ...(isInRange && {
                                borderRadius: 0,
                              }),
                              ...(isStart && checkOut && {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              }),
                              ...(isEnd && checkIn && {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                              }),
                            }}
                          >
                            {day.format("D")}
                          </Button>
                        );
                      },
                    }}
                  />
                </Box>
              </Stack>
            ) : (
              /* === QUA ĐÊM (1 calendar như logic cũ) === */
              <Box sx={{ p: 1 }}>
                <DateCalendar
                  value={checkIn}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleDateSelectOvernight(newValue);
                    }
                  }}
                  disablePast
                  sx={{
                    width: "100%",
                    "& .MuiPickersDay-root": {
                      borderRadius: "50%",
                      "&.Mui-selected": {
                        bgcolor: "rgba(152, 183, 32, 1) !important",
                        color: "white",
                      },
                    },
                  }}
                  dayOfWeekFormatter={(date) => date.format("dd")}
                  slots={{
                    day: (props) => {
                      const { day } = props;
                      const isSelected = checkIn?.isSame(day, "day");
                      return (
                        <Button
                          {...props}
                          onClick={() => handleDateSelectOvernight(day)}
                          sx={{
                            minWidth: 36,
                            height: 36,
                            borderRadius: "50%",
                            bgcolor: isSelected
                              ? "rgba(152, 183, 32, 1)"
                              : "transparent",
                            color: isSelected ? "white" : "inherit",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {day.format("D")}
                        </Button>
                      );
                    },
                  }}
                />
              </Box>
            )}

            {/* Footer */}
            <Stack
              direction='row'
              justifyContent='space-between'
              p={2}
              bgcolor='#f9f9f9'
              borderTop='1px solid #eee'>
              <Button
                variant='outlined'
                onClick={handleReset}
                sx={{
                  borderRadius: "50px",
                  color: "#666",
                  borderColor: "#ddd",
                  textTransform: "none",
                  fontSize: "0.9rem",
                }}>
                {bookingType === "hourly" ? t('any_date_time') : t('any_date')}
              </Button>
              <Button
                variant='contained'
                onClick={handleApply}
                disabled={bookingType === "daily" && (!checkIn || !checkOut)}
                sx={{
                  bgcolor: "rgba(152, 183, 32, 1)",
                  color: "white",
                  borderRadius: "50px",
                  px: 4,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  "&:hover": { bgcolor: "#43a047" },
                  "&.Mui-disabled": {
                    bgcolor: "#e0e0e0",
                    color: "#999",
                  },
                }}>
                {t('apply')}
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>
    </Popper>
  );
};

// === MAIN COMPONENT ===
const SearchBarWithDropdown = ({ location, address }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useRouter();
  const [bookingType, setBookingType] = useState<
    "hourly" | "overnight" | "daily"
  >("hourly");
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkInDuration, setCheckInDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false); // Chỉ 1 popup
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const selectingRef = useRef(false);
  const  t  = useTranslations();
  const locale = useLocale();
  const geoResolveRef = useRef(null);
  const normalize = (str = "") =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const keyword = normalize(searchValue?.trim());

  const filteredLocations = !keyword
  ? location
  : location.filter((loc) => {
      const words = normalize(loc?.name?.vi).split(/\s+/);

      return words.some(word =>
        word.includes(keyword) // ho -> hồ, nội (no), hà (ha)
      );
    });
  console.log("AAAA address", address);


  useEffect(() => {
    // nếu chưa nhập gì thì không call
    if (!searchValue.trim()) return;

    const timer = setTimeout(async () => {
      setDataLoading(true)
      console.log("CALL API:", searchValue);
      let result = await getSuggest(searchValue)
      if (result?.hotels) {
        setData(result?.hotels)
      }
      setDataLoading(false)

    }, 500);

    // nếu người dùng nhập tiếp -> huỷ timeout cũ
    return () => clearTimeout(timer);
  }, [searchValue]);
  useEffect(() => {
    if (address) {
      const name = location.find((item) => item.id == address.id)?.name.vi;
      setSearchValue(name || "");
      setSelectedLocation(name || "");
    }
  }, [address]);
  const handleLocationClick = (loc: string) => {
    setSearchValue(loc);
    setSelectedLocation(loc);
    setDropdownOpen(false);

    // reset lại cờ
    setTimeout(() => {
      selectingRef.current = false;
    }, 0);
  };

  useEffect(() => {
    if (!checkIn) return;

    if (bookingType === "overnight") {
      // Qua đêm: luôn trả phòng = nhận phòng + 1 ngày
      setCheckOut(checkIn.add(1, "day"));
      setCheckInTime(null);
      setCheckInDuration(null);
    }
    else if (bookingType === "daily") {
      // Theo ngày: nếu chưa có checkOut cũ mà nó <= checkIn → đẩy lên +1 ngày (tối thiểu 1 đêm)
      if (!checkOut || checkOut.isSame(checkIn, "day") || checkOut.isBefore(checkIn)) {
        setCheckOut(checkIn.add(1, "day"));
      }
      setCheckInTime(null);
      setCheckInDuration(null);
    }
    else if (bookingType === "hourly") {
      // Theo giờ: xóa checkOut cũ (vì giờ dùng endTime tính từ giờ + duration)
      // Giữ lại checkIn để chọn ngày

      // Nếu là hôm nay → giờ mặc định là giờ hiện tại + 1
      const today = dayjs();
      if (checkIn.isSame(today, "day")) {
        const nextHour = today.hour() + 1;
        setCheckInTime(String(nextHour).padStart(2, "0") + ":00");
      } else {
        //   const now = dayjs();
        // const nextHour = now.add(1, "hour").startOf("hour"); // làm tròn lên giờ tiếp theo
        // const formatted = nextHour.format("HH:00");
        //   setCheckInTime(formatted); // hoặc "00:00" tuỳ bạn muốn
      }
      // setCheckInDuration(3); // mặc định 3 tiếng hoặc 2 tùy bạn
    }
  }, [bookingType, checkIn])

  const handleClickAway = (e: any) => {
    if (inputRef.current && !inputRef.current.contains(e.target))
      setDropdownOpen(false);
    if (checkInRef.current && !checkInRef.current.contains(e.target))
      setPickerOpen(false);
    if (checkOutRef.current && !checkOutRef.current.contains(e.target))
      setPickerOpen(false);
  };

  const formatCheckIn = () => {
    if (!checkIn) return t('check_in');
    if (bookingType === "hourly" && checkInTime)
      return `${checkInTime}, ${checkIn.format("DD/MM")}`;
    return checkIn.format(bookingType === "daily" ? "DD/MM/YYYY" : "DD/MM");
  };

  const formatCheckOut = () => {
    if (bookingType === "hourly") {
      if (!checkOut) return t('check_out');

      return checkOut.format("HH:mm, DD/MM");
    }

    if (!checkOut) return t('check_out');
    return checkOut.format("DD/MM/YYYY");
  };
  // Hàm convert "Hà Nội" -> "hanoi"
  function toCityKey(text) {
    if (!text) return "";
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  // Get location + reverse geocode -> return cityKey
  const getLocation = async () => {
    if (!("geolocation" in navigator)) return null;

    setLoading(true);

    return new Promise((resolve) => {
      geoResolveRef.current = resolve; // <-- LƯU LẠI ĐỂ CLOSE MODAL GỌI ĐƯỢC

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            const res = await fetch(url, {
              headers: { "Accept-Language": "vi" },
            });

            if (!res.ok) {
              setLoading(false);
              geoResolveRef.current?.(null);
              return;
            }

            const data = await res.json();
            const addr = data.address || {};

            const detectedCity =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              addr.state ||
              null;

            setLoading(false);
            geoResolveRef.current?.(toCityKey(detectedCity));
          } catch (e) {
            console.log("Reverse error:", e);
            setLoading(false);
            geoResolveRef.current?.(null);
          }
        },

        (err) => {
          console.log("Geo error:", err);
          setLoading(false);
          geoResolveRef.current?.(null);
        },

        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 60000,
        }
      );
    });
  };

  const cancelGeo = () => {
    setLoading(false);
    geoResolveRef.current?.(null); // <-- Gửi null như “bị chặn”
  };

  // -------------------------------------
  // HANDLE SEARCH
  // -------------------------------------
  const handleSearch = async () => {
    console.log("AAA AsearchValue", searchValue);

    let city = null;

    // Nếu không searchValue thì mới lấy vị trí
    if (!searchValue) {
      city = await getLocation(); // <--- giờ sẽ đồng bộ + loading chuẩn
    }

    // Lấy ID location từ searchValue nếu có
    const locationId = searchValue
      ? location.find((item) => item.name.vi === searchValue)?.id
      : city;

    const searchParams = {
      location: locationId || localStorage.getItem("location"),
      type: bookingType,
      checkIn: checkIn ? checkIn.format("YYYY-MM-DD") : "",
      checkOut: checkOut ? checkOut.format("YYYY-MM-DD") : "",
      checkInTime: checkInTime || "",
      duration: checkInDuration || "",
    };

    console.log("AAAA searchParams", searchParams);

    localStorage.setItem("booking", JSON.stringify(searchParams));

    const queryString = new URLSearchParams(searchParams).toString();

    navigate.push(`/rooms?${queryString}`);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          position='absolute'
          width='100%'
          display='flex'
          justifyContent='center'
          bottom='-80px'
          zIndex={10}>
          <Container maxWidth='lg'>
            {/* Toggle */}
            <Stack direction='row' justifyContent='center' sx={{ mb: isMobile ? "-10px" : "-40px" }}>
              <ToggleButtonGroup
                value={bookingType}
                exclusive
                onChange={(_, v) => v && setBookingType(v)}
                sx={{
                  bgcolor: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "32px",
                  p: isMobile ? "10px" : "16px 24px",
                  gap: "20px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: isMobile ? "80%" : "unset"
                }}>
                {[
                  { v: "hourly", i: <AccessTime sx={{ fontSize: isMobile ? "15px" : "1.5rem" }} />, l: t('by_hour') },
                  { v: "overnight", i: <Nightlight sx={{ fontSize: isMobile ? "15px" : "1.5rem" }} />, l: t('overnight') },
                  { v: "daily", i: <CalendarToday sx={{ fontSize: isMobile ? "15px" : "1.5rem" }} />, l: t('by_day') },
                ].map((x) => (
                  <ToggleButton
                    key={x.v}
                    value={x.v}
                    sx={{
                      px: { xs: 1, md: 4 },
                      py: isMobile ? .5 : 1,
                      color:
                        bookingType === x.v
                          ? "rgba(152, 183, 32, 1) !important"
                          : "white",
                      bgcolor:
                        bookingType === x.v
                          ? "white !important"
                          : "transparent",
                      fontWeight: 600,
                      borderRadius: "50px !important",
                      border: "none",
                      "&:hover": {
                        bgcolor:
                          bookingType === x.v
                            ? "white"
                            : "rgba(255,255,255,0.1)",
                      },
                      fontSize: isMobile ? "10px" : "unset"
                    }}>
                    {x.i}
                    <Box component='span' suppressHydrationWarning sx={{ ml: 1, textTransform: "none" }}>
                      {x.l}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>

            {/* Main Bar */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                bgcolor: "white",
                p: { xs: 1.5, md: "70px 20px 20px" },
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",

              }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 1.5, md: 1 }}
                sx={{
                  borderRadius: "50px",
                  border: isMobile ? "unset" : "1px solid #eee",
                  p: 1,
                }}
                alignItems='stretch'>
                {/* Địa điểm */}
                <Box sx={{ flex: { md: 1 }, position: "relative" }}>
                  <TextField
                    fullWidth
                    placeholder={t('where_do_you_want_to_go')}
                    suppressHydrationWarning
                    variant='outlined'
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      // Luôn mở dropdown khi đang gõ
                      setDropdownOpen(true);
                    }}
                    // THAY ĐỔI CHÍNH Ở ĐÂY
                    onFocus={() => {
                      // Khi focus vào ô tìm kiếm:
                      // 1. Xóa nội dung cũ để người dùng gõ lại
                      setSearchValue("");
                      // 2. Mở dropdown để hiện hết danh sách
                      setDropdownOpen(true);
                    }}
                    onClick={() => {
                      // Đảm bảo click cũng kích hoạt (tránh trường hợp focus không chạy trên mobile)
                      setSearchValue("");
                      setDropdownOpen(true);
                    }}
                    onBlur={() => {
                      // Nếu đang click item → bỏ qua blur
                      if (selectingRef.current) return;

                      const isValid = location.some(
                        (loc) => loc.name.vi === searchValue
                      );

                      if (!isValid) {
                        // Trả lại giá trị đã chọn trước đó
                        setSearchValue(selectedLocation || "");
                      }

                      setDropdownOpen(false);
                    }}
                    inputRef={inputRef}
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ fontSize: 20, color: "#999", mr: 1 }} />
                      ),
                      inputProps: {
                        suppressHydrationWarning: true,  // ← Thêm vào inputProps để áp dụng cho <input>
                      },
                    }}
                    sx={{

                      "& .MuiOutlinedInput-root": {
                        height: { xs: 48, md: 45 },
                        fontSize: isMobile ? "12px" : "unset",
                        borderRadius: isMobile ? "10px" : "50px 10px 10px 50px",
                        "& fieldset": {
                          border: dropdownOpen
                            ? "1px solid rgba(152, 183, 32, 1) !important"
                            : isMobile ? "1px solid rgba(152, 183, 32, 1) !important" : "none !important",
                        },
                        "&.Mui-focused": {
                          borderColor: "rgba(152, 183, 32, 1)",
                          boxShadow: "0 0 0 2px rgba(152, 183, 32, 0.2)",
                        },
                      },
                    }}
                  />
                  <Popper
                   modifiers={[
                    {
                      name: 'flip',
                      enabled: false,
                    },
                  ]}
                    open={dropdownOpen}
                    anchorEl={inputRef.current}
                    placement='bottom-start'
                    sx={{ zIndex: 20, width: isMobile ? "max-content" : "20%" }}>
                    {filteredLocations.length == 0 && data?.length == 0 ? (
                      <Paper
                        elevation={3}
                        className='hidden-add-voice'
                        sx={{
                          mt: 1,
                          borderRadius: "16px",
                          overflow: "hidden",
                          maxHeight: 300,
                          overflowY: "auto",
                        }}>
                        <Typography suppressHydrationWarning  color='rgba(152, 159, 173, 1)'>
                          {t('no_data_found')}
                        </Typography>
                      </Paper>
                    ) : (
                      <Paper
                        elevation={3}
                        className='hidden-add-voice'
                        sx={{
                          mt: 1,
                          borderRadius: "16px",
                          overflow: "hidden",
                          maxHeight: 300,
                          overflowY: "auto",
                        }}>
                        <Box p={2} bgcolor='#f9f9f9'>
                          <Typography suppressHydrationWarning 
                            variant='subtitle2'
                            color='#666'
                            fontWeight={600}>
                            {t('address')}
                          </Typography>
                        </Box>
                        <List disablePadding>
                          {filteredLocations.map((loc, i) => (
                            <ListItemButton
                              key={i}
                              onMouseDown={() => {
                                selectingRef.current = true; // 🔥 chặn blur
                              }}
                              onClick={() => handleLocationClick(loc.name.vi)}
                              sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom:
                                  i < filteredLocations.length - 1
                                    ? "1px solid #eee"
                                    : "none",
                                "&:hover": { bgcolor: "#f0f8f0" },
                              }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <LocationOn
                                  sx={{ fontSize: 18, color: "#999" }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={loc.name.vi}
                                primaryTypographyProps={{
                                  fontSize: "0.95rem",
                                  color: "#333",
                                  fontWeight: 500,
                                }}
                              />
                            </ListItemButton>
                          ))}
                        </List>
                        <Box p={2} bgcolor='#f9f9f9'>
                          <Typography suppressHydrationWarning 
                            variant='subtitle2'
                            color='#666'
                            fontWeight={600}>
                            {t('hotels')}
                          </Typography>
                        </Box>
                        {dataLoading ?
                          <Box display={"flex"} justifyContent={"center"}>
                            <CircularProgress sx={{ fontSize: "15px", color: "rgba(152, 183, 32, 1)" }} />
                          </Box>
                          :
                          <List disablePadding>
                            {data.map((loc, i) => (
                              <ListItemButton
                                key={i}
                                onMouseDown={() => {
                                  selectingRef.current = true; // 🔥 chặn blur
                                }}
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
                                  navigate.push(
                                    `/room/${loc.id}?${new URLSearchParams(
                                      current
                                    ).toString()}&name=${parseName(loc.name,locale)}`
                                  );
                                }}
                                sx={{
                                  px: 2,
                                  py: 1.5,
                                  borderBottom:
                                    i < data.length - 1
                                      ? "1px solid #eee"
                                      : "none",
                                  "&:hover": { bgcolor: "#f0f8f0" },
                                }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Image src={building} alt="" />
                                </ListItemIcon>
                                <Box>

                                  <ListItemText
                                    primary={parseName(loc?.name,locale)}
                                    primaryTypographyProps={{
                                      fontSize: "0.95rem",
                                      color: "#333",
                                      fontWeight: 500,
                                    }}
                                  />
                                  <ListItemText
                                    primary={parseName(loc?.address,locale)}
                                    primaryTypographyProps={{
                                      fontSize: "0.95rem",
                                      color: "#333",
                                      fontWeight: 500,
                                    }}
                                  />
                                </Box>
                              </ListItemButton>
                            ))}
                          </List>}
                      </Paper>
                    )}
                  </Popper>
                </Box>

                {!isMobile && (
                  <Box
                    sx={{ width: "1px", bgcolor: "#eee", alignSelf: "stretch" }}
                  />
                )}

                {/* Nhận phòng */}

                <Box sx={{ flex: { md: 2 }, display: "flex" }}>
                  <Box
                    ref={checkInRef}
                    sx={{
                      flex: { xs: 1, md: 1 },
                      cursor: "pointer",
                      border: pickerOpen
                        ? "1px solid rgba(152, 183, 32, 1)"
                        : isMobile ? "1px solid rgba(152, 183, 32, 1)" : "1px solid transparent",
                      borderRight: "none",
                      borderRadius: "10px 0 0 10px",
                    }}
                    onClick={() => setPickerOpen(true)}>
                    <Box
                      sx={{
                        height: { xs: 48, md: 45 },
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                      }}>
                      <Image
                        src={in_time}
                        width={isMobile ? 15 : 20}
                        height={isMobile ? 15 : 20}
                        style={{ marginRight: "5px" }}
                        alt=''
                      />
                      <Typography suppressHydrationWarning 
                        sx={{
                          flex: 1,
                          color: checkIn ? "#333" : "#999",
                          fontWeight: checkIn ? 500 : 400,
                          fontSize: isMobile ? "12px" : "unset"
                        }}>
                        {formatCheckIn()}
                      </Typography>
                      <KeyboardArrowDown
                        sx={{
                          fontSize: 18,
                          color: "#999",
                          transform: pickerOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "0.2s",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Trả phòng */}
                  <Box
                    ref={checkOutRef}
                    sx={{
                      flex: { xs: 1, md: 1 },
                      cursor: "pointer",
                      border: pickerOpen
                        ? "1px solid rgba(152, 183, 32, 1)"
                        : isMobile ? "1px solid rgba(152, 183, 32, 1)" : "1px solid transparent",
                      borderLeft: "none",
                      borderRadius: "0 10px 10px 0",
                    }}
                    onClick={() => setPickerOpen(true)}>
                    <Box
                      sx={{
                        height: { xs: 48, md: 45 },
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                      }}>
                      <Image
                        src={out_time}
                        width={isMobile ? 15 : 20}
                        height={isMobile ? 15 : 20}
                        style={{ marginRight: "5px" }}
                        alt=''
                      />
                      <Typography suppressHydrationWarning 
                        sx={{
                          flex: 1,
                          color: checkOut ? "#333" : "#999",
                          fontWeight: checkOut ? 500 : 400,
                          fontSize: isMobile ? "12px" : "unset"
                        }}>
                        {formatCheckOut()}
                      </Typography>
                      <KeyboardArrowDown
                        sx={{
                          fontSize: 18,
                          color: "#999",
                          transform: pickerOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "0.2s",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Popup duy nhất */}
                <DateRangePicker
                  open={pickerOpen}
                  anchorEl={checkInRef.current || checkOutRef.current}
                  onClose={() => setPickerOpen(false)}
                  onApply={(ci, co, t, d) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                    if (t) setCheckInTime(t);
                    if (d) setCheckInDuration(d);
                  }}
                  bookingType={bookingType}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  initialTime={checkInTime}
                  initialDuration={checkInDuration}
                />

                {/* Tìm kiếm */}
                <Button
                  variant='contained'
                  onClick={handleSearch}
                  size='large'
                  startIcon={<Search sx={{ fontSize: 22 }} />}
                  suppressHydrationWarning
                  sx={{
                    bgcolor: "rgba(152, 183, 32, 1)",
                    color: "white",
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 1.8 },
                    borderRadius: "50px",
                    fontWeight: "bold",
                    textTransform: "none",
                    minWidth: { xs: "100%", md: "auto" },
                    height: { xs: 48, md: 45 },
                    "&:hover": { bgcolor: "#43a047" },
                  }}>
                  {t('search')}
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </ClickAwayListener>
      <Modal open={loading}>
        <Box
          className='hidden-add-voice'
          sx={{
            width: { xs: "95%", md: "400px" },

            position: "absolute",
            top: "50%",
            left: "50%",
            bgcolor: "white",
            borderRadius: "18px",
            transform: "translate(-50%, -50%)",
            p: { xs: 2, md: 3 },

            height: "max-content",
          }}>
          {/* HEADER */}
          <Stack direction='row' justifyContent='space-between' mb={2}>
            <Typography suppressHydrationWarning  fontSize='1.2rem' fontWeight={700}>
              {t('accessing_location')}
            </Typography>

            <IconButton onClick={() => cancelGeo()}>
              <Close />
            </IconButton>
          </Stack>
          <Image src={query} width={"100%"} alt='' />
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default SearchBarWithDropdown;
