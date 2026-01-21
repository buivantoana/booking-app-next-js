"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popper,
  ClickAwayListener,
  Container,
  Avatar,
  IconButton,
  Grid,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  LocationOn,
  AccessTime,
  Nightlight,
  CalendarToday,
  Search,
  KeyboardArrowDown,
  Check,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { toast } from "react-toastify";

import { getSuggest } from "../service/hotel";
import { mapLocale, parseName } from "../utils/utils";
import building from "../images/buildings.png";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/translation/navigation";
import { useRouter, useSearchParams } from "next/navigation";
// === DROPDOWN CHỌN LOẠI (giống ảnh) ===
const BookingTypeDropdown: React.FC<{
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
}> = ({ open, anchorEl, onClose, value, onChange }) => {
  const options = [
    { value: "hourly", label: "Theo giờ", icon: <AccessTime /> },
    { value: "overnight", label: "Qua đêm", icon: <Nightlight /> },
    { value: "daily", label: "Qua ngày", icon: <CalendarToday /> },
  ];

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement='bottom-start'
      sx={{ zIndex: 100 }}>
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={3}
          sx={{
            mt: 0.5,
            borderRadius: "12px",
            overflow: "hidden",
            width: 180,
            bgcolor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
          <List disablePadding>
            {options.map((opt) => (
              <ListItemButton
                key={opt.value}
                selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  onClose();
                }}
                sx={{
                  py: 1.2,
                  px: 2,
                  gap: 1.5,
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "#f9f9f9" },
                }}>
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: value === opt.value ? "#98b720" : "#888",
                  }}>
                  {opt.icon}
                </ListItemIcon>
                <ListItemText
                  primary={opt.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#333",
                  }}
                />
                {value === opt.value && (
                  <Check sx={{ fontSize: 16, color: "#98b720", ml: "auto" }} />
                )}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

