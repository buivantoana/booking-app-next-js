import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Image from "next/image";
import { userUpdate } from "../../service/admin";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/utils";
import { useTranslations } from "next-intl";
import Flag from "react-country-flag";
// Props interface
interface AccountProps {
  context: any;
}

const Account = ({ context }: AccountProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [touchedDate, setTouchedDate] = useState(false);
  const [touchedName, setTouchedName] = useState(false);
  
  // Sử dụng next-intl
  const t = useTranslations();
  
  // Lấy dữ liệu ban đầu từ context
  const initialData = {
    name: context?.state?.user?.name || "",
    birthday: context?.state?.user?.birthday || "",
    email: context?.state?.user?.email || "",
  };

  // State để chỉnh sửa
  const [formData, setFormData] = useState(initialData);

  // Khi context thay đổi → cập nhật lại form (nếu cần reload từ server)
  useEffect(() => {
    setFormData({
      name: context?.state?.user?.name || "",
      birthday: context?.state?.user?.birthday || "",
      email: context?.state?.user?.email || "",
    });
  }, [context?.state?.user]);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let result = await userUpdate(formData);
      if (result.code == "OK") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...formData,
          })
        );
        context.dispatch({
          type: "UPDATE_USER",
          payload: {
            ...context.state,
            user: { ...context.state.user, ...formData },
          },
        });
        toast.success(result.message);
      } else {
        toast.error(getErrorMessage(result.code) || result.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Cập nhật thất bại!");
    }
    setLoading(false);
  };

  const isValidBirthDate = (dateStr: string) => {
    if (!dateStr) return false; // bắt buộc nhập
    const today = new Date();
    const birthDate = new Date(dateStr);
    const ageDifMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
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

  return (
    <Box sx={{ backgroundColor: "#f8f9fa" }}>
      <Typography
        suppressHydrationWarning
        variant="h5"
        fontWeight={600}
        color="#212529"
        mb={3}
        textAlign={isMobile ? "center" : "left"}
      >
        {t("my_profile_title")}
      </Typography>

      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Grid container spacing={3}>
          {/* Số điện thoại - KHÔNG CHO SỬA */}
          <Grid item xs={12} sm={6}>
            <Typography suppressHydrationWarning variant="body2" color="#6c757d" mb={1}>
              {t("phone_label")}
            </Typography>
            <TextField
              fullWidth
              value={context?.state?.user?.phone || ""}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {/* Thay thế react-country-flag bằng Image component */}
                     <Flag
                        countryCode='VN'
                        svg
                        style={{ width: 24, height: 24 }}
                      />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#212529",
                  fontWeight: 500,
                  borderRadius: "16px",
                  height: "50px",
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#212529",
                  fontWeight: 500,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#dee2e6",
                },
              }}
            />
          </Grid>

          {/* Ngày sinh - CHO SỬA */}
          <Grid item xs={12} sm={6}>
            <Typography suppressHydrationWarning variant="body2" color="#6c757d" mb={1}>
              {t("birthday_label")}
            </Typography>
            <TextField
              fullWidth
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              onBlur={() => setTouchedDate(true)}
              error={touchedDate && !isValidBirthDate(formData.birthday)}
              helperText={
                touchedDate && !isValidBirthDate(formData.birthday)
                  ? t("birthday_error_required_or_under_18")
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  height: "50px",
                  backgroundColor: "#fff",
                  "&.Mui-focused fieldset": {
                    borderColor: "#98b720",
                    borderWidth: 1.5,
                  },
                },
              }}
            />
          </Grid>

          {/* Tên - CHO SỬA */}
          <Grid item xs={12} sm={6}>
            <Typography suppressHydrationWarning variant="body2" color="#6c757d" mb={1}>
              {t("name_label")}
            </Typography>
            <TextField
              name="name"
              fullWidth
              placeholder={t("name_placeholder")}
              value={formData.name}
              onChange={handleChange}
              onBlur={() => setTouchedName(true)}
              error={touchedName && !isValidName(formData.name)}
              helperText={
                touchedName && !isValidName(formData.name)
                  ? t("name_error_invalid")
                  : ""
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  height: "50px",
                  backgroundColor: "#fff",
                  "&.Mui-focused fieldset": {
                    borderColor: "#98b720",
                    borderWidth: 1.5,
                  },
                },
              }}
            />
          </Grid>

          {/* Email - CHO SỬA */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "start",
              }}
            >
              <Button
                variant="contained"
                size="large"
                disabled={loading}
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "rgba(152, 183, 32, 1)",
                  borderRadius: "16px",
                  px: 6,
                  height: "50px",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(160, 212, 104, 0.4)",
                  mt: 3.5,
                  "&:hover": {
                    backgroundColor: "rgba(152, 183, 32, 1)",
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />
                    {t("update_button")}
                  </>
                ) : (
                  t("update_button")
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Account;