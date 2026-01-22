// app/components/Header.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  Container,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Dehaze as DehazeIcon,
} from "@mui/icons-material";
import SearchBarWithDropdownHeader from "./SearchBarWithDropdownHeader";
import { useRouter } from "next/navigation";
import logo from "@/images/Frame 1321318033.png"; // điều chỉnh alias hoặc đường dẫn cho phù hợp
import { useTranslations } from "next-intl";
import { getLocation } from "@/service/hotel"; // giả sử bạn đã di chuyển service vào lib hoặc service/
import { useBookingContext } from "@/lib/context";
// điều chỉnh đường dẫn context

export default function Header() {
  const t = useTranslations(""); // giả sử namespace là "Header" trong file messages
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const router = useRouter();

  const context = useBookingContext();

  const [locationAddress, setLocationAddress] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  console.log("AAAAA pathname", pathname);

  const ref = useRef<HTMLDivElement>(null);

  // Scroll effect để hiện search bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= window.innerHeight * 1) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lấy location khi ở trang chủ / rooms / room detail
  useEffect(() => {
    const fetchLocation = async () => {
      if (
        pathname === "/" ||
        pathname === "/rooms" ||
        pathname.startsWith("/room")
      ) {
        try {
          const result = await getLocation();
          if (result?.locations) {
            setLocationAddress(result.locations);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      }
    };

    fetchLocation();
  }, [pathname]);

  const shouldShowSearch =
    (pathname === "/" ||
      pathname === "/rooms" ||
      pathname.startsWith("/room")) &&
    !isMobile;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Box
      bgcolor='white'
      sx={{
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
      p={0}>
      <Container maxWidth='lg'>
        <AppBar
          position='static'
          elevation={0}
          sx={{
            bgcolor: "white",
            py: 1,
            px: 0,
          }}>
          <Toolbar
            sx={{
              px: "0px !important",
              justifyContent: "space-between",
            }}>
            {/* LEFT: LOGO + TEXT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "end",
                gap: 2,
                width: isMobile ? "max-content" : "400px",
              }}>
              <Typography
                onClick={() => router.push("/")}
                variant='h5'
                fontWeight={700}
                color='#333'
                sx={{ fontSize: "1.5rem", cursor: "pointer" }}
                suppressHydrationWarning>
                <img src={logo.src} width={isMobile ? 150 : 200} alt='Logo' />
              </Typography>

              {!isMobile && (
                <Typography
                  variant='body2'
                  color='#666'
                  sx={{
                    fontSize: isMobile ? "0.775rem" : "0.875rem",
                    letterSpacing: "0.5px",
                    marginBottom: 0.3,
                  }}
                  suppressHydrationWarning>
                  {t("header_for_partners")}
                </Typography>
              )}
            </Box>

            {/* CENTER: SEARCH BAR */}
            {shouldShowSearch && (
              <Box
                ref={ref}
                sx={{
                  width: pathname === "/" ? "48%" : "70%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: visible || pathname !== "/" ? "auto" : "none",
                  opacity: visible || pathname !== "/" ? 1 : 0,
                  transform:
                    visible || pathname !== "/" ? "scale(1)" : "scale(0.8)",
                  transition: "all 0.6s ease-out",
                }}>
                <SearchBarWithDropdownHeader
                  locationAddress={locationAddress}
                />
              </Box>
            )}

            {/* RIGHT: USER / AUTH */}
            <Box>
              {Object.keys(context.state.user || {}).length > 0 ? (
                <UserDropdownMenuV2 context={context} />
              ) : (
                <>
                  {pathname === "/" ||
                  pathname === "/login" ||
                  pathname === "/register" ? (
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        onClick={() => router.push("/login")}
                        variant='outlined'
                        sx={{
                          border: "none",
                          color: "#5D6679",
                          borderRadius: "16px",
                          px: isMobile ? 1 : 3,
                          py: isMobile ? 1 : 1.2,
                          textTransform: "none",
                        }}>
                        {t("header_login")}
                      </Button>

                      <Button
                        onClick={() => router.push("/register")}
                        variant='contained'
                        sx={{
                          bgcolor: "#98b720",
                          color: "white",
                          borderRadius: "16px",
                          px: isMobile ? 1 : 3,
                          py: isMobile ? 1 : 1.2,
                          textTransform: "none",
                        }}>
                        {t("header_register")}
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <IconButton onClick={handleMenuOpen} size='small'>
                        <DehazeIcon sx={{ color: "rgba(93, 102, 121, 1)" }} />
                      </IconButton>

                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          sx: {
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                            mt: 1,
                            padding: 0,
                          },
                        }}>
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            router.push("/login");
                          }}>
                          <Typography
                            fontSize='14px'
                            color='rgba(93, 102, 121, 1)'
                            suppressHydrationWarning>
                            {t("header_login")}
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            router.push("/register");
                          }}>
                          <Typography
                            fontSize='14px'
                            color='rgba(93, 102, 121, 1)'
                            suppressHydrationWarning>
                            {t("header_register")}
                          </Typography>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Container>
    </Box>
  );
}

// app/components/UserDropdownMenuV2.tsx

import { ListItemIcon, ListItemText, Stack } from "@mui/material";
import {
  Logout as LogoutIcon,
  RoomPreferencesOutlined as BookingIcon,
} from "@mui/icons-material";
import { usePathname } from "@/translation/navigation";

interface UserDropdownMenuV2Props {
  context: any;
}

function UserDropdownMenuV2({ context }: UserDropdownMenuV2Props) {
  const t = useTranslations("");
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleClose();
  };

  const handleLogout = () => {
    // Xóa token & user
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    context.dispatch({
      type: "LOGOUT",
      payload: {
        ...context.state,
        user: {},
      },
    });

    handleClose();
    // Có thể redirect về trang chủ nếu muốn
    // router.push("/");
  };

  const user = context?.state?.user || {};

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          p: 0,
          borderRadius: "50%",
          width: 44,
          height: 44,
          bgcolor: "transparent",
          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
        }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#e8f5e8",
            border: "3px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
          <PersonIcon sx={{ color: "#98b720", fontSize: 26 }} />
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: "20px",
            width: 280,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            bgcolor: "white",
          },
        }}>
        {/* Header user info */}
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(152, 183, 32, 1)",
              }}>
              <PersonIcon sx={{ color: "white", fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                fontWeight={700}
                fontSize='16px'
                color='#333'
                suppressHydrationWarning>
                {user.name || "User"}
              </Typography>
              <Typography
                fontSize='14px'
                color='#666'
                mt={0.5}
                suppressHydrationWarning>
                {user.phone ? `+(84) ${user.phone.slice(3)}` : ""}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Menu items */}
        <Box sx={{ py: 1 }}>
          <MenuItem
            onClick={() => handleNavigate("/profile?type=profile")}
            sx={{
              py: 2,
              px: 3,
              "&:hover": { bgcolor: "#f8f8f8" },
            }}>
            <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
              <PersonIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>
              <Typography fontWeight={500} fontSize='15px'>
                {t("header_profile")}
              </Typography>
            </ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleNavigate("/profile?type=booking")}
            sx={{
              py: 2,
              px: 3,
              "&:hover": { bgcolor: "#f8f8f8" },
            }}>
            <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
              <BookingIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>
              <Typography fontWeight={500} fontSize='15px'>
                {t("header_my_bookings")}
              </Typography>
            </ListItemText>
          </MenuItem>

          <Divider sx={{ mx: 3, my: 1 }} />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 2,
              px: 3,
              color: "#e91e63",
              "&:hover": { bgcolor: "#ffebee" },
            }}>
            <ListItemIcon sx={{ minWidth: 40, color: "#e91e63" }}>
              <LogoutIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>
              <Typography fontWeight={500} fontSize='15px'>
                {t("header_logout")}
              </Typography>
            </ListItemText>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}
