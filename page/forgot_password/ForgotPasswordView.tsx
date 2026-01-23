// app/forgot-password/ForgotPasswordView.tsx
// hoặc components/forgot-password/ForgotPasswordView.tsx tùy cấu trúc dự án

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
} from "@mui/material";

import { MuiOtpInput } from "mui-one-time-password-input";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import image_left from "@/images/Frame 1321317999.png";
import vnImg from "@/images/VN - Vietnam.png";
import googleImg from "@/images/Social media logo.png";
import appleImg from "@/images/Group.png";

import { sendOtp, userUpdate, verifyOtp } from "@/service/admin";
import { toast } from "react-toastify";

import { getErrorMessage, normalizePhoneForAPI, validateChar } from "@/utils/utils";
import { useBookingContext } from "@/lib/context";

// ──────────────────────────────────────────────────────────────
// 1. Registration Form Component
// ──────────────────────────────────────────────────────────────

interface RegistrationFormProps {
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  onNext: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  onNext,
}) => {
  const t = useTranslations();
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (phoneNumber) {
      try {
        const result = await sendOtp({
          platform: "ios",
          type: "phone",
          value: "+84" + normalizePhoneForAPI(phoneNumber),
        });
        if (result.success) {
          onNext();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const normalizePhone = (phone: string) => {
    if (!phone) return "";
    let p = phone.trim().replace(/\D/g, "");
    if (p.startsWith("84")) p = "0" + p.slice(2);
    if (!p.startsWith("0")) p = "0" + p;
    return p;
  };

  const isValidVietnamPhone = (phone: string) => {
    if (!phone) return false;
    const normalized = normalizePhone(phone);
    if (normalized.length !== 10 && normalized.length !== 11) return false;
    return /^0[35789]/.test(normalized);
  };

  const isDisabled = !phoneNumber || !isValidVietnamPhone(phoneNumber) || loading;

  return (
    <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        {/* LEFT */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image src={image_left} alt="Hotel illustration" width={592} height={557} style={{ maxWidth: "100%" }} />
        </Grid>

        {/* RIGHT */}
        <Grid item xs={12} display="flex" justifyContent="end" md={6}>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography sx={{ fontSize: { xs: "28px", md: "32px" }, fontWeight: 700, mb: 1 }}>
              {t("forgot_password_title")}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              {/* Phone */}
              <Typography fontSize={14} fontWeight={500} mb={0.5}>
                {t("phone_label")}
              </Typography>
              <TextField
                fullWidth
                placeholder={t("phone_placeholder")}
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 20) val = val.slice(0, 20);
                  if (val.startsWith("0")) val = val.slice(1);
                  setPhoneNumber(val);
                }}
                onBlur={() => setTouched(true)}
                error={touched && !isValidVietnamPhone(phoneNumber)}
                helperText={touched && !isValidVietnamPhone(phoneNumber) ? t("phone_invalid_error") : ""}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    height: "60px",
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&:hover fieldset": { borderColor: "#98b720" },
                    "&.Mui-focused fieldset": { borderColor: "#98b720", borderWidth: 1.5 },
                  },
                  "& input": { py: 1.5 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image
                        src={vnImg}
                        alt="vn"
                        width={28}
                        height={20}
                        style={{ borderRadius: 4, objectFit: "cover", marginRight: 8 }}
                      />
                      <Typography sx={{ fontSize: 14, marginRight: 1 }}>+84</Typography>
                    </InputAdornment>
                  ),
                  endAdornment:
                    touched && !isValidVietnamPhone(phoneNumber) ? (
                      <InputAdornment position="end">
                        <Box
                          sx={{ cursor: "pointer", fontSize: 22, color: "#999" }}
                          onClick={() => {
                            setPhoneNumber("");
                            setTouched(false);
                          }}
                        >
                          ✕
                        </Box>
                      </InputAdornment>
                    ) : null,
                }}
              />

              <Typography sx={{ fontSize: "14px", mb: 3 }} color="text.secondary">
                {t("terms_text")}
                <Link href="#" sx={{ color: "#9AC700", fontWeight: 500, textDecoration: "underline" }}>
                  {t("terms_link")}
                </Link>{" "}
                {t("terms_of")}
              </Typography>

              <Button
                type="submit"
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
                  "&:hover": { backgroundColor: isDisabled ? "#e0e0e0" : "#98b720" },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("sending_otp")}
                  </>
                ) : (
                  t("continue_button")
                )}
              </Button>

              {/* Social buttons & login link giữ nguyên... */}
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
  setOtp: (v: string) => void;
  timer: number;
  isResendEnabled: boolean;
  onResend: () => void;
  onSuccess: (user: any) => void;
  onBack: () => void;
  name: string;
  birthDate: string;
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
}) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // useEffect(() => {
  //   if (timer > 0) {
  //     const id = setTimeout(() => setTimer(timer - 1), 1000);
  //     return () => clearTimeout(id);
  //   } else if (timer === 0) {
  //     setIsResendEnabled(true);
  //   }
  // }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (otp.length === 4) {
      try {
        const result = await verifyOtp({
          platform: "ios",
          type: "phone",
          value: "+84" + normalizePhoneForAPI(phoneNumber),
          otp: otp,
          location: "hanoi",
        });
        if (result.access_token) {
          onSuccess(result);
        } else {
          setOtp("");
          toast.error(getErrorMessage(result.code) || result.message);
          setOtpKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}
        >
          <Image src={image_left} alt="illustration" width={592} height={557} style={{ maxWidth: "100%" }} />
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="end" md={6}>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <ArrowBackIosNewIcon onClick={onBack} sx={{ cursor: "pointer" }} />
              {t("enter_otp_title")}
            </Typography>

            <Typography sx={{ fontSize: "16px", mb: 4, color: "text.secondary" }}>
              {t("otp_sent_to")}<b>+84{normalizePhoneForAPI(phoneNumber)}</b>
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
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
                onClick={isResendEnabled ? onResend : undefined}
                sx={{
                  fontSize: "14px",
                  mb: 3,
                  color: isResendEnabled ? "#9AC700" : "#999",
                  textDecoration: isResendEnabled ? "underline" : "none",
                  cursor: isResendEnabled ? "pointer" : "default",
                  textAlign: "start",
                }}
              >
                {isResendEnabled ? t("resend_otp_link") : `${t("resend_otp_timer")} (${formatTime(timer)})`}
              </Typography>

              <Button
                type="submit"
                fullWidth
                disabled={otp.length !== 4 || loading}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor: otp.length === 4 && !loading ? "#9AC700" : "#e0e0e0",
                  color: otp.length === 4 && !loading ? "#fff" : "#888",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": { backgroundColor: otp.length === 4 && !loading ? "#7cb400" : "#e0e0e0" },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("verifying_otp")}
                  </>
                ) : (
                  t("verify_otp_button")
                )}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 3. Pin Creation Component
