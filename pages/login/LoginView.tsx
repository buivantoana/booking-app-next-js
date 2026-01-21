'use client';
import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Link,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import image_left from "../../images/Frame 1321317999.png";
import google from "../../images/Social media logo.png";
import apple from "../../images/Group.png";
import vn from "../../images/VN - Vietnam.png";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  Login,
  LoginApple,
  LoginGoogle,
  checkUser,
  sendOtp,
  userUpdate,
  verifyOtp,
} from "../../service/admin";
import { toast } from "react-toastify";


import { GoogleOAuthProvider } from "@react-oauth/google";
const AppleLogin = dynamic(
  () => import('react-apple-login').then(mod => mod.default),  // hoặc mod.AppleLogin nếu export tên
  { ssr: false }  // ← Quan trọng: tắt server-side render
);
import { useGoogleLogin } from "@react-oauth/google";
import {
  getErrorMessage,
  normalizePhoneForAPI,
  validateChar,
} from "../../utils/utils";
import { ErrorOutline } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useBookingContext } from "@/lib/context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const GOOGLE_CLIENT_ID =
  "285312507829-8puo8pp5kikc3ahdivtr9ehq1fm3kkks.apps.googleusercontent.com";

const LoginView = () => {
  const  t  = useTranslations();
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState("register");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(55);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [dataLoginGoogle, setDataLoginGoogle] = useState<any>(null);
  const [isLoginGoogle, setIsLoginGoogle] = useState(false);
  const [pin, setPin] = useState("");
  const context = useBookingContext();
  const navigate = useRouter();

  const goToPin = (result: any) => {
    if (dataLoginGoogle?.access_token) {
      setCurrentStep("pin_google");
    } else {
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem("user", JSON.stringify(result.user));
      context.dispatch({
        type: "LOGIN",
        payload: { ...context.state, user: { ...result.user } },
      });
      toast.success("Login success");
      setTimeout(() => navigate.push("/"), 300);
    }
  };

  const goBack = () => {
    setIsLoginGoogle(false);
    setCurrentStep("register");
  };

  const handleResend = () => {
    setTimer(55);
    setIsResendEnabled(false);
    setOtp("");
  };

  return (
    <>
      {currentStep === "register" && (
        <RegistrationForm
          dataLoginGoogle={dataLoginGoogle}
          setDataLoginGoogle={setDataLoginGoogle}
          setIsLoginGoogle={setIsLoginGoogle}
          isLoginGoogle={isLoginGoogle}
          setPhoneNumber={setPhoneNumber}
          phoneNumber={phoneNumber}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === "pin" && (
        <PinCreation
          setCurrentStep={setCurrentStep}
          phoneNumber={phoneNumber}
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
          dataLoginGoogle={dataLoginGoogle}
        />
      )}

      {currentStep === "pin_google" && (
        <PinCreationGoogle
          onNext={() => setCurrentStep("cofirm_pin")}
          onBack={() => setCurrentStep("otp")}
          setPin={setPin}
          pin={pin}
        />
      )}

      {currentStep === "cofirm_pin" && (
        <PinCreationConfirm
          onSuccess={() => navigate.push("/?from=register&msg=success")}
          onBack={() => setCurrentStep("pin_google")}
          pinConfirm={pin}
          dataUser={dataLoginGoogle}
          phoneNumber={phoneNumber}
        />
      )}
    </>
  );
};

export default LoginView;

// ==================== PIN CREATION GOOGLE ====================
const PinCreationGoogle = ({ onNext, onBack, pin, setPin }: any) => {
  const  t  = useTranslations();
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Typography suppressHydrationWarning 
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
              <Typography suppressHydrationWarning  fontSize={14} color='#5D6679' fontWeight={500}>
                {t("pin_usage_description")}
              </Typography>
              <Typography suppressHydrationWarning 
                onClick={() => setShowPin(!showPin)}
                sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                {showPin ? t("hide_pin") : t("show_pin")}
              </Typography>
            </Box>

            <Box component='form' onSubmit={handleSubmit}>
              <MuiOtpInput
                value={pin}
                onKeyDown={handleKeyDown}
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

// ==================== PIN CONFIRM (Google flow) ====================
const PinCreationConfirm = ({
  onSuccess,
  onBack,
  pinConfirm,
  dataUser,
  phoneNumber,
}: any) => {
  const  t  = useTranslations();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const context = useBookingContext();

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    setLoading(true);

    if (pin.length === 6 && pin === pinConfirm) {
      try {
        const result = await userUpdate(
          { password: pin, phone: "+84" + phoneNumber },
          dataUser?.access_token
        );
        if (result.code === "OK") {
          localStorage.setItem("access_token", dataUser.access_token);
          localStorage.setItem("refresh_token", dataUser.refresh_token);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...dataUser.user, phone: "+84" + phoneNumber })
          );
          context.dispatch({
            type: "LOGIN",
            payload: {
              ...context.state,
              user: { ...dataUser.user, phone: "+84" + phoneNumber },
            },
          });
          onSuccess();
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setShowConfirm(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pin.length === 6 && !loading) {
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
            <Typography suppressHydrationWarning 
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
              {t("confirm_pin_title")}
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography suppressHydrationWarning  fontSize={14} color='#5D6679' fontWeight={500}>
                {t("pin_usage_description")}
              </Typography>
              <Typography suppressHydrationWarning 
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
                <Typography suppressHydrationWarning 
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

// ==================== OTP VERIFICATION ====================
const OtpVerification = ({
  phoneNumber,
  otp,
  setOtp,
  timer,
  isResendEnabled,
  onResend,
  onSuccess,
  onBack,
  dataLoginGoogle,
}: any) => {
  const  t  = useTranslations();
  const [loading, setLoading] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    setLoading(true);
    if (otp.length === 4) {
      try {
        const result = await verifyOtp(
          {
            platform: "ios",
            type: "phone",
            value: "+84" + normalizePhoneForAPI(phoneNumber),
            otp,
          },
          dataLoginGoogle?.access_token
        );
        if (result.access_token) {
          onSuccess(result);
        } else {
          toast.error(getErrorMessage(result.code) || result.detail);
          setOtp("");                    // xóa
          toast.error(getErrorMessage(result.code) || result.message);

          // Force re-mount MuiOtpInput → tự động focus ô đầu
          setOtpKey(prev => prev + 1);
        }
      } catch (error) {
        console.error(error);
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
            <Typography suppressHydrationWarning 
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

            <Typography suppressHydrationWarning 
              sx={{ fontSize: "16px", mb: 4, color: "text.secondary" }}>
              {t("otp_sent_to")} <b>+84{normalizePhoneForAPI(phoneNumber)}</b>
            </Typography>

            <Box component='form' onSubmit={handleSubmit}>
              <MuiOtpInput
                value={otp}
                validateChar={validateChar}
                onChange={setOtp}
                key={otpKey}
                autoFocus
                length={4}
                sx={{
                  gap: 2,
                  mb: 2,
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

              <Typography suppressHydrationWarning 
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

// ==================== REGISTRATION / LOGIN FORM ====================
const RegistrationForm = ({
  setCurrentStep,
  setPhoneNumber,
  phoneNumber,
  isLoginGoogle,
  setIsLoginGoogle,
  dataLoginGoogle,
  setDataLoginGoogle,
}: any) => {
  const  t  = useTranslations();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errorExits, setErrorExits] = useState(false);
  const context = useBookingContext();
  const navigate = useRouter();

  const isValidVietnamPhone = (phone: string) => {
    if (!phone) return false;
    const normalized = phone.replace(/\D/g, "");
    return (
      /^0[35789]\d{8,9}$/.test("0" + normalized) ||
      /^[35789]\d{8,9}$/.test(normalized)
    );
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await checkUser({
        type: "phone",
        value: "+84" + normalizePhoneForAPI(phoneNumber),
      });
      if (result.code === "OK") {
        setCurrentStep("pin");
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

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
      if (otpResult.success) setCurrentStep("otp");
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
      sx={{ display: "flex", alignItems: "center", py: 5 }}>
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
            alt='Hotel illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} md={6} display='flex' justifyContent='end'>
          <Box
            sx={{
              px: { xs: 3, sm: 4, md: 0 },
              width: { xs: "100%", sm: "400px", md: "486px" },
            }}>
            <Typography suppressHydrationWarning 
              sx={{
                fontSize: { xs: "28px", md: "32px" },
                fontWeight: 700,
                mb: 1,
              }}>
              {isLoginGoogle ? (
                <>
                  <ArrowBackIosNewIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => setIsLoginGoogle(false)}
                  />{" "}
                  {t("your_phone_title")}
                </>
              ) : (
                t("login_welcome")
              )}
            </Typography>

            <Typography suppressHydrationWarning 
              sx={{ fontSize: "16px", mb: 4, color: "text.secondary" }}>
              {isLoginGoogle
                ? t("enter_phone_to_continue")
                : t("login_exclusive_offers")}
            </Typography>

            <Box>
              <Typography suppressHydrationWarning  fontSize={14} fontWeight={500} mb={0.5}>
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
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Image
                        src={vn}
                        alt='VN'
                        style={{
                          width: 28,
                          height: 20,
                          borderRadius: 4,
                          objectFit: "cover",
                          marginRight: 8,
                        }}
                      />
                      <Typography suppressHydrationWarning  sx={{ fontSize: 14, mr: 1 }}>+84</Typography>
                    </InputAdornment>
                  ),
                }}
              />

              <Typography suppressHydrationWarning  sx={{ mb: 3, mt: 0.5 }} fontSize='12px' color='red'>
                {errorExits && t("phone_already_registered")}
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
                  onClick={handleRegister}
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
                      {t("login_button")}...
                    </>
                  ) : (
                    t("login_button")
                  )}
                </Button>
              )}

              {!isLoginGoogle && (
                <>
                  <Typography suppressHydrationWarning 
                    variant='body2'
                    align='center'
                    mb={2}
                    color='text.secondary'>
                    {t("or")}
                  </Typography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                    {AppleLogin ?   <AppleLogin
                        clientId='com.zeezoo.hotelbooking.login'
                        redirectURI='https://booking-hotel-liard.vercel.app'
                        responseType='code'
                        responseMode='query'
                        usePopup={true}
                        scope='name email'
                        callback={handleAppleResponse}
                        render={(renderProps: any) => (
                          <Button
                            variant='outlined'
                            onClick={renderProps.onClick}
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
                            <Image
                             
                              src={apple}
                              alt='Apple'
                              style={{ width: 20, marginTop: -0.7 }}
                            />
                            {t("sign_up_with_apple")}
                          </Button>
                        )}
                      />:(
                        <CircularProgress />  // Hoặc button disabled
                      )}
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

                  <Typography suppressHydrationWarning  sx={{ fontSize: "14px" }} color='text.secondary'>
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

// ==================== PIN LOGIN (khi đã có tài khoản) ====================
const PinCreation = ({ phoneNumber, setCurrentStep }: any) => {
  const  t  = useTranslations();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const navigate = useRouter();
  const context = useBookingContext();
  const MAX_ATTEMPTS = 5;
  const handleSubmit = async () => {
    if (loading || pin.length !== 6) return;
    if (attemptsLeft <= 0) return;

    setLoading(true);
    setErrorMessage(""); // Xóa lỗi cũ

    try {
      const result = await Login({
        platform: "ios",
        type: "phone",
        value: "+84" + normalizePhoneForAPI(phoneNumber),
        password: pin,
      });

      if (result.access_token) {
        // Đăng nhập thành công
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        localStorage.setItem("user", JSON.stringify(result.user));
        context.dispatch({
          type: "LOGIN",
          payload: { ...context.state, user: result.user },
        });
        toast.success("Đăng nhập thành công");
        setTimeout(() => navigate.push("/"), 300);
      } else {
        // Đăng nhập thất bại
        const errorMsg =
          getErrorMessage(result.code) || result.message || "Mã PIN không đúng";
        setErrorMessage(errorMsg);

        // Giảm số lần thử
        setAttemptsLeft((prev) => {
          const newAttempts = prev - 1;
          if (newAttempts <= 0) {
            toast.error(
              "Bạn đã hết số lần thử. Vui lòng thử lại sau hoặc khôi phục PIN."
            );
            // Có thể thêm logic khóa tạm thời ở đây (ví dụ: disable input 30s)
          }
          return newAttempts;
        });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
      // Xóa PIN sau khi submit (tăng bảo mật)
      setPin("");
    }
  };

  // Tự động submit khi đủ 6 ký tự
  useEffect(() => {
    if (pin.length === 6 && !loading && attemptsLeft > 0) {
      handleSubmit();
    }

  }, [pin]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn hành vi mặc định (nếu có form submit)

      // Chỉ submit nếu pin có ít nhất 1 ký tự (hoặc theo logic bạn muốn)
      if (pin.length === 6) {
        handleSubmit();
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
            alt='Hotel illustration'
            style={{ width: "592px", height: "557px", maxWidth: "100%" }}
          />
        </Grid>

        <Grid item xs={12} md={6} display='flex' justifyContent='end'>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography suppressHydrationWarning 
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}>
              <ArrowBackIosNewIcon
                onClick={() => setCurrentStep("register")}
                sx={{ cursor: "pointer" }}
              />
              {t("welcome_back_pin")}+84{normalizePhoneForAPI(phoneNumber)}
            </Typography>

            <Box component='form' onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}>
                <Typography suppressHydrationWarning  fontSize={14} color='#5D6679' fontWeight={500}>
                  {t("pin_login_description")}
                </Typography>
                <Typography suppressHydrationWarning 
                  onClick={() => setShowPin(!showPin)}
                  sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                  {showPin ? t("hide_pin") : t("show_pin")}
                </Typography>
              </Box>

              <MuiOtpInput
                value={pin}
                onChange={setPin}
                onKeyDown={handleKeyDown}
                length={6}
                validateChar={validateChar}
                TextFieldsProps={{ type: showPin ? "text" : "password" }}
                sx={{
                  gap: 1.5,
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
              {errorMessage && (
                <Alert severity='error' sx={{ mb: 2 }} icon={<ErrorOutline />}>
                  {errorMessage}
                  {attemptsLeft > 0 && (
                    <Typography suppressHydrationWarning  variant='body2' component='span' sx={{ ml: 1 }}>
                      Còn <strong>{attemptsLeft}</strong> lần thử
                    </Typography>
                  )}
                </Alert>
              )}

              {attemptsLeft <= 0 && (
                <Alert
                  severity='warning'
                  sx={{ mb: 3 }}
                  action={
                    <Button
                      color='inherit'
                      size='small'
                      onClick={() => navigate.push("/forgot-password")}>
                      {t("forgot_pin")}
                    </Button>
                  }>
                  Bạn đã hết số lần thử. Vui lòng khôi phục mã PIN.
                </Alert>
              )}
              <Typography suppressHydrationWarning 
                sx={{
                  mb: 4,
                  color: "#FF7A00",
                  fontSize: "14px",
                  fontWeight: 500,
                }}>
                <Link
                  href='/forgot-password'
                  sx={{ color: "#FF7A00", textDecoration: "underline" }}>
                  {t("forgot_pin")}
                </Link>
              </Typography>

              {/* <Button
                fullWidth
                disabled={pin.length !== 6 || loading}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor:
                    pin.length === 6 && !loading ? "#9AC700" : "#e0e0e0",
                  color: pin.length === 6 && !loading ? "#fff" : "#888",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": {
                    backgroundColor:
                      pin.length === 6 && !loading ? "#7cb400" : "#e0e0e0",
                  },
                }}>
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("authenticating")}
                  </>
                ) : (
                  t("continue")
                )}
              </Button> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ==================== GOOGLE CUSTOM BUTTON ====================
const GoogleCustomButton = ({ onSuccess, onError }: any) => {
  const  t  = useTranslations();
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
      <Image  src={google} alt='Google' style={{ width: 23 }} />
      {t("sign_up_with_google")}
    </Button>
  );
};
