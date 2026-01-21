// src/components/FirstTimeExplore.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocationOn, ArrowForwardIos } from '@mui/icons-material';
import { useRouter } from 'next/navigation'; // ← Thay thế navigate
import { useTranslation } from 'react-i18next';
import { useBookingContext } from '@/lib/context'; // context đã migrate
import qr from '../../images/image 5.png';
import left from '../../images/Frame 1321317998.png';
import LocationModal from './LocationModal'; // import modal bên dưới
import Image from 'next/image';
import { useTranslations } from 'next-intl';


// === NGƯỜI ĐANG CẦM ĐIỆN THOẠI ===
const PhonePerson = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="35" r="15" fill="#4caf50" />
    <path
      d="M35 50 Q50 60 65 50 L65 80 Q65 90 50 90 Q35 90 35 80 Z"
      fill="#81c784"
    />
    <rect x="42" y="55" width="16" height="25" rx="2" fill="#fff" />
    <circle cx="50" cy="65" r="3" fill="#4caf50" />
    <text x="50" y="30" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">
      !
    </text>
  </svg>
);

interface FirstTimeExploreProps {
  location: any[]; // array các location
  setAddress: (loc: any) => void;
  address: any;
}

const FirstTimeExplore = ({ location, setAddress, address }: FirstTimeExploreProps) => {
  const theme = useTheme();
  const  t  = useTranslations();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter(); // ← Dùng để navigate
  const { state } = useBookingContext();

  const [openLocation, setOpenLocation] = useState(() => {
    // Chỉ đọc localStorage nếu đang ở client
    if (typeof window !== 'undefined') {
      return localStorage.getItem('location') ? false : true;
    }
    return true; // mặc định mở modal nếu chưa biết
  });

  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <LocationModal
        open={openLocation}
        onClose={() => setOpenLocation(false)}
        location={location}
        address={address}
        onSelect={(loc) => {
          setAddress(loc);
        }}
      />

      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Tiêu đề + Khu vực */}
        <Stack
          direction={{ xs: 'row', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'center' }}
          spacing={2}
          mb={4}
        >
          <Typography suppressHydrationWarning 
            variant="h4"
            fontWeight="bold"
            color="#333"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.875rem' },
            }}
          >
            {!state?.user?.id ? t('first_time_explore') : ''}
          </Typography>

          <Chip
            onClick={() => setOpenLocation(true)}
            icon={<LocationOn sx={{ fontSize: 18, color: 'rgba(152, 183, 32, 1) !important' }} />}
            label={
              location &&
              t('area') +
                ' ' +
                location.find((item) => item.id == localStorage.getItem('location'))?.name.vi
            }
            suppressHydrationWarning
            clickable
            deleteIcon={<ArrowForwardIos sx={{ fontSize: '14px !important' }} />}
            onDelete={() => {}}
            sx={{
              bgcolor: 'white',
              color: 'rgba(152, 183, 32, 1)',
              fontWeight: 600,
              fontSize: isMobile ? '.6rem' : '0.9rem',
              '& .MuiChip-deleteIcon': {
                color: 'rgba(152, 183, 32, 1)',
                ml: 0.5,
              },
              '&:hover': { bgcolor: '#f1f8e9' },
            }}
          />
        </Stack>

        {!state?.user?.id && (
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            {/* Card 1: Thành viên mới */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: 'rgba(236, 240, 218, 1)',
                  borderRadius: '24px',
                  p: { xs: 3, md: 4 },
                  height: isMobile ? '80%' : '90%',
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(76, 175, 80, 0.15)',
                  },
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={7}>
                    <Typography suppressHydrationWarning 
                      variant="h6"
                      fontWeight="bold"
                      color="#2e7d32"
                      gutterBottom
                      sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                    >
                      {t('new_member_gift')}
                    </Typography>
                    <Typography suppressHydrationWarning 
                      variant="body2"
                      color="#555"
                      sx={{ mb: 3, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                    >
                      {t('reasonable_price_with_offers')}
                    </Typography>
                    <Button
                      onClick={() => router.push('/register')} // ← Thay navigate bằng router.push
                      variant="contained"
                      sx={{
                        bgcolor: 'rgba(152, 183, 32, 1)',
                        color: 'white',
                        borderRadius: '16px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                        '&:hover': { bgcolor: '#43a047' },
                      }}
                    >
                      {t('register_now')}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={5} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative' }}>
                      <Image  src={left} alt="QR Code" />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Card 2: Tải app */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: '#fff8e1',
                  borderRadius: '24px',
                  p: { xs: 3, md: 4 },
                  height: isMobile ? '80%' : '90%',
                  boxShadow: '0 8px 24px rgba(255, 193, 7, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(255, 193, 7, 0.15)',
                  },
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={7}>
                    <Typography suppressHydrationWarning 
                      variant="h6"
                      fontWeight="bold"
                      color="#ff8f00"
                      gutterBottom
                      sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                    >
                      {t('download_app_get_offer')}
                    </Typography>
                    <Typography suppressHydrationWarning 
                      variant="body2"
                      color="#555"
                      sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                    >
                      {t('use_app_hunt_deals')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '16px',
                        p: 2,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'inline-block',
                      }}
                    >
                      <Image  src={qr} alt="QR Code" style={{ width: 120, height: 120 }} />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default FirstTimeExplore;