// ──────────────────────────────────────────────────────────────

interface PinCreationProps {
  onNext: () => void;
  onBack?: () => void;
  pin: string;
  setPin: (v: string) => void;
}

const PinCreation: React.FC<PinCreationProps> = ({ onNext, onBack, pin, setPin }) => {
  const t = useTranslations();
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      onNext();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}
        >
          <Image src={image_left} alt="illustration" width={592} height={557} style={{ maxWidth: "100%" }} />
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="end" md={6}>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {onBack && <ArrowBackIosNewIcon onClick={onBack} sx={{ cursor: "pointer" }} />}
              {t("create_pin_title")}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography fontSize={14} color="#5D6679" fontWeight={500}>
                {t("confirm_pin_title")}
              </Typography>
              <Typography onClick={() => setShowPin(!showPin)} sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                {showPin ? t("hide_pin") : t("show_pin")}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <MuiOtpInput
                value={pin}
                onChange={setPin}
                validateChar={validateChar}
                length={6}
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

              <Button
                type="submit"
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
                  "&:hover": { backgroundColor: pin.length === 6 ? "#7cb400" : "#e0e0e0" },
                }}
              >
                {t("continue_button")}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 4. Pin Creation Confirm
// ──────────────────────────────────────────────────────────────

interface PinCreationConfirmProps {
  onSuccess: () => void;
  onBack: () => void;
  pinConfirm: string;
  dataUser: any;
}

