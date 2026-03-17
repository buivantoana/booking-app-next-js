"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Email,
  Info,
  Gavel,
  PrivacyTip,
  Payment,
  Fingerprint,
  Wifi,
  DeviceHub,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `policy-tab-${index}`,
    "aria-controls": `policy-tabpanel-${index}`,
  };
}

export default function PolicyController() {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const t = useTranslations("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const primaryColor = "rgba(152, 183, 32, 1)";
  const hoverColor = "rgba(152, 183, 32, 0.8)";
  const rippleColor = "rgba(152, 183, 32, 0.2)";
  return (
    <Container maxWidth='lg' sx={{ py: 4, minHeight: "60vh" }}>
      {/* Header */}
      <Typography
        variant='h3'
        component='h1'
        fontWeight='bold'
        gutterBottom
        sx={{
          fontSize: { xs: "1.75rem", sm: "2.5rem", md: "2.5rem" },
          textAlign: "center",
          mb: 2,
        }}>
        {t("about_title")}
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: primaryColor,
              height: 3,
            },
            "& .MuiTab-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
              fontWeight: 600,
              textTransform: "none",
              py: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                color: hoverColor,
                backgroundColor: rippleColor,
              },
            },
            "& .Mui-selected": {
              color: `${primaryColor} !important`,
              fontWeight: 700,
            },
            "& .MuiTab-root.Mui-selected": {
              color: primaryColor,
            },
          }}>
          <Tab
            label={t("tabs_about")}
            {...a11yProps(0)}
            icon={<Info />}
            iconPosition='start'
            sx={{
              "&.Mui-selected": {
                color: primaryColor,
              },
            }}
          />
          <Tab
            label={t("tabs_terms")}
            {...a11yProps(1)}
            icon={<Gavel />}
            iconPosition='start'
            sx={{
              "&.Mui-selected": {
                color: primaryColor,
              },
            }}
          />
          <Tab
            label={t("tabs_privacy")}
            {...a11yProps(2)}
            icon={<PrivacyTip />}
            iconPosition='start'
            sx={{
              "&.Mui-selected": {
                color: primaryColor,
              },
            }}
          />
          <Tab
            label={t("tabs_payment")}
            {...a11yProps(3)}
            icon={<Payment />}
            iconPosition='start'
            sx={{
              "&.Mui-selected": {
                color: primaryColor,
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Tab 1: Về chúng tôi */}
      <TabPanel value={tabValue} index={0}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default" }}>
          <Box mb={4}>
            <Typography
              variant='h5'
              fontWeight='bold'
              gutterBottom
              color='rgba(152, 183, 32, 1)'>
              {t("company_name")}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOn color='action' sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Trụ sở chính:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t("office_hcmAddress")}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOn color='action' sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Văn phòng Hà Nội:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {t("office_hanoiAddress")}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone color='action' />
                <Typography variant='body2'>
                  <strong>{t("contact_hotline")}:</strong> {t("contact_phone")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email color='action' />
                <Typography variant='body2'>
                  <strong>{t("contact_customerSupport")}:</strong>{" "}
                  {t("contact_email")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email color='action' />
                <Typography variant='body2'>
                  <strong>{t("contact_business")}:</strong>{" "}
                  {t("contact_businessEmail")}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography
              variant='h6'
              fontWeight='bold'
              gutterBottom
              color='rgba(152, 183, 32, 1)'>
              {t("legal_title")}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant='body2' paragraph color='text.secondary'>
              <strong>{t("legal_companyName")}</strong>
            </Typography>
            <Typography variant='body2' paragraph color='text.secondary'>
              {t("legal_address")}
            </Typography>
            <Typography variant='body2' paragraph color='text.secondary'>
              {t("legal_representative")}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t("legal_taxCode")}
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 2: Thỏa thuận dịch vụ */}
      <TabPanel value={tabValue} index={1}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default" }}>
          <Box sx={{ bgcolor: "#fff3e0", p: 2, borderRadius: 2, mb: 3 }}>
            <Typography
              variant='body2'
              color='#ed6c02'
              fontWeight='bold'
              align='center'>
              {t("terms_warning")}
            </Typography>
          </Box>

          <Typography
            variant='h6'
            fontWeight='bold'
            gutterBottom
            sx={{ mt: 3 }}>
            {t("terms_title")}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section1_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section1_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section2_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section2_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section3_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section3_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section4_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section4_content")}
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Fingerprint fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={t("terms_access_identity")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={t("terms_access_location")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Wifi fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={t("terms_access_wifi")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DeviceHub fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={t("terms_access_device")} />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section5_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section5_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section6_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section6_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("terms_section7_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("terms_section7_content")}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mt: 2, fontStyle: "italic" }}>
              {t("terms_member_note")}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              component='div'
              sx={{ mt: 1 }}>
              {t("terms_member_1")}
              <br />
              {t("terms_member_2")}
              <br />
              {t("terms_member_3")}
              <br />
              {t("terms_member_4")}
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 3: Chính sách bảo mật */}
      <TabPanel value={tabValue} index={2}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default" }}>
          <Typography
            variant='body1'
            paragraph
            color='text.secondary'
            sx={{ mb: 3 }}>
            {t("privacy_intro")}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section1_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section1_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section2_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section2_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section3_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section3_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section4_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section4_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section5_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section5_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("privacy_section6_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("privacy_section6_content")}
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 4: Chính sách thanh toán */}
      <TabPanel value={tabValue} index={3}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, sm: 4 }, bgcolor: "background.default" }}>
          <Typography
            variant='body1'
            paragraph
            color='text.secondary'
            sx={{ mb: 3 }}>
            {t("payment_intro")}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section1_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section1_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section2_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section2_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section3_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section3_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section4_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section4_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section5_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section5_content")}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
              {t("payment_section6_title")}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              {t("payment_section6_content")}
            </Typography>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
}
