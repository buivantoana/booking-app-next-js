"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  Modal,
  Stack,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LockOutlined,
  LinkOutlined,
  Google,
  Apple,
  Close,
  CheckCircle,
} from "@mui/icons-material";
import { MuiOtpInput } from "mui-one-time-password-input";
import { Login, userUpdate } from "../../service/admin";

import { toast } from "react-toastify";
import { getErrorMessage, validateChar } from "../../utils/utils";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import LanguageIcon from "@mui/icons-material/Language";
import Image from "next/image";

// Import images

import vnFlag from "../../images/vn.png";
import jaFlag from "../../images/ja.png";
import koFlag from "../../images/ko.png";
import enFlag from "../../images/en.png";
import { useBookingContext } from "@/lib/context";
import { usePathname } from "@/translation/navigation";

// Types
interface AccountSettingsPageProps {
  setActiveMenu: (menu: string) => void;
}

interface LanguageModalProps {
  open: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: vnFlag },
  { code: "en", label: "English", flag: enFlag },
  { code: "ko", label: "한국인", flag: koFlag },
  { code: "ja", label: "日本語", flag: jaFlag },
];

const AccountSettingsPage = ({ setActiveMenu }: AccountSettingsPageProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [state, setState] = useState("verify");
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Sử dụng next-intl
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  const [selectedLang, setSelectedLang] = useState(locale || "en");
  const [openLanguage, setOpenLanguage] = useState(false);
  const context = useBookingContext();

  // Cập nhật ngôn ngữ khi locale thay đổi
  useEffect(() => {
    setSelectedLang(locale || "en");
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (pin.length === 6) {
      let result = await Login({
        platform: "ios",
        type: "phone",
        value: context?.state?.user?.phone,
        password: pin,
      });
      if (result.access_token) {
        setPin("");
        setState("create");
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
      }
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (pin.length === 6 && pinConfirm === pin) {
      try {
        let result = await userUpdate({
          password: pin,
        });
        if (result.code === "OK") {
          toast.success(result.message);
          setState("verify");
          setPin("");
          setPinConfirm("");
          setOpenModal(false);
        } else {
          toast.error(getErrorMessage(result.code) || result.message);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    } else {
      setShowConfirm(true);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Tiêu đề */}
      <Typography
        suppressHydrationWarning
        variant="h5"
        fontWeight={600}
        color="#212529"
        mb={3}
        textAlign={isMobile ? "center" : "left"}
      >
        {t("account_settings_title")}
      </Typography>

      {/* Card chính */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <List disablePadding>
          {/* Đổi mã PIN */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setOpenModal(true)}
              sx={{ py: 2.5, px: 3 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LockOutlined sx={{ color: "#6c757d" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography suppressHydrationWarning fontWeight={600} color="#212529">
                    {t("change_pin_title")}
                  </Typography>
                }
                secondary={
                  <Typography suppressHydrationWarning variant="body2" color="#adb5bd" mt={0.5}>
                    {t("change_pin_description")}
                  </Typography>
                }
              />
              <Box sx={{ ml: 2 }}>
                <Typography suppressHydrationWarning color="#6c757d" fontSize="1.5rem">
                  ›
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>

          <Divider sx={{ mx: 3 }} />

          {/* Liên kết tài khoản */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setOpenLanguage(true)}
              sx={{ py: 3, px: 3 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LanguageIcon sx={{ color: "#6c757d" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography suppressHydrationWarning fontWeight={600} color="#212529">
                    {t("language")}
                  </Typography>
                }
              />
              <Box sx={{ ml: 2 }}>
                <Typography
                  suppressHydrationWarning
                  color="#6c757d"
                  fontSize="1.5rem"
                  display={"flex"}
                  alignItems={"center"}
                  gap={2}
                >
                  <Typography variant="span" suppressHydrationWarning fontSize="1rem">
                    {LANGUAGES.find((item) => item.code === selectedLang)?.label}
                  </Typography>{" "}
                  ›
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>

          {/* Google - Bỏ comment nếu cần */}
          {/* <ListItem disablePadding>
            <ListItemButton sx={{ py: 3, px: 3 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Image
                  src={googleIcon}
                  alt="Google"
                  width={24}
                  height={24}
                  style={{ objectFit: "contain" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography suppressHydrationWarning fontWeight={500} color="#212529">
                    Google
                  </Typography>
                }
              />
              <Typography
                suppressHydrationWarning
                color="rgba(93, 102, 121, 1)"
                sx={{ fontSize: "0.95rem", textDecoration: "underline" }}
              >
                Liên kết
              </Typography>
            </ListItemButton>
          </ListItem> */}

          {/* Apple - Bỏ comment nếu cần */}
          {/* <ListItem disablePadding>
            <ListItemButton sx={{ py: 3, px: 3 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Image
                  src={appleIcon}
                  alt="Apple"
                  width={24}
                  height={24}
                  style={{ objectFit: "contain" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography suppressHydrationWarning fontWeight={500} color="#212529">
                    Apple
                  </Typography>
                }
              />
              <Typography
                suppressHydrationWarning
                color="rgba(93, 102, 121, 1)"
                sx={{ fontSize: "0.95rem", textDecoration: "underline" }}
              >
                Liên kết
              </Typography>
            </ListItemButton>
          </ListItem> */}
        </List>
      </Box>

      {/* Modal đổi PIN */}
      <Dialog
        open={openModal}
        onClose={() => {
          setState("verify");
          setPin("");
          setPinConfirm("");
          setOpenModal(false);
        }}
        
        
       
      >
        <DialogContent sx={{ width: { xs: "95%", md: 480 },height:"290px"
               }}>

          {state === "verify" && (
            <Box
              className="hidden-add-voice"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "95%", sm: 500 },
                maxHeight: "90vh",
                bgcolor: "white",
                borderRadius: "16px",
                
                p: 4,
                overflow: "auto",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography suppressHydrationWarning fontWeight={700} fontSize="1.25rem" color="#333">
                  {t("verify_pin_modal_title")}
                </Typography>
                <IconButton
                  onClick={() => {
                    setState("verify");
                    setPin("");
                    setPinConfirm("");
                    setOpenModal(false);
                  }}
                >
                  <Close />
                </IconButton>
              </Stack>
              <Typography suppressHydrationWarning fontSize={"14px"} color="rgba(93, 102, 121, 1)">
                {t("verify_pin_modal_description")}
              </Typography>
              <Box
                sx={{
                  my: 3,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MuiOtpInput
                  value={pin}
                  onChange={setPin}
                  length={6}
                  validateChar={validateChar}
                  TextFieldsProps={{
                    type: "password",
                    inputProps: { maxLength: 1 },
                  }}
                  sx={{
                    gap: 1.5,
                    width: "100%",
                    justifyContent: "space-between",
                    "& .MuiOtpInput-TextField": {
                      "& .MuiOutlinedInput-root": {
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        "& fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                        "&:hover fieldset": {
                          borderColor: "#7cb400",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                      },
                      "& input": {
                        textAlign: "center",
                        fontSize: { xs: "20px", sm: "24px" },
                        fontWeight: 700,
                        color: "#9AC700",
                        "&::placeholder": {
                          color: "#9AC700",
                          opacity: 0.6,
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Button
                onClick={handleSubmit}
                fullWidth
                disabled={pin.length !== 6 || loading}
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
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("verifying_button")}
                  </>
                ) : (
                  t("verify_button")
                )}
              </Button>
            </Box>
          )}
          
          {state === "create" && (
            <Box
              className="hidden-add-voice"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "95%", sm: 500 },
                maxHeight: "90vh",
                bgcolor: "white",
                borderRadius: "16px",
                
                p: 4,
                overflow: "auto",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography suppressHydrationWarning fontWeight={700} fontSize="1.25rem" color="#333">
                  {t("create_pin_modal_title")}
                </Typography>
                <IconButton
                  onClick={() => {
                    setState("verify");
                    setPin("");
                    setPinConfirm("");
                    setOpenModal(false);
                  }}
                >
                  <Close />
                </IconButton>
              </Stack>
              <Typography suppressHydrationWarning fontSize={"14px"} color="rgba(93, 102, 121, 1)">
                {t("confirm_pin_modal_title")}
              </Typography>
              <Box
                sx={{
                  my: 3,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MuiOtpInput
                  value={pin}
                  onChange={setPin}
                  length={6}
                  validateChar={validateChar}
                  TextFieldsProps={{
                    type: "password",
                    inputProps: { maxLength: 1 },
                  }}
                  sx={{
                    gap: 1.5,
                    width: "100%",
                    justifyContent: "space-between",
                    "& .MuiOtpInput-TextField": {
                      "& .MuiOutlinedInput-root": {
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        "& fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                        "&:hover fieldset": {
                          borderColor: "#7cb400",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                      },
                      "& input": {
                        textAlign: "center",
                        fontSize: { xs: "20px", sm: "24px" },
                        fontWeight: 700,
                        color: "#9AC700",
                        "&::placeholder": {
                          color: "#9AC700",
                          opacity: 0.6,
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Button
                onClick={() => setState("confirm")}
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
                }}
              >
                {t("continue_button")}
              </Button>
            </Box>
          )}
          
          {state === "confirm" && (
            <Box
              className="hidden-add-voice"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "95%", sm: 500 },
                maxHeight: "90vh",
                bgcolor: "white",
                borderRadius: "16px",
                
                p: 4,
                overflow: "auto",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography suppressHydrationWarning fontWeight={700} fontSize="1.25rem" color="#333">
                  {t("confirm_pin_modal_title")}
                </Typography>
                <IconButton
                  onClick={() => {
                    setState("verify");
                    setPin("");
                    setPinConfirm("");
                    setOpenModal(false);
                  }}
                >
                  <Close />
                </IconButton>
              </Stack>
              <Typography suppressHydrationWarning fontSize={"14px"} color="rgba(93, 102, 121, 1)">
                {t("verify_pin_modal_description")}
              </Typography>
              <Box
                sx={{
                  my: 3,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MuiOtpInput
                  value={pinConfirm}
                  onChange={setPinConfirm}
                  length={6}
                  validateChar={validateChar}
                  TextFieldsProps={{
                    type: "password",
                    inputProps: { maxLength: 1 },
                  }}
                  sx={{
                    gap: 1.5,
                    width: "100%",
                    justifyContent: "space-between",
                    "& .MuiOtpInput-TextField": {
                      "& .MuiOutlinedInput-root": {
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        "& fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                        "&:hover fieldset": {
                          borderColor: "#7cb400",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#9AC700",
                          borderWidth: "1px",
                        },
                      },
                      "& input": {
                        textAlign: "center",
                        fontSize: { xs: "20px", sm: "24px" },
                        fontWeight: 700,
                        color: "#9AC700",
                        "&::placeholder": {
                          color: "#9AC700",
                          opacity: 0.6,
                        },
                      },
                    },
                  }}
                />
              </Box>

              {showConfirm && pinConfirm && pin !== pinConfirm && (
                <Typography
                  suppressHydrationWarning
                  sx={{
                    color: "#f44336",
                    fontSize: "14px",
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  {t("pin_mismatch_error")}
                </Typography>
              )}

              <Button
                onClick={handleChangePassword}
                fullWidth
                disabled={pin.length !== 6 || loading}
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
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("changing_button")}
                  </>
                ) : (
                  <>
                 { t("change_button")}
                  
                  </>
                )}
              </Button>
            </Box>
          )}
        </DialogContent>
        
      </Dialog>
      
      <LanguageModal
        open={openLanguage}
        onClose={() => {
          setTimeout(() => {
            setActiveMenu(t("account_settings_menu"));
          }, 100);
          setOpenLanguage(false);
        }}
      />
    </Box>
  );
};

export default AccountSettingsPage;

// Component LanguageModal riêng biệt
function LanguageModal({ open, onClose }: LanguageModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname()
  const [selectedLang, setSelectedLang] = useState(locale || "en");

  // Cập nhật ngôn ngữ khi locale thay đổi
  useEffect(() => {
    setSelectedLang(locale || "en");
  }, [locale, open]);

  const handleUpdate = () => {
    if (selectedLang === locale) {
      onClose();
      return;
    }
    
    // Xây dựng đường dẫn mới với locale mới
    const currentPath = pathname || "/";
    
    // Tách bỏ locale hiện tại khỏi pathname nếu có
    let newPath = currentPath;
    const localeRegex = /^\/[a-z]{2}(?=\/|$)/;
    const match = currentPath.match(localeRegex);
    
    if (match) {
      // Nếu có locale trong path, thay thế nó
      newPath = currentPath.replace(localeRegex, `/${selectedLang}`);
    } else {
      // Nếu không có locale trong path, thêm vào
      newPath = `/${selectedLang}${currentPath.startsWith("/") ? "" : "/"}${currentPath}`;
    }
    
    // Chuyển hướng đến URL với ngôn ngữ mới
    router.push(newPath);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {t("language")}
      </DialogTitle>

      <DialogContent sx={{ px: 1 }}>
        <List>
          {LANGUAGES.map((lang) => (
            <ListItemButton
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, display: "flex", alignItems: "center" }}>
                <Image
                  src={lang.flag}
                  alt={lang.label}
                  width={24}
                  height={24}
                  style={{ objectFit: "contain" }}
                />
              </ListItemIcon>

              <ListItemText primary={lang.label} />

              {selectedLang === lang.code && (
                <CheckCircle sx={{ color: "#9ACD32" }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleUpdate}
          sx={{
            borderRadius: 999,
            backgroundColor: "#9ACD32",
            textTransform: "none",
            fontWeight: 600,
            height: 44,
            "&:hover": {
              backgroundColor: "#8DBA2E",
            },
          }}
        >
          {t("search_bar_update_button", "Cập nhật")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}