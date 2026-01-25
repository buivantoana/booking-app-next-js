"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Button,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import Image from "next/image";
import vnFlag from "../images/vn.png";
import jaFlag from "../images/ja.png";
import koFlag from "../images/ko.png";
import enFlag from "../images/en.png";
import { useBookingContext } from "@/lib/context";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: vnFlag },
  { code: "en", label: "English", flag: enFlag },
  { code: "ko", label: "한국인", flag: koFlag },
  { code: "ja", label: "日本語", flag: jaFlag },
];

export default function LanguagePopover() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLang, setSelectedLang] = useState(locale || "en");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const context = useBookingContext();
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Cập nhật ngôn ngữ khi locale thay đổi
  useEffect(() => {
    setSelectedLang(locale || "en");
  }, [locale, open]);

  const handleUpdate = (locale) => {
    setSelectedLang(locale);

    // Xây dựng đường dẫn mới với locale mới
    const currentPath = pathname || "/";

    // Tách bỏ locale hiện tại khỏi pathname nếu có
    let newPath = currentPath;
    const localeRegex = /^\/[a-z]{2}(?=\/|$)/;
    const match = currentPath.match(localeRegex);

    if (match) {
      // Nếu có locale trong path, thay thế nó
      newPath = currentPath.replace(localeRegex, `/${locale}`);
    } else {
      // Nếu không có locale trong path, thêm vào
      newPath = `/${locale}${
        currentPath.startsWith("/") ? "" : "/"
      }${currentPath}`;
    }

    // Chuyển hướng đến URL với ngôn ngữ mới
    router.push(newPath);
    handleClose();
  };

  return (
    <>
      <ListItemButton
        onClick={handleOpen}
        sx={{
          borderRadius: 2,
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}>
        <ListItemIcon
          sx={{ minWidth: 30, display: "flex", alignItems: "center" }}>
          <Image
            src={LANGUAGES.find((item) => item.code == locale)?.flag}
            alt={LANGUAGES.find((item) => item.code == locale)?.label}
            width={24}
            height={24}
            style={{ objectFit: "contain" }}
          />
        </ListItemIcon>

        <ListItemText
          primaryTypographyProps={{
            sx: {
              fontSize: "13px",
              color: "black",
              width:
                Object.keys(context.state.user || {}).length > 0
                  ? "60px"
                  : "80px",
            },
          }}
          primary={LANGUAGES.find((item) => item.code == locale)?.label}
        />
      </ListItemButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}>
        <List>
          {LANGUAGES.map((lang) => (
            <ListItemButton
              key={lang.code}
              onClick={() => handleUpdate(lang.code)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                display: "flex",
                gap: 2,
              }}>
              <Box display={"flex"} sx={{ alignItems: "center" }}>
                <ListItemIcon
                  sx={{ minWidth: 40, display: "flex", alignItems: "center" }}>
                  <Image
                    src={lang.flag}
                    alt={lang.label}
                    width={24}
                    height={24}
                    style={{ objectFit: "contain" }}
                  />
                </ListItemIcon>

                <ListItemText primary={lang.label} />
              </Box>

              {selectedLang === lang.code && (
                <CheckCircle sx={{ color: "#9ACD32" }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}
