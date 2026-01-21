import { useTheme } from "@emotion/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import {
  Box,
  CssBaseline,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import React, { useEffect, useState } from "react";
import { Collapse } from "@mui/material";
import {
  RiImageEditFill,
  RiHome6Line,
  RiTeamLine,
  RiBuildingLine,
  RiProductHuntFill,
  RiHotelLine,
  RiNewspaperLine,
  RiListUnordered,
} from "react-icons/ri";
import {
  RiArticleLine,
  RiBankCardFill,
  RiBardLine,
  RiContactsLine,
  RiFileListFill,
  RiGitBranchFill,
  RiLineChartFill,
  RiLogoutCircleRLine,
  RiMessage3Fill,
  RiOrganizationChart,
  RiPencilFill,
  RiPriceTag3Line,
  RiShuffleFill,
  RiSlideshow4Fill,
  RiTeamFill,
  RiUserAddFill,
  RiBriefcase2Line,
  RiUser3Fill,
  RiSecurePaymentFill,
} from "react-icons/ri";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../../App.css";
import profile from "../../images/facebook-cap-nhat-avatar-doi-voi-tai-khoan-khong-su-dung-anh-dai-dien-e4abd14d.jpg";
import logo from "../../images/dabeb7fcebd00c596297e51a1cf6134d57e64622-removebg-preview.png";

const drawerWidth = 300;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,

  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "end",
  gap: "20px",
}));

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: "#7ef2c2",
    color: "#0d8f50",
    "&:hover": {
      backgroundColor: "#a5f2d2",
    },
  },
}));