const PinCreationConfirm: React.FC<PinCreationConfirmProps> = ({ onSuccess, onBack, pinConfirm, dataUser }) => {
  const t = useTranslations();
  const router = useRouter();
  const context = useBookingContext();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (pin.length === 6 && pin === pinConfirm) {
      try {
        const result = await userUpdate({ password: pin }, dataUser?.access_token);
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      setShowMismatch(true);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", py: 8 }}>
      <Grid container sx={{ alignItems: "center", minHeight: "60vh" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}
        >
          <Image src={image_left} alt="illustration" width={592} height={557} style={{ maxWidth: "100%" }} />
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="end" md={6}>
          <Box sx={{ width: { xs: "100%", sm: "400px", md: "486px" } }}>
            <Typography
              sx={{
                fontSize: { xs: "26px", md: "30px" },
                fontWeight: 700,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <ArrowBackIosNewIcon onClick={onBack} sx={{ cursor: "pointer" }} />
              {t("confirm_pin_title")}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography fontSize={14} color="#5D6679" fontWeight={500}>
                {t("pin_usage_note")}
              </Typography>
              <Typography onClick={() => setShowPin(!showPin)} sx={{ cursor: "pointer", fontSize: 14, color: "#5D6679" }}>
                {showPin ? t("hide_pin") : t("show_pin")}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
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

              {showMismatch && pinConfirm && pin !== pinConfirm && (
                <Typography sx={{ color: "#f44336", fontSize: "14px", mb: 2, fontWeight: 500 }}>
                  {t("pin_mismatch_error")}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={pin.length !== 6 || loading}
                sx={{
                  py: 1.6,
                  borderRadius: "30px",
                  backgroundColor: pin.length === 6 && !loading ? "#9AC700" : "#e0e0e0",
                  color: pin.length === 6 && !loading ? "#fff" : "#888",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  height: "56px",
                  "&:hover": { backgroundColor: pin.length === 6 && !loading ? "#7cb400" : "#e0e0e0" },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("completing")}
                  </>
                ) : (
                  t("complete_button")
                )}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// ──────────────────────────────────────────────────────────────
// 5. Main ForgotPasswordView
// ──────────────────────────────────────────────────────────────

export default function ForgotPasswordView() {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<"register" | "otp" | "pin" | "cofirm_pin">("register");
  const [pin, setPin] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("1989-10-21");
  const [otp, setOtp] = useState("");
  const [dataUser, setDataUser] = useState(null);
  const [timer, setTimer] = useState(55);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  const goToOtp = () => {
    setCurrentStep("otp");
    setTimer(55);
    setIsResendEnabled(false);
  };

  const goToPin = (user) => {
    setDataUser(user);
    setCurrentStep("pin");
  };

  const goToConfirmPin = () => {
    setCurrentStep("cofirm_pin");
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
        <RegistrationForm phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} onNext={goToOtp} />
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
        />
      )}

      {currentStep === "pin" && (
        <PinCreation onNext={goToConfirmPin} onBack={() => setCurrentStep("otp")} pin={pin} setPin={setPin} />
      )}

      {currentStep === "cofirm_pin" && (
        <PinCreationConfirm onSuccess={() => router.push("/?from=forgot-password&msg=success")} onBack={() => setCurrentStep("pin")} pinConfirm={pin} dataUser={dataUser} />
      )}
    </>
  );
}