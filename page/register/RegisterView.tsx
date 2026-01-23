"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Link,
  IconButton,
  useTheme,
  CircularProgress,
  Popper,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

// Images
import image_left from "../../images/Frame 1321317999.png";
import vn from "../../images/VN - Vietnam.png";
import {
  LoginApple,
  LoginGoogle,
  checkUser,
  sendOtp,
  userUpdate,
  verifyOtp,
} from "../../service/admin";
import { toast } from "react-toastify";
import AppleSignin from "react-apple-signin-auth";
import {
  getErrorMessage,
  normalizePhoneForAPI,
  validateChar,
} from "../../utils/utils";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import google from "../../images/Social media logo.png";
import apple from "../../images/Group.png";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

import { useBookingContext } from "@/lib/context";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
dayjs.locale("vi");
// ──────────────────────────────────────────────────────────────
// 1. Registration Form Component
// ──────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID =
  "285312507829-8puo8pp5kikc3ahdivtr9ehq1fm3kkks.apps.googleusercontent.com";
interface RegistrationFormProps {
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  onNext: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  name,
  setName,
  birthDate,
  setBirthDate,
  onNext,
  isLoginGoogle,
  setIsLoginGoogle,
  dataLoginGoogle,
  setDataLoginGoogle,
}) => {
  const t = useTranslations();
  const [touched, setTouched] = useState(false);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedDate, setTouchedDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorExits, setErrorExits] = useState(false);
  const appleRef = useRef<any>(null);
  const context = useBookingContext();
  const navigate = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (phoneNumber && name && birthDate) {
      try {
        let checkUserResult = await checkUser({
          type: "phone",
          value: "+84" + normalizePhoneForAPI(phoneNumber),
        });
        if (checkUserResult.code === "OK") {
          toast.warning(t("account_exists_warning"));
          setLoading(false);
          return;
        }
        let result = await sendOtp({
          platform: "ios",
          type: "phone",
          value: "+84" + normalizePhoneForAPI(phoneNumber),
        });
        if (result.success) {
          onNext();
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
  };

  const isValidVietnamPhone = (phone: string) => {
    if (!phone) return false;
    const normalized = phone.replace(/\D/g, "");
    return (
      /^0[35789]\d{8,9}$/.test("0" + normalized) ||
      /^[35789]\d{8,9}$/.test(normalized)
    );
  };

  const isValidName = (name: string): boolean => {
    if (!name) return false;
    if (name.length > 100) return false;

    // Regex:
    // ^[A-Za-zÀ-ỹ]+       : bắt đầu bằng chữ cái (không cho khoảng trắng đầu)
    // (?:\s[A-Za-zÀ-ỹ]+)* : tiếp theo là (1 khoảng trắng + ít nhất 1 chữ cái), lặp lại
    // $                   : kết thúc (không cho khoảng trắng cuối)
    const vietnameseNameRegex = /^[A-Za-zÀ-ỹ]+(?:\s[A-Za-zÀ-ỹ]+)*$/;

    return vietnameseNameRegex.test(name);
  };
  const isValidBirthDate = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const birthDate = new Date(dateStr);
    const ageDifMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  };

  const isDisabled =
    !phoneNumber ||
    !name ||
    !birthDate ||
    !isValidVietnamPhone(phoneNumber) ||
    !isValidName(name) ||
    loading;

  const today = new Date();
  const minAge = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = minAge.toISOString().split("T")[0];

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await LoginGoogle({
        platform: "ios",
        id_token:
          credentialResponse?.access_token || credentialResponse?.credential,
        location: "hanoi",
      });

      if (!result?.user?.phone) {
        setIsLoginGoogle(true);
        setDataLoginGoogle(result);
        return;
      }

      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        localStorage.setItem("user", JSON.stringify(result.user));
        context.dispatch({
          type: "LOGIN",
          payload: { ...context.state, user: result.user },
        });
        toast.success("Login success");
        setTimeout(() => navigate.push("/"), 300);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleError = () => toast.error("Google login failed");

  const handleUpdatePhoneGoogle = async () => {
    setLoading(true);
    try {
      const checkResult = await checkUser({
        type: "phone",
        value: "+84" + normalizePhoneForAPI(phoneNumber),
      });
      if (checkResult.code === "OK") {
        setErrorExits(true);
        setLoading(false);
        return;
      }
      const otpResult = await sendOtp({
        platform: "ios",
        type: "phone",
        value: "+84" + normalizePhoneForAPI(phoneNumber),
      });
      if (otpResult.success) onNext();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAppleResponse = async (response: any) => {
    if (response?.authorization?.id_token) {
      try {
        const result = await LoginApple({
          platform: "ios",
          id_token: response.authorization.id_token,
          location: "hanoi",
        });

        if (!result?.user?.phone) {
          setIsLoginGoogle(true);
          setDataLoginGoogle(result);
          return;
        }

        if (result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          localStorage.setItem("refresh_token", result.refresh_token);
          localStorage.setItem("user", JSON.stringify(result.user));
          context.dispatch({
            type: "LOGIN",
            payload: { ...context.state, user: result.user },
          });
          toast.success("Login success");
          setTimeout(() => navigate.push("/"), 300);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <Container
      maxWidth='lg'
      sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Image
            src={image_left}
            alt='Hotel illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} display='flex' justifyContent='end' md={6}>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              suppressHydrationWarning
              sx={{
                fontSize: { xs: "28px", md: "32px" },
                fontWeight: 700,
                mb: 1,
              }}>
              {isLoginGoogle
                ? t("enter_phone_to_continue")
                : t("register_title")}
            </Typography>
            {!isLoginGoogle && (
              <Typography
                suppressHydrationWarning
                sx={{ fontSize: "16px", mb: 4 }}
                color='text.secondary'>
                {t("register_description")}
              </Typography>
            )}

            <Box component='form' onSubmit={handleSubmit}>
              {/* Phone */}
              <Typography
                suppressHydrationWarning
                fontSize={14}
                fontWeight={500}
                mb={0.5}>
                {t("phone_number_label")}
              </Typography>
              <TextField
                fullWidth
                placeholder={t("phone_placeholder")}
                variant='outlined'
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                onBlur={() => setTouched(true)}
                error={touched && !isValidVietnamPhone(phoneNumber)}
                helperText={
                  touched && !isValidVietnamPhone(phoneNumber)
                    ? t("invalid_phone_error")
                    : ""
                }
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    height: "60px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&:hover fieldset": { borderColor: "#98b720" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#98b720",
                      borderWidth: 1.5,
                    },
                  },
                  "& input": { py: 1.5 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Image
                        src={vn}
                        alt='vn'
                        style={{
                          width: 28,
                          height: 20,
                          borderRadius: 4,
                          objectFit: "cover",
                          marginRight: 8,
                        }}
                      />
                      <Typography
                        suppressHydrationWarning
                        sx={{ fontSize: 14, marginRight: 1 }}>
                        +84
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment:
                    touched && !isValidVietnamPhone(phoneNumber) ? (
                      <InputAdornment position='end'>
                        <Box
                          sx={{
                            cursor: "pointer",
                            fontSize: 22,
                            color: "#999",
                          }}
                          onClick={() => {
                            setPhoneNumber("");
                            setTouched(false);
                          }}>
                          ✕
                        </Box>
                      </InputAdornment>
                    ) : null,
                }}
              />

              {/* Name */}
              {!isLoginGoogle && (
                <>
                  <Typography
                    suppressHydrationWarning
                    fontSize={14}
                    fontWeight={500}
                    mb={0.5}>
                    {t("name_label")}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={t("name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouchedName(true)}
                    error={touchedName && !isValidName(name)}
                    helperText={
                      touchedName && !isValidName(name)
                        ? t("invalid_name_error")
                        : ""
                    }
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        height: "60px",
                        backgroundColor: "#fff",
                        "&.Mui-focused fieldset": {
                          borderColor: "#98b720",
                          borderWidth: 1.5,
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment:
                        touchedName && !isValidName(name) ? (
                          <InputAdornment position='end'>
                            <Box
                              sx={{
                                cursor: "pointer",
                                fontSize: 22,
                                color: "#999",
                              }}
                              onClick={() => {
                                setName("");
                                setTouchedName(false);
                              }}>
                              ✕
                            </Box>
                          </InputAdornment>
                        ) : null,
                    }}
                  />
                </>
              )}

              {/* Birth date */}
              {!isLoginGoogle && (
                <>
                  <Typography
                    suppressHydrationWarning
                    fontSize={14}
                    fontWeight={500}
                    mb={0.5}>
                    {t("birthdate_label")}
                  </Typography>
                  <LocalizationProvider
                    adapterLocale='vi'
                    dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={birthDate ? dayjs(birthDate) : null}
                      dayOfWeekFormatter={(day) => {
                        const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                        return map[day.day()];
                      }}
                      onChange={(newValue) => {
                        setBirthDate(
                          newValue ? newValue.format("YYYY-MM-DD") : ""
                        );
                      }}
                      maxDate={dayjs(maxDate)}
                      /* 🔥 CUSTOM POPPER */
                      slots={{
                        popper: (props) => (
                          <Popper
                            {...props}
                            placement='bottom-start'
                            style={{
                              width: props.anchorEl
                                ? props.anchorEl.clientWidth
                                : undefined,
                            }}
                          />
                        ),
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touchedDate && !isValidBirthDate(birthDate),
                          helperText:
                            touchedDate && !isValidBirthDate(birthDate)
                              ? t("invalid_birthdate_error")
                              : "",
                          onBlur: () => setTouchedDate(true),

                          InputProps: {
                            sx: {
                              height: "60px",
                              borderRadius: "16px",
                              backgroundColor: "#fff",

                              "& .MuiOutlinedInput-notchedOutline": {
                                borderRadius: "16px",
                                borderColor: "#cddc39",
                              },

                              "&:focus-within .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#98b720",
                                  borderWidth: 2,
                                },

                              "& input": {
                                padding: "18px 14px",
                                fontSize: "16px",
                              },
                            },
                          },

                          sx: { mb: 3 },
                        },

                        /* OPTIONAL: style calendar box */
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              borderRadius: "16px",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}
              <Typography
                suppressHydrationWarning
                sx={{ fontSize: "14px", mb: 3 }}
                color='text.secondary'>
                {t("agreement_text")}{" "}
                <Link
                  href='#'
                  sx={{
                    color: "#9AC700",
                    fontWeight: 500,
                    textDecoration: "underline",
                  }}>
                  {t("terms_and_privacy_link")}
                </Link>{" "}
                {t("terms_and_privacy")} của Hotel Booking
              </Typography>

              {isLoginGoogle ? (
                <Button
                  onClick={handleUpdatePhoneGoogle}
                  fullWidth
                  disabled={loading || !isValidVietnamPhone(phoneNumber)}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: "16px",
                    backgroundColor:
                      loading || !isValidVietnamPhone(phoneNumber)
                        ? "#e0e0e0"
                        : "#98b720",
                    color:
                      loading || !isValidVietnamPhone(phoneNumber)
                        ? "#888"
                        : "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "18px",
                    height: "56px",
                    "&:hover": {
                      backgroundColor:
                        loading || !isValidVietnamPhone(phoneNumber)
                          ? "#e0e0e0"
                          : "#98b720",
                    },
                  }}>
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ color: "#fff", mr: 1 }}
                      />
                      {t("continue")}...
                    </>
                  ) : (
                    t("continue")
                  )}
                </Button>
              ) : (
                <Button
                  type='submit'
                  fullWidth
                  disabled={isDisabled}
                  sx={{
                    mb: 3,
                    py: 1.5,
                    borderRadius: "16px",
                    backgroundColor: isDisabled ? "#e0e0e0" : "#98b720",
                    color: isDisabled ? "#888" : "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "18px",
                    height: "56px",
                    position: "relative",
                    "&:hover": {
                      backgroundColor: isDisabled ? "#e0e0e0" : "#98b720",
                    },
                  }}>
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ color: "#fff", mr: 1 }}
                      />
                      {t("sending_otp")}
                    </>
                  ) : (
                    t("register_button")
                  )}
                </Button>
              )}
              {!isLoginGoogle && (
                <>
                  <Typography
                    suppressHydrationWarning
                    variant='body2'
                    align='center'
                    mb={2}
                    color='text.secondary'>
                    {t("or")}
                  </Typography>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                      <>
                        {/* Apple Signin – ẨN */}
                        <div style={{ display: "block" }}>
                          <AppleSignin
                            ref={appleRef}
                            authOptions={{
                              clientId: "com.zeezoo.hotelbooking.login",
                              scope: "name email",
                              redirectURI:
                                "https://booking-hotel-liard.vercel.app",
                              responseType: "code",
                              responseMode: "query",
                              usePopup: true,
                            }}
                            onSuccess={handleAppleResponse}
                            onError={(error) => {
                              console.error("Apple login error", error);
                            }}
                            render={(props) => (
                              <Button
                                variant='outlined'
                                fullWidth
                                {...props}
                                sx={{
                                  py: 1.2,
                                  textTransform: "none",
                                  fontWeight: 500,
                                  borderRadius: 3,
                                  borderColor: "#e0e0e0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 1,
                                  "&:hover": { borderColor: "#bdbdbd" },
                                }}>
                                <Image
                                  src={apple}
                                  alt='Apple'
                                  width={20}
                                  height={20}
                                  style={{ marginTop: -0.7 }}
                                />
                                {t("sign_up_with_apple")}
                              </Button>
                            )}
                          />
                        </div>

                        {/* Custom UI */}
                      </>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <GoogleCustomButton
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                        />
                      </GoogleOAuthProvider>
                    </Grid>
                  </Grid>
                  <Typography
                    suppressHydrationWarning
                    sx={{ fontSize: "14px" }}
                    color='text.secondary'>
                    {t("no_account_yet")}
                    <Link
                      onClick={() => navigate.push("/register")}
                      sx={{
                        color: "#ff7a00",
                        fontWeight: 500,
                        textDecoration: "underline",
                        cursor: "pointer",
                        ml: 0.5,
                      }}>
                      {t("register_now_link")}
                    </Link>
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 2. OTP Verification Component
// ──────────────────────────────────────────────────────────────
interface OtpVerificationProps {
  phoneNumber: string;
  otp: string;
  name: string;
  birthDate: string;
  setOtp: (v: string) => void;
  timer: number;
  isResendEnabled: boolean;
  onResend: () => void;
  onSuccess: (user: any) => void;
  onBack: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  phoneNumber,
  otp,
  setOtp,
  timer,
  isResendEnabled,
  onResend,
  onSuccess,
  onBack,
  name,
  birthDate,
  isLoginGoogle,
  dataLoginGoogle,
}) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [countSpam, setCountSpam] = useState(1);

  const [otpKey, setOtpKey] = useState(0);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    console.log("AAAAA countSpam", countSpam);
    if (countSpam == 5) {
      toast.warning("Quá số lần nhập OTP");
      onBack();
      return;
    }

    setLoading(true);
    if (otp.length === 4) {
      try {
        let body;
        if (isLoginGoogle) {
          body = {
            platform: "ios",
            type: "phone",
            value: "+84" + normalizePhoneForAPI(phoneNumber),
            otp: otp,
          };
        } else {
          body = {
            platform: "ios",
            type: "phone",
            value: "+84" + normalizePhoneForAPI(phoneNumber),
            otp: otp,
            location: "hanoi",
            name: name,
            birthday: birthDate,
          };
        }
        let result = await verifyOtp(body, dataLoginGoogle?.access_token);
        if (result.access_token) {
          onSuccess(result);
        } else {
          setCountSpam(countSpam + 1);
          setOtp("");
          toast.error(getErrorMessage(result.code) || result.message);
          setOtpKey((prev) => prev + 1);
        }
      } catch (error) {
        console.log(error);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    if (otp.length === 4 && !loading) {
      handleSubmit();
    }
  }, [otp]);
  return (
    <Container
      maxWidth='lg'
      sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}>
          <Image
            src={image_left}
            alt='illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} md={6} display='flex' justifyContent='end'>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              suppressHydrationWarning
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}>
              <ArrowBackIosNewIcon
                onClick={onBack}
                sx={{ cursor: "pointer" }}
              />
              {t("enter_otp_title")}
            </Typography>

            <Typography
              suppressHydrationWarning
              sx={{ fontSize: "16px", mb: 4, color: "text.secondary" }}>
              {t("otp_sent_to")} <b>+84{normalizePhoneForAPI(phoneNumber)}</b>
            </Typography>

            <Box component='form' onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <MuiOtpInput
                  key={otpKey}
                  value={otp}
                  onChange={setOtp}
                  length={4}
                  autoFocus
                  validateChar={validateChar}
                  sx={{
                    gap: 2,
                    "& .MuiOtpInput-TextField .MuiOutlinedInput-root": {
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      borderRadius: "16px",
                      backgroundColor: "#fff",
                      "& fieldset": { borderColor: "#9AC700" },
                      "&:hover fieldset": { borderColor: "#7cb400" },
                      "&.Mui-focused fieldset": { borderColor: "#9AC700" },
                    },
                    "& input": {
                      textAlign: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#9AC700",
                    },
                  }}
                />
              </Box>

              <Typography
                suppressHydrationWarning
                sx={{
                  mb: 4,
                  color: "#FF7A00",
                  fontSize: "14px",
                  fontWeight: 500,
                }}>
                {isResendEnabled ? (
                  <Link onClick={onResend} sx={{ cursor: "pointer" }}>
                    {t("resend_otp")}
                  </Link>
                ) : (
                  `${t("resend_in")} (${formatTime(timer)})`
                )}
              </Typography>

              {/* <Button
                type='submit'
                fullWidth
                disabled={otp.length !== 4 || loading}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor:
                    otp.length !== 4 || loading ? "#e0e0e0" : "#9AC700",
                  color: otp.length !== 4 || loading ? "#888" : "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": {
                    backgroundColor:
                      otp.length !== 4 || loading ? "#e0e0e0" : "#7cb400",
                  },
                  position: "relative",
                }}>
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("verifying")}
                  </>
                ) : (
                  t("verify_otp")
                )}
              </Button> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 3. Pin Creation & Confirm
// ──────────────────────────────────────────────────────────────
const PinCreation = ({ onNext, onBack, pin, setPin }: any) => {
  const t = useTranslations();
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = () => {
    if (pin.length === 6) onNext();
  };

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    // Lần đầu mount → không auto submit
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Từ lần thay đổi thứ 2 trở đi mới auto submit
    if (pin.length === 6) {
      onNext();
    }
  }, [pin, onNext]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn hành vi mặc định (nếu có form submit)

      // Chỉ submit nếu pin có ít nhất 1 ký tự (hoặc theo logic bạn muốn)
      if (pin.length === 6) {
        onNext();
      }
    }
  };
  return (
    <Container
      maxWidth='lg'
      sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}>
          <Image
            src={image_left}
            alt='illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} md={6} display='flex' justifyContent='end'>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              suppressHydrationWarning
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}>
              {onBack && (
                <ArrowBackIosNewIcon
                  onClick={onBack}
                  sx={{ cursor: "pointer" }}
                />
              )}
              {t("create_pin_title")}
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography
                suppressHydrationWarning
                fontSize={14}
                color='#5D6679'
                fontWeight={500}>
                {t("pin_usage_description")}
              </Typography>
              <Typography
                suppressHydrationWarning
                onClick={() => setShowPin(!showPin)}
                sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                {showPin ? t("hide_pin") : t("show_pin")}
              </Typography>
            </Box>

            <Box component='form' onSubmit={handleSubmit}>
              <MuiOtpInput
                onKeyDown={handleKeyDown}
                value={pin}
                onChange={setPin}
                length={6}
                validateChar={validateChar}
                TextFieldsProps={{ type: showPin ? "text" : "password" }}
                sx={{
                  gap: 1.5,
                  justifyContent: "space-between",
                  mb: 3,
                  "& .MuiOtpInput-TextField .MuiOutlinedInput-root": {
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    borderRadius: "16px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#9AC700" },
                  },
                  "& input": {
                    textAlign: "center",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#9AC700",
                  },
                }}
              />

              {/* <Button
                type='submit'
                fullWidth
                disabled={pin.length !== 6}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor: pin.length === 6 ? "#9AC700" : "#e0e0e0",
                  color: pin.length === 6 ? "#fff" : "#888",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": {
                    backgroundColor: pin.length === 6 ? "#7cb400" : "#e0e0e0",
                  },
                }}>
                {t("continue")}
              </Button> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const PinCreationConfirm = ({
  onSuccess,
  onBack,
  pinConfirm,
  dataUser,
}: any) => {
  const t = useTranslations();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const context = useBookingContext();
  const [count, setCount] = useState(1);
  const handleSubmit = async (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (count == 5) {
      toast.warning("Nhập mã pin sai quá 5 lần ");
      onBack(true);
      return;
    }
    setLoading(true);
    if (pin.length === 6 && pin === pinConfirm) {
      try {
        let result = await userUpdate(
          { password: pin },
          dataUser?.access_token
        );
        if (result.code === "OK") {
          localStorage.setItem("access_token", dataUser.access_token);
          localStorage.setItem("refresh_token", dataUser.refresh_token);
          localStorage.setItem("user", JSON.stringify(dataUser.user));
          context.dispatch({
            type: "LOGIN",
            payload: { ...context.state, user: { ...dataUser.user } },
          });
          onSuccess();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setShowConfirm(true);
      setCount(count + 1);
      setPin("");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <Container
      maxWidth='lg'
      sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}>
          <Image
            src={image_left}
            alt='illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} md={6} display='flex' justifyContent='end'>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              suppressHydrationWarning
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}>
              {onBack && (
                <ArrowBackIosNewIcon
                  onClick={() => onBack()}
                  sx={{ cursor: "pointer" }}
                />
              )}
              {t("confirm_pin_title")}
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography
                suppressHydrationWarning
                fontSize={14}
                color='#5D6679'
                fontWeight={500}>
                {t("pin_usage_description")}
              </Typography>
              <Typography
                suppressHydrationWarning
                onClick={() => setShowPin(!showPin)}
                sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                {showPin ? t("hide_pin") : t("show_pin")}
              </Typography>
            </Box>

            <Box component='form' onSubmit={handleSubmit}>
              <MuiOtpInput
                value={pin}
                onChange={setPin}
                length={6}
                validateChar={validateChar}
                TextFieldsProps={{ type: showPin ? "text" : "password" }}
                sx={{
                  gap: 1.5,
                  justifyContent: "space-between",
                  mb: 3,
                  "& .MuiOtpInput-TextField .MuiOutlinedInput-root": {
                    width: { xs: 50, sm: 60 },
                    height: { xs: 50, sm: 60 },
                    borderRadius: "16px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#9AC700" },
                  },
                  "& input": {
                    textAlign: "center",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#9AC700",
                  },
                }}
              />

              {showConfirm && pin !== pinConfirm && (
                <Typography
                  suppressHydrationWarning
                  sx={{
                    color: "#f44336",
                    fontSize: "14px",
                    mb: 2,
                    fontWeight: 500,
                  }}>
                  {t("pin_not_match")}
                </Typography>
              )}

              {/* <Button
                type='submit'
                fullWidth
                disabled={pin.length !== 6 || loading}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor:
                    pin.length !== 6 || loading ? "#e0e0e0" : "#9AC700",
                  color: pin.length !== 6 || loading ? "#888" : "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": {
                    backgroundColor:
                      pin.length !== 6 || loading ? "#e0e0e0" : "#7cb400",
                  },
                  position: "relative",
                }}>
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("processing")}
                  </>
                ) : (
                  t("complete_registration")
                )}
              </Button> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 4. Main RegisterView
// ──────────────────────────────────────────────────────────────
const RegisterView = () => {
  const [currentStep, setCurrentStep] = useState<
    "register" | "otp" | "pin" | "confirm_pin"
  >("register");
  const [pin, setPin] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [otp, setOtp] = useState("");
  const [dataUser, setDataUser] = useState<any>(null);
  const [timer, setTimer] = useState(55);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [dataLoginGoogle, setDataLoginGoogle] = useState<any>(null);
  const [isLoginGoogle, setIsLoginGoogle] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    if (timer > 0 && currentStep === "otp") {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else if (timer === 0) {
      setIsResendEnabled(true);
    }
  }, [timer, currentStep]);

  const goToOtp = () => {
    setCurrentStep("otp");
    setTimer(55);
    setIsResendEnabled(false);
  };

  const goToPin = (user: any) => {
    setDataUser(user);
    setCurrentStep("pin");
  };

  const goBack = () => setCurrentStep("register");

  const handleResend = () => {
    setTimer(55);
    setIsResendEnabled(false);
    setOtp("");
  };

  return (
    <>
      {currentStep === "register" && (
        <RegistrationForm
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          name={name}
          setName={setName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          onNext={goToOtp}
          dataLoginGoogle={dataLoginGoogle}
          setDataLoginGoogle={setDataLoginGoogle}
          setIsLoginGoogle={setIsLoginGoogle}
          isLoginGoogle={isLoginGoogle}
        />
      )}

      {currentStep === "otp" && (
        <OtpVerification
          phoneNumber={phoneNumber}
          otp={otp}
          setOtp={setOtp}
          timer={timer}
          isResendEnabled={isResendEnabled}
          onResend={handleResend}
          onSuccess={goToPin}
          onBack={goBack}
          name={name}
          birthDate={birthDate}
          isLoginGoogle={isLoginGoogle}
          dataLoginGoogle={dataLoginGoogle}
        />
      )}

      {currentStep === "pin" && (
        <PinCreation
          onNext={() => setCurrentStep("confirm_pin")}
          onBack={() => setCurrentStep("otp")}
          setPin={setPin}
          pin={pin}
        />
      )}

      {currentStep === "confirm_pin" && (
        <PinCreationConfirm
          onSuccess={() => navigate.push("/?from=register&msg=success")}
          onBack={(isOtp) => {
            if (isOtp) {
              setCurrentStep("otp");
            } else {
              setCurrentStep("pin");
            }
          }}
          pinConfirm={pin}
          dataUser={dataUser}
        />
      )}
    </>
  );
};

export default RegisterView;

const GoogleCustomButton = ({ onSuccess, onError }: any) => {
  const t = useTranslations();
  const login = useGoogleLogin({ onSuccess, onError });
  return (
    <Button
      variant='outlined'
      onClick={() => login()} // click vẫn hoạt động
      fullWidth
      sx={{
        py: 1.2,
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 3,
        borderColor: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        "&:hover": { borderColor: "#bdbdbd" },
      }}>
      <Image src={google} alt='Google' style={{ width: 23 }} />
      {t("sign_up_with_google")}
    </Button>
  );
};