const LayoutAdmin = () => {
  const theme: any = useTheme();
  const [open, setOpen] = React.useState(true);
  const [active, setActive] = React.useState({
    post: true,
    image: false,
    category: false,
    product: false,
    company: false,
    mail: false,
  });
  const [openImageMenu, setOpenImageMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const activeTab = params.get("tab");
  useEffect(() => {
    if (location.pathname && location.pathname == "/admin/post") {
      setActive({
        image: false,
        category: false,
        post: true,
        product: false,
        company: false,
        mail: false,
      });
    }
    if (location.pathname && location.pathname == "/admin/category") {
      setActive({
        image: false,
        category: true,
        post: false,
        product: false,
        company: false,
        mail: false,
      });
    }
    if (location.pathname && location.pathname == "/admin/product") {
      setActive({
        image: false,
        category: false,
        post: false,
        product: true,
        company: false,
        mail: false,
      });
    }
    if (location.pathname && location.pathname == "/admin/company") {
      setActive({
        image: false,
        category: false,
        post: false,
        product: false,
        company: true,
        mail: false,
      });
    }
    if (location.pathname && location.pathname == "/admin/mail-config") {
      setActive({
        image: false,
        category: false,
        post: false,
        product: false,
        company: false,
        mail: true,
      });
    }
    if (
      (location.pathname && location.pathname == "/admin/home-image") ||
      (location.pathname && location.pathname == "/admin/recruitment-image") ||
      (location.pathname && location.pathname == "/admin/cooperate-image")
    ) {
      setActive({
        image: true,
        category: false,
        post: false,
        product: false,
        company: false,
      });
    }
  }, [location.pathname, location.search]);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [opened, setOpenEnd] = React.useState(false);

  const handleClickOpen = () => {
    setOpenEnd(true);
  };
  const handleClose = () => {
    setOpenEnd(false);
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openned = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosed = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/login");
    }, 200);
  };
  return (
    <div>
      <Box
        sx={{
          display: "flex",
          background: "white",
          ".css-123k39-MuiPaper-root-MuiAppBar-root": {
            zIndex: 8,
          },
          zIndex: 8,
        }}>
        <CssBaseline />
        <AppBar
          position='fixed'
          open={open}
          sx={{ background: "#262b40", color: "black", padding: 0, zIndex: 9 }}>
          <Toolbar
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <div style={{ display: "flex" }}>
              <IconButton
                color='inherit'
                aria-label='open drawer'
                onClick={handleDrawerOpen}
                edge='start'
                sx={{ mr: 2, ...(open && { display: "none" }) }}>
                <ChevronLeftIcon sx={{ color: "white", fontSize: "30px" }} />
              </IconButton>
            </div>

            <Box>
              <IconButton onClick={handleClick}>
                <img
                  src={profile}
                  width={34}
                  height={34}
                  style={{ borderRadius: "50%" }}
                  alt=''
                />
              </IconButton>
            </Box>
            <Menu
              id='basic-menu'
              anchorEl={anchorEl}
              open={openned}
              onClose={handleClosed}
              sx={{ padding: "5px" }}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}>
              <Typography suppressHydrationWarning 
                onClick={handleLogout}
                fontSize={"14px"}
                color={"#333"}
                sx={{ display: "flex", cursor: "pointer" }}
                alignItems={"center"}
                gap={"8px"}
                p={"5px"}>
                <RiLogoutCircleRLine size={20} /> Đăng xuất
              </Typography>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            ".css-12i7wg6-MuiPaper-root-MuiDrawer-paper": {
              zIndex: 9,
              background: "#262b40",
            },
            zIndex: 8,
          }}>
          <Drawer
            sx={{
              width: drawerWidth,

              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                background: "#262b40",
              },
              ".css-12i7wg6-MuiPaper-root-MuiDrawer-paper": {
                background: "#262b40",
              },
              padding: "10px",
              background: "#262b40",
            }}
            variant='persistent'
            anchor='left'
            open={open}>
            <DrawerHeader>
              <img
                src={logo}
                width={80}
                height={80}
                style={{ objectFit: "contain", borderRadius: "8px",marginRight:"30px" }}
                alt=''
              />
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "ltr" ? (
                  <ChevronLeftIcon sx={{ color: "white", fontSize: "30px" }} />
                ) : (
                  <ChevronRightIcon sx={{ color: "white", fontSize: "30px" }} />
                )}
              </IconButton>
            </DrawerHeader>

            <Box className='see-more-admin' mt={4} sx={{ color: "white" }}>
              <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.post ? "#2e3650" : undefined,
                    border: active.post ? "1px solid #4c5680" : "none",
                    borderRadius: active.post ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/post"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiNewspaperLine color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Bài viết"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
              <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.category ? "#2e3650" : undefined,
                    border: active.category ? "1px solid #4c5680" : "none",
                    borderRadius: active.category ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/category"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiListUnordered color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Danh mục"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
              <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.product ? "#2e3650" : undefined,
                    border: active.product ? "1px solid #4c5680" : "none",
                    borderRadius: active.product ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/product"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiProductHuntFill color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Sản phẩm"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
              <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.company ? "#2e3650" : undefined,
                    border: active.company ? "1px solid #4c5680" : "none",
                    borderRadius: active.company ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/company"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiHotelLine color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Công ty"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
              {/* <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.image ? "#2e3650" : undefined,
                    border: active.image ? "1px solid #4c5680" : "none",
                    borderRadius: active.image ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/user"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiSecureimageFill color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Người dùng"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider /> */}
              <List sx={{ px: "10px" }}>
                <ListItem
                  onClick={() => setOpenImageMenu(!openImageMenu)}
                  sx={{
                    color: "white",
                    cursor: "pointer",
                    background: active.image ? "#2e3650" : undefined,
                    border: active.image ? "1px solid #4c5680" : "none",
                    borderRadius: active.image ? "5px" : "none",
                  }}
                  disablePadding>
                  <CustomListItemButton>
                    <ListItemIcon
                      sx={{ display: "flex", justifyContent: "center" }}>
                      <RiImageEditFill color={"white"} />
                    </ListItemIcon>
                    <ListItemText primary={"Quản lý nội dung"} />
                  </CustomListItemButton>
                </ListItem>

                <Collapse in={openImageMenu} timeout='auto' unmountOnExit>
                  <List component='div' disablePadding>
                    <ListItem disablePadding>
                      <Link
                        to='/admin/home-image'
                        style={{ width: "100%", textDecoration: "none" }}>
                        <CustomListItemButton sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <RiHome6Line color='white' />
                          </ListItemIcon>
                          <ListItemText primary='Trang chủ' />
                        </CustomListItemButton>
                      </Link>
                    </ListItem>

                    <ListItem disablePadding>
                      <Link
                        to='/admin/recruitment-image'
                        style={{ width: "100%", textDecoration: "none" }}>
                        <CustomListItemButton sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <RiTeamLine color='white' />
                          </ListItemIcon>
                          <ListItemText primary='Tuyển dụng' />
                        </CustomListItemButton>
                      </Link>
                    </ListItem>

                    <ListItem disablePadding>
                      <Link
                        to='/admin/cooperate-image'
                        style={{ width: "100%", textDecoration: "none" }}>
                        <CustomListItemButton sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <RiBuildingLine color='white' />
                          </ListItemIcon>
                          <ListItemText primary='Hợp tác' />
                        </CustomListItemButton>
                      </Link>
                    </ListItem>

                    <ListItem disablePadding>
                      <Link
                        to='/admin/product-image'
                        style={{ width: "100%", textDecoration: "none" }}>
                        <CustomListItemButton sx={{ pl: 4 }}>
                          <ListItemIcon>
                            <RiProductHuntFill color='white' />
                          </ListItemIcon>
                          <ListItemText primary='Sản phẩm' />
                        </CustomListItemButton>
                      </Link>
                    </ListItem>
                  </List>
                </Collapse>
              </List>

              <Divider />
              <Divider />
              <List sx={{ px: "10px" }}>
                <ListItem
                  sx={{
                    a: {
                      color: "white",
                      width: "100%",
                      textDecoration: "none",
                    },
                    background: active.mail ? "#2e3650" : undefined,
                    border: active.mail ? "1px solid #4c5680" : "none",
                    borderRadius: active.mail ? "5px" : "none",
                  }}
                  disablePadding>
                  <Link to={"/admin/mail-config"}>
                    <CustomListItemButton>
                      <ListItemIcon
                        sx={{ display: "flex", justifyContent: "center" }}>
                        <RiHotelLine color={"white"} />
                      </ListItemIcon>
                      <ListItemText primary={"Cài đặt Mail"} />
                    </CustomListItemButton>
                  </Link>
                </ListItem>
              </List>
              <Divider />
            </Box>
          </Drawer>
        </Box>
        <Main sx={{ minHeight: "100vh", pt: 3 }} open={open}>
          <DrawerHeader />
          <Box>
            <Outlet />
          </Box>
        </Main>
      </Box>
    </div>
  );
};

export default LayoutAdmin;