// === DATE PICKER POPUP ===
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
  const [checkIn, setCheckIn] = useState<Dayjs | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(initialCheckOut);
  const [time, setTime] = useState<string>(initialTime);
  const [duration, setDuration] = useState<number>(initialDuration || 2);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const t = useTranslations();
  const locale = useLocale();
  const now = dayjs();
  const hours = Array.from(
    { length: 24 },
    (_, i) => String(i).padStart(2, "0") + ":00"
  );
  const durations = [2, 3, 4, 5, 6, 8, 10, 12];

  const hourIndex = hours.indexOf(time);
  const durationIndex = durations.indexOf(duration);

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

  const handleReset = () => {
    setCheckIn(dayjs());
    setCheckOut(null);
    const now = dayjs();
    const nextHour = now.add(1, "hour").startOf("hour"); // làm tròn lên giờ tiếp theo
    const formatted = nextHour.format("HH:00");

    setTime(formatted);
    setDuration(2);
  };

  const isToday = checkIn && checkIn.isSame(now, "day");

  const disabledHours = isToday
    ? hours.filter((h) => {
        const hourNum = parseInt(h.split(":")[0]);
        return hourNum <= now.hour(); // disable những giờ đã qua
      })
    : [];
  const handleDateSelect = (date: Dayjs, isSecondCalendar: boolean = false) => {
    if (bookingType === "overnight") {
      setCheckIn(date);
      setCheckOut(date.add(1, "day"));
    } else if (bookingType === "daily") {
      // Logic mới: Phân biệt theo calendar
      if (isSecondCalendar) {
        // Click ở calendar bên phải (tháng sau) → ưu tiên đặt checkOut
        if (!checkIn) {
          // Nếu chưa có checkIn → đặt checkIn trước
          setCheckIn(date);
          setCheckOut(null);
        } else if (date.isAfter(checkIn)) {
          // Đã có checkIn và ngày click sau checkIn → đặt checkOut
          setCheckOut(date);
        } else {
          // Ngày click trước checkIn → reset checkIn thành ngày mới
          setCheckIn(date);
          setCheckOut(null);
        }
      } else {
        // Click ở calendar bên trái (tháng hiện tại) → ưu tiên đặt checkIn
        if (!checkIn || (checkOut && date.isBefore(checkIn))) {
          setCheckIn(date);
          setCheckOut(null);
        } else if (!checkOut && date.isAfter(checkIn)) {
          setCheckOut(date);
        } else {
          setCheckIn(date);
          setCheckOut(null);
        }
      }
    } else if (bookingType === "hourly") {
      setCheckIn(date);

      const selectedIsToday = date.isSame(now, "day");

      if (selectedIsToday) {
        const nextHour = now.hour() + 1;
        const nextHourStr = hours[nextHour] || hours[hours.length - 1];
        setTime(nextHourStr);
      } else {
        setTime("00:00");
      }

      setDuration(2);
    }
  };

  if (!open || !anchorEl) return null;

  const endTime = checkIn
    ? checkIn
        .hour(parseInt(time.split(":")[0]))
        .minute(0)
        .add(duration, "hour")
    : null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement='bottom-start'
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
            {/* Header */}
            <Box p={2} bgcolor='#f9f9f9' borderBottom='1px solid #eee'>
              {/* <Typography suppressHydrationWarning  fontWeight={600} color='#333'>
              {dayjs()
        .locale(i18n.language)
        .format("MMMM YYYY")}
              </Typography> */}
            </Box>

            {bookingType === "hourly" ? (
              /* === THEO GIỜ === */
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0}>
                {/* Calendar */}
                <Box sx={{ flex: 1, p: 1 }}>
                  <DateCalendar
                    value={checkIn}
                    onChange={() => {}}
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
                    slots={{
                      day: (props) => {
                        const isSelected = checkIn?.isSame(props.day, "day");
                        return (
                          <Button
                            {...props}
                            onClick={() => handleDateSelect(props.day)}
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: isSelected
                                ? "rgba(152, 183, 32, 1)"
                                : "transparent",
                              color: isSelected ? "white" : "inherit",
                              "&:hover": { bgcolor: "#f0f8f0" },
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
                    <Typography
                      suppressHydrationWarning
                      fontWeight={500}
                      mb={1}
                      color='#666'
                      fontSize='0.95rem'>
                      {t("search_bar_checkin_time_label")}
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
                              onClick={() => {
                                const hourNum = parseInt(h.split(":")[0]);

                                if (isToday) {
                                  if (hourNum <= now.hour()) {
                                    const next =
                                      hours[now.hour() + 1] ||
                                      hours[hours.length - 1];
                                    setTime(next);
                                  } else {
                                    setTime(h);
                                  }
                                } else {
                                  setTime(h);
                                }
                              }}
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
                    <Typography
                      suppressHydrationWarning
                      fontWeight={500}
                      mb={1}
                      color='#666'
                      fontSize='0.95rem'>
                      {t("search_bar_duration_label")}
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
                              {d} {t("search_bar_hour_suffix")}
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
                    <Typography
                      suppressHydrationWarning
                      fontWeight={500}
                      color='#666'
                      fontSize='0.9rem'
                      mb={0.5}>
                      {t("search_bar_checkout_label")}
                    </Typography>
                    <Typography
                      suppressHydrationWarning
                      fontWeight={600}
                      color='#333'>
                      {endTime
                        ? `${endTime.format("HH:mm, DD/MM/YYYY")}`
                        : t("search_bar_not_selected")}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : (
              /* === QUA ĐÊM / THEO NGÀY === */
              <Stack
                direction='row'
                flexDirection={isMobile ? "column" : "row"}
                spacing={0}>
                {/* Tháng 1 */}
                <Box sx={{ flex: 1, p: 1, borderRight: "1px solid #eee" }}>
                  <DateCalendar
                    value={checkIn}
                    onChange={() => {}}
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
                    slots={{
                      day: (props) => {
                        const isStart = checkIn?.isSame(props.day, "day");
                        const isEnd = checkOut?.isSame(props.day, "day");
                        const isInRange =
                          checkIn &&
                          checkOut &&
                          props.day.isAfter(checkIn) &&
                          props.day.isBefore(checkOut);

                        return (
                          <Button
                            {...props}
                            onClick={() => handleDateSelect(props.day)}
                            sx={{
                              minWidth: 36,
                              height: 36,
                              borderRadius: isStart || isEnd ? "50%" : "50%",
                              bgcolor:
                                isStart || isEnd
                                  ? "rgba(152, 183, 32, 1)"
                                  : isInRange
                                  ? "#f0f8f0"
                                  : "transparent",
                              color: isStart || isEnd ? "white" : "inherit",
                              "&:hover": { bgcolor: "#e8f5e8" },
                            }}>
                            {props.day.format("D")}
                          </Button>
                        );
                      },
                    }}
                  />
                </Box>

                {/* Tháng 2 - Chỉ khi "Theo ngày" */}
                {bookingType === "daily" && (
                  <Box sx={{ flex: 1, p: 1 }}>
                    <DateCalendar
                      referenceDate={dayjs().add(1, "month")}
                      // value={checkIn}
                      onChange={() => {}}
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
                      slots={{
                        day: (props) => {
                          const isStart = checkIn?.isSame(props.day, "day");
                          const isEnd = checkOut?.isSame(props.day, "day");
                          const isInRange =
                            checkIn &&
                            checkOut &&
                            props.day.isAfter(checkIn) &&
                            props.day.isBefore(checkOut);

                          return (
                            <Button
                              {...props}
                              onClick={() => handleDateSelect(props.day, true)}
                              sx={{
                                minWidth: 36,
                                height: 36,
                                borderRadius: isStart || isEnd ? "50%" : "50%",
                                bgcolor:
                                  isStart || isEnd
                                    ? "rgba(152, 183, 32, 1)"
                                    : isInRange
                                    ? "#f0f8f0"
                                    : "transparent",
                                color: isStart || isEnd ? "white" : "inherit",
                                "&:hover": { bgcolor: "#e8f5e8" },
                              }}>
                              {props.day.format("D")}
                            </Button>
                          );
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
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
                {bookingType === "hourly" ? t("any_date_time") : t("any_date")}
              </Button>
              <Button
                variant='contained'
                onClick={handleApply}
                sx={{
                  bgcolor: "rgba(152, 183, 32, 1)",
                  color: "white",
                  borderRadius: "50px",
                  px: 4,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  "&:hover": { bgcolor: "#43a047" },
                }}>
                {t("search_bar_apply_button")}
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Paper>
    </Popper>
  );
};
const getNextHour = () => {
  const now = new Date();
  let hour = now.getHours();
  const minute = now.getMinutes();

  // nếu phút > 0, tăng lên giờ tiếp theo
  if (minute > 0) hour += 1;

  // đảm bảo 2 chữ số
  const hh = hour.toString().padStart(2, "0");

  return `${hh}:00`;
};
// === MAIN COMPONENT ===
export default function SearchBarWithDropdown({ locationAddress }) {
  const [bookingType, setBookingType] = useState("hourly");
  const [searchValue, setSearchValue] = useState("");
  const [addressOld, setAddressOld] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [checkIn, setCheckIn] = useState<Dayjs | null>(dayjs());
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>(getNextHour());
  const [checkInDuration, setCheckInDuration] = useState<number>(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [name, setName] = useState<string>("");

  const addressOldRef = useRef("");
  const isMobile = useMediaQuery("(max-width:900px)"); // Thêm breakpoint cho mobile
  const selectingRef = useRef(false);
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();
  useEffect(() => {
    // nếu chưa nhập gì thì không call
    if (!searchValue.trim()) return;

    const timer = setTimeout(async () => {
      setDataLoading(true);
      console.log("CALL API:", searchValue);
      let result = await getSuggest(searchValue);
      if (result?.hotels) {
        setData(result?.hotels);
      }
      setDataLoading(false);
    }, 500);

    // nếu người dùng nhập tiếp -> huỷ timeout cũ
    return () => clearTimeout(timer);
  }, [searchValue]);
  useEffect(() => {
    // Giữ nguyên logic
    const locationParam = searchParams.get("location") || "";
    const typeParam = searchParams.get("type") || "hourly";
    const checkInTimeParam = searchParams.get("checkInTime");
    const durationParam = searchParams.get("duration") || 2;
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const name = searchParams.get("name");
    setName(name);

    setBookingType(typeParam);
    if (localStorage.getItem("location") && pathname == "/") {
      setSearchValue(
        name ||
          locationAddress?.find(
            (item) => item.id == localStorage.getItem("location")
          )?.name?.vi ||
          ""
      );
    } else {
      setSearchValue(
        name ||
          locationAddress?.find((item) => item.id == locationParam)?.name?.vi ||
          ""
      );
    }
    addressOldRef.current = locationAddress?.find(
      (item) => item.id == locationParam
    )?.name?.vi;
    setCheckInTime(checkInTimeParam);
    setCheckInDuration(Number(durationParam));

    setCheckIn(checkInParam ? dayjs(checkInParam) : null);
    setCheckOut(checkOutParam ? dayjs(checkOutParam) : null);
  }, [pathname, locationAddress]);

  useEffect(() => {
    if (!checkIn) return;

    if (bookingType === "overnight") {
      setCheckOut(checkIn.add(1, "day"));
      setCheckInTime(null);
      setCheckInDuration(null);
    } else if (bookingType === "daily") {
      if (
        !checkOut ||
        checkOut.isSame(checkIn, "day") ||
        checkOut.isBefore(checkIn)
      ) {
        setCheckOut(checkIn.add(1, "day"));
      }
      setCheckInTime(null);
      setCheckInDuration(null);
    } else if (bookingType === "hourly") {
      const today = dayjs();
      if (checkIn.isSame(today, "day")) {
        const nextHour = today.hour() + 1;
        setCheckInTime(String(nextHour).padStart(2, "0") + ":00");
      }
    }
  }, [bookingType, checkIn]);

  const updateParams = (newParams: Record<string, any>) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = {
      ...current,
      ...newParams,
    };
    if (pathname != "/") {
      navigate.replace(
        `${pathname}?${new URLSearchParams(updated).toString()}`,
        { scroll: false }
      );
    }
  };

  useEffect(() => {
    updateParams({ type: bookingType });
  }, [bookingType]);

  useEffect(() => {
    const locId = locationAddress.find(
      (i) => i.name.vi === selectedAddress
    )?.id;

    updateParams({ location: locId || "" });
  }, [selectedAddress]);
  useEffect(() => {
    updateParams({
      checkIn: checkIn ? checkIn.format("YYYY-MM-DD") : "",
      checkOut: checkOut ? checkOut.format("YYYY-MM-DD") : "",
      checkInTime,
      duration: checkInDuration || 2,
    });
  }, [checkIn, checkOut, checkInTime, checkInDuration]);

  const inputRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const navigate = useRouter();
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const normalize = (str = "") =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const keyword = normalize(searchValue?.trim());

  const filteredLocations = !keyword
    ? locationAddress
    : locationAddress.filter((loc) => {
        const words = normalize(loc?.name?.vi).split(/\s+/);

        return words.some(
          (word) => word.startsWith(keyword) // ho -> hồ, ha -> hà
        );
      });
  const formatDateDisplay = () => {
    if (!checkIn) return t("search_bar_select_date");

    if (bookingType === "hourly") {
      if (!checkInTime || !checkInDuration) {
        return `${checkIn.format("D/M")}`;
      }

      const startHour = parseInt(checkInTime.split(":")[0], 10);
      const endHour = (startHour + checkInDuration) % 24;

      return `${checkInTime} - ${endHour
        .toString()
        .padStart(2, "0")}:00, ${checkIn.format("D/M")}`;
    }

    const checkInStr = checkIn.format("D/M");
    if (!checkOut) return checkInStr;

    const checkOutStr = checkOut.format("D/M");

    return checkIn.isSame(checkOut, "month")
      ? `${checkInStr} - ${checkOut.format("D/M")}`
      : `${checkInStr} - ${checkOutStr}`;
  };

  const getTypeLabel = () => {
    if (bookingType === "hourly") return t("search_bar_hourly_label");
    if (bookingType === "overnight") return t("search_bar_overnight_label");
    return t("search_bar_daily_label");
  };

  const handleSearch = () => {
    if (pathname != "/") {
      if (!checkIn) return toast.warning("Vui lòng chọn ngày giờ!");
    }
    let params;
    if (name) {
      const current = Object.fromEntries([...searchParams]);
      params = {
        ...current,
        search: searchParams.get("search")
          ? Number(searchParams.get("search")) + 1
          : 1,
      };
    } else {
      params = {
        location:
          locationAddress.find((item) => item.name.vi == searchValue)?.id || "",
        type: bookingType,
        checkIn: checkIn ? checkIn.format("YYYY-MM-DD") : "",
        checkOut: checkOut ? checkOut.format("YYYY-MM-DD") : "",
        checkInTime: checkInTime || "",
        duration: checkInDuration || "",
        search: searchParams.get("search")
          ? Number(searchParams.get("search")) + 1
          : 1,
      };
    }

    const queryString = new URLSearchParams(params).toString();
    setTimeout(() => {
      if (pathname == "/") {
        navigate.push(`/rooms?${queryString}`);
      } else {
        navigate.push(`?${queryString}`);
      }
    }, 300);
  };

  console.log("AAA addressOldRef", addressOldRef);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ClickAwayListener
        onClickAway={(e: any) => {
          if (inputRef.current && !inputRef.current.contains(e.target))
            setDropdownOpen(false);
          if (typeRef.current && !typeRef.current.contains(e.target))
            setTypeDropdownOpen(false);
          if (dateRef.current && !dateRef.current.contains(e.target))
            setPickerOpen(false);

          if (inputRef.current && !inputRef.current.contains(e.target)) {
            const isValid = locationAddress.some(
              (loc) => loc.name.vi === searchValue
            );

            if (!isValid) {
              setSearchValue(addressOldRef.current || "");
            }

            setDropdownOpen(false);
          }
        }}>
        <Box>
          <Box>
            {/* === THANH TÌM KIẾM === */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: isMobile ? "24px" : "50px",
                overflow: "hidden",
                bgcolor: "white",
                border: isMobile ? "none" : "1px solid #ddd",
                p: isMobile ? 1.5 : 0.5,
                width: "100%",
              }}>
              {isMobile ? (
                // MOBILE VERSION - Layout dọc
                <Box>
                  {/* Row 1: Tìm kiếm địa điểm */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      disabled={name}
                      placeholder={t("search_bar_location_placeholder")}
                      variant='outlined'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => {
                        addressOldRef.current = selectedAddress;
                        setDropdownOpen(true);
                      }}
                      inputRef={inputRef}
                      onBlur={() => {
                        if (selectingRef.current) return; // ✅ đang click item → bỏ qua blur

                        const isValid = locationAddress.some(
                          (loc) => loc.name.vi === searchValue
                        );

                        if (!isValid) {
                          setSearchValue(selectedAddress || "");
                        }

                        setDropdownOpen(false);
                      }}
                      InputProps={{
                        startAdornment: (
                          <LocationOn
                            sx={{ color: "#98b720", mr: 1, fontSize: 20 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 48,
                          borderRadius: "12px",
                          "& fieldset": {
                            border: dropdownOpen
                              ? "1px solid rgba(152, 183, 32, 1) !important"
                              : isMobile
                              ? "1px solid rgba(152, 183, 32, 1) !important"
                              : "none !important",
                          },
                        },
                      }}
                    />
                    {dropdownOpen && filteredLocations.length > 0 && (
                      <Paper
                        elevation={3}
                        sx={{
                          mt: 1,
                          borderRadius: "12px",
                          maxHeight: 200,
                          overflowY: "auto",
                          border: "1px solid #e0e0e0",
                        }}>
                        <List disablePadding>
                          {filteredLocations.map((loc, i) => (
                            <ListItemButton
                              key={i}
                              onMouseDown={() => {
                                selectingRef.current = true; // ✅ báo đang chọn
                              }}
                              onClick={() => {
                                setSearchValue(loc.name.vi);
                                setSelectedAddress(loc.name.vi);
                                setDropdownOpen(false);
                                selectingRef.current = false;
                              }}
                              sx={{
                                py: 1.5,
                                borderBottom:
                                  i < filteredLocations.length - 1
                                    ? "1px solid #eee"
                                    : "none",
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
                      </Paper>
                    )}
                  </Box>

                  {/* Row 2: Loại đặt + Ngày giờ */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                      <Box
                        ref={typeRef}
                        sx={{ cursor: "pointer" }}
                        onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}>
                        <Box
                          sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "12px",
                            height: 48,
                            px: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: typeDropdownOpen
                              ? "rgba(152, 183, 32, 0.05)"
                              : "white",
                          }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}>
                            {bookingType === "hourly" ? (
                              <AccessTime
                                sx={{ color: "#98b720", fontSize: 18 }}
                              />
                            ) : bookingType === "overnight" ? (
                              <Nightlight
                                sx={{ color: "#98b720", fontSize: 18 }}
                              />
                            ) : (
                              <CalendarToday
                                sx={{ color: "#98b720", fontSize: 18 }}
                              />
                            )}
                            <Typography
                              suppressHydrationWarning
                              sx={{
                                fontWeight: 500,
                                color: "#333",
                                fontSize: "0.85rem",
                              }}>
                              {getTypeLabel()}
                            </Typography>
                          </Box>
                          <KeyboardArrowDown
                            sx={{
                              fontSize: 16,
                              color: "#666",
                              transform: typeDropdownOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        ref={dateRef}
                        sx={{ cursor: "pointer" }}
                        onClick={() => setPickerOpen(true)}>
                        <Box
                          sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "12px",
                            height: 48,
                            px: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: pickerOpen
                              ? "rgba(152, 183, 32, 0.05)"
                              : "white",
                          }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}>
                            <CalendarToday
                              sx={{ color: "#98b720", fontSize: 18 }}
                            />
                            <Typography
                              suppressHydrationWarning
                              sx={{
                                fontWeight: 500,
                                color: "#333",
                                fontSize: "0.85rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                              {formatDateDisplay() || "Chọn ngày"}
                            </Typography>
                          </Box>
                          <KeyboardArrowDown
                            sx={{
                              fontSize: 16,
                              color: "#666",
                              transform: pickerOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Row 3: Nút tìm kiếm */}
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleSearch}
                    sx={{
                      bgcolor: "#98b720",
                      color: "white",
                      height: 48,
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#7a8f1a" },
                    }}>
                    {name
                      ? t("search_bar_update_search_button")
                      : t("search_bar_search_button")}
                  </Button>
                </Box>
              ) : (
                // DESKTOP VERSION - Giữ nguyên layout cũ
                <Stack
                  direction='row'
                  justifyContent={"space-between"}
                  alignItems='center'>
                  {/* Địa điểm */}
                  <Box
                    sx={{
                      flex: pathname == "/" ? "180px 0 0" : "250px 0 0",
                      position: "relative",
                    }}>
                    <TextField
                      id={inputId}
                      fullWidth
                      disabled={name}
                      placeholder='Bạn muốn đi đâu?'
                      variant='outlined'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => {
                        // addressOldRef.current = selectedAddress;
                        setDropdownOpen(true);
                      }}
                      inputRef={inputRef}
                      onBlur={() => {
                        if (!name) {
                          if (selectingRef.current) return; // ✅ đang click item → bỏ qua blur

                          const isValid = locationAddress.some(
                            (loc) => loc.name.vi === searchValue
                          );

                          if (!isValid) {
                            setSearchValue(selectedAddress || "");
                          }

                          setDropdownOpen(false);
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <LocationOn
                            sx={{ color: "#98b720", mr: 1, fontSize: 20 }}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 40,
                          borderRadius: "50px 15px 15px 50px",
                          "& fieldset": {
                            border: dropdownOpen
                              ? "1px solid rgba(152, 183, 32, 1) !important"
                              : "none !important",
                          },
                          "&:hover": {
                            borderColor: dropdownOpen
                              ? "1px solid rgba(152, 183, 32, 1) !important"
                              : "none !important",
                          },
                          "&.Mui-focused": {
                            borderColor: dropdownOpen
                              ? "1px solid rgba(152, 183, 32, 1) !important"
                              : "none !important",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                    <Popper
                      open={dropdownOpen}
                      anchorEl={inputRef.current}
                      placement='bottom-start'
                      sx={{ zIndex: 20, padding: "0px !important" }}>
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
                          <Typography
                            suppressHydrationWarning
                            color='rgba(152, 159, 173, 1)'>
                            {t("search_bar_no_data_found")}
                          </Typography>
                        </Paper>
                      ) : (
                        <Paper
                          elevation={3}
                          sx={{
                            mt: 1,
                            borderRadius: "16px",
                            maxHeight: 300,
                            overflow: "auto",
                            padding: 0.5,
                          }}>
                          <Box p={2} bgcolor='#f9f9f9'>
                            <Typography
                              suppressHydrationWarning
                              variant='subtitle2'
                              color='#666'
                              fontWeight={600}>
                              {t("address")}
                            </Typography>
                          </Box>
                          <List disablePadding>
                            {filteredLocations.map((loc, i) => (
                              <ListItemButton
                                key={i}
                                onMouseDown={() => {
                                  selectingRef.current = true; // ✅ báo đang chọn
                                }}
                                onClick={() => {
                                  setSearchValue(loc.name.vi);
                                  setSelectedAddress(loc.name.vi);
                                  setDropdownOpen(false);
                                  selectingRef.current = false;
                                }}
                                sx={{
                                  py: 1.5,
                                  borderBottom:
                                    i < filteredLocations.length - 1
                                      ? "1px solid #eee"
                                      : "none",
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
                            <Typography
                              suppressHydrationWarning
                              variant='subtitle2'
                              color='#666'
                              fontWeight={600}>
                              {t("hotels")}
                            </Typography>
                          </Box>
                          {dataLoading ? (
                            <Box display={"flex"} justifyContent={"center"}>
                              <CircularProgress
                                sx={{
                                  fontSize: "15px",
                                  color: "rgba(152, 183, 32, 1)",
                                }}
                              />
                            </Box>
                          ) : (
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
                                    const formatDate = (d) =>
                                      d.toISOString().split("T")[0];

                                    // format lên giờ chẵn
                                    const formatHour = (d) => {
                                      let hour = d.getHours();
                                      let minute = d.getMinutes();

                                      // round up: nếu phút > 0 thì cộng 1 giờ
                                      if (minute > 0) hour++;

                                      // format HH:00 (VD: 09:00, 20:00)
                                      return `${String(hour).padStart(
                                        2,
                                        "0"
                                      )}:00`;
                                    };

                                    // Set mặc định nếu param không có
                                    current.checkIn =
                                      current.checkIn || formatDate(now);
                                    current.checkOut =
                                      current.checkOut || formatDate(now);
                                    current.checkInTime =
                                      current.checkInTime || formatHour(now);
                                    current.duration = current.duration || 2;
                                    current.type = "hourly";
                                    setDropdownOpen(false);
                                    // ---- build URL ---- //
                                    navigate.push(
                                      `/room/${loc.id}?${new URLSearchParams(
                                        current
                                      ).toString()}&name=${parseName(loc.name)}`
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
                                    <img src={building} alt='' />
                                  </ListItemIcon>
                                  <Box>
                                    <ListItemText
                                      primary={parseName(loc?.name)}
                                      primaryTypographyProps={{
                                        fontSize: "0.95rem",
                                        color: "#333",
                                        fontWeight: 500,
                                      }}
                                    />
                                    <ListItemText
                                      primary={parseName(loc?.address)}
                                      primaryTypographyProps={{
                                        fontSize: "0.95rem",
                                        color: "#333",
                                        fontWeight: 500,
                                      }}
                                    />
                                  </Box>
                                </ListItemButton>
                              ))}
                            </List>
                          )}
                        </Paper>
                      )}
                    </Popper>
                  </Box>

                  {/* Loại đặt phòng */}
                  <Box
                    ref={typeRef}
                    sx={{
                      cursor: "pointer",
                      flex: pathname == "/" ? "0 0 150px" : "0 0 170px",
                      mx: 1,
                    }}
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}>
                    <Box
                      sx={{
                        borderLeft: "1px solid #eee",
                        borderRight: "1px solid #eee",
                        height: 40,
                        px: 1,
                      }}>
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          border: typeDropdownOpen
                            ? "1px solid #98b720"
                            : "1px solid transparent",
                          borderRadius: "7px",
                        }}>
                        {bookingType === "hourly" ? (
                          <AccessTime sx={{ color: "#98b720", fontSize: 18 }} />
                        ) : bookingType === "overnight" ? (
                          <Nightlight sx={{ color: "#98b720", fontSize: 18 }} />
                        ) : (
                          <CalendarToday
                            sx={{ color: "#98b720", fontSize: 18 }}
                          />
                        )}
                        <Typography
                          suppressHydrationWarning
                          sx={{
                            fontWeight: 500,
                            color: "#333",
                            fontSize: "0.9rem",
                          }}>
                          {getTypeLabel()}
                        </Typography>
                        <KeyboardArrowDown
                          sx={{
                            fontSize: 16,
                            color: "#666",
                            transition: "0.2s",
                            transform: typeDropdownOpen
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Ngày giờ */}
                  <Box
                    ref={dateRef}
                    sx={{
                      flex: pathname == "/" ? 1 : 1,
                      cursor: "pointer",
                      mr: 1,
                    }}
                    onClick={() => setPickerOpen(true)}>
                    <Box
                      sx={{
                        height: 40,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        border: pickerOpen
                          ? "1px solid #98b720"
                          : "1px solid transparent",
                        borderRadius: "7px",
                        gap: 1,
                      }}>
                      <CalendarToday sx={{ color: "#98b720", fontSize: 18 }} />
                      <Typography
                        suppressHydrationWarning
                        sx={{
                          flex: 1,
                          color: "#333",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                        }}>
                        {formatDateDisplay() || t("search_bar_select_datetime")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Tìm kiếm */}
                  <Button
                    variant='contained'
                    onClick={handleSearch}
                    size='large'
                    sx={{
                      bgcolor: "#98b720",
                      color: "white",
                      px: 1,
                      mr: 1,
                      minWidth: "auto",
                      height: 35,
                      "&:hover": { bgcolor: "#7a8f1a" },
                    }}>
                    {name ? (
                      t("search_bar_update_button")
                    ) : (
                      <Search sx={{ fontSize: 22 }} />
                    )}
                  </Button>
                </Stack>
              )}
            </Paper>

            {/* Dropdown loại (desktop) */}

            <BookingTypeDropdown
              open={typeDropdownOpen}
              anchorEl={typeRef.current}
              onClose={() => setTypeDropdownOpen(false)}
              value={bookingType}
              onChange={setBookingType}
            />

            {/* Popup ngày giờ (desktop) */}

            <DateRangePicker
              open={pickerOpen}
              anchorEl={dateRef.current}
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
          </Box>
        </Box>
      </ClickAwayListener>
    </LocalizationProvider>
  );
}
