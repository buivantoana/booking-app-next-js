// src/components/LocationModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Slide,
  Button,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslations } from 'next-intl';


interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (loc: any) => void;
  location: any[];
  address: any;
}

function LocationModal({ open, onClose, onSelect, location, address }: LocationModalProps) {
  const  t  = useTranslations();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<any[]>(location);

  // Tự động focus input khi mở modal
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Xóa dấu tiếng Việt để tìm kiếm không dấu
  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  useEffect(() => {
    if (search) {
      const searchNoTone = removeVietnameseTones(search);
      const filtered = location.filter((item) => {
        const nameNoTone = removeVietnameseTones(item.name.vi);
        return nameNoTone.includes(searchNoTone);
      });
      setFilter(filtered);
    } else {
      setFilter(location);
    }
  }, [location, search]);

  const handleSelect = (loc: any) => {
    onSelect(loc);
  };

  const handleClearSearch = () => {
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen // Mobile: full màn hình
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: '16px' },
          maxWidth: { sm: 680 },
          width: { sm: '90%' },
          m: { sm: 2 },
          maxHeight: { xs: 'none', sm: '90vh' },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ pb: 2 }}>
          <Typography suppressHydrationWarning  variant="h6" fontWeight={700} textAlign="center">
            {t('choose_your_location')}
          </Typography>
          <Typography suppressHydrationWarning  variant="body2" color="text.secondary" textAlign="center" mt={1}>
            {t('location_suggestion_description')}
          </Typography>

          {/* Search Input */}
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder={t('your_area_name')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mt: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#98b720' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                borderRadius: '12px',
                bgcolor: '#f9f9f9',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#98b720',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#98b720',
                },
              },
            }}
          />
        </Box>

        {/* Scrollable List */}
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 5 }}>
          <List>
            {/* Địa điểm khác */}
            <Typography suppressHydrationWarning 
              sx={{
                bgcolor: 'transparent',
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {t('other_location')}
            </Typography>

            {filter.length > 0 ? (
              filter.map((loc) => (
                <React.Fragment key={loc.id}>
                  <ListItem
                    
                    sx={{ justifyContent: 'space-between' }}
                    onClick={() => handleSelect(loc)}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon sx={{ mr: 2, color: '#98b720', fontSize: 20 }} />
                      <ListItemText
                        primary={loc.name.vi}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </Box>
                    {address && address.id === loc.id && <CheckIcon sx={{ color: '#98b720' }} />}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <Typography suppressHydrationWarning  variant="body2" color="text.secondary" sx={{ px: 4, py: 2 }}>
                {t('no_location_found')}
              </Typography>
            )}
          </List>
        </Box>

        {/* Fixed Bottom Button */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            bgcolor: 'background.paper',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Button
            fullWidth
            disabled={!address}
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#98b720',
              color: 'white',
              borderRadius: '12px',
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(152, 183, 32, 0.3)',
              '&:hover': { bgcolor: '#85a11c' },
            }}
            onClick={() => {
              localStorage.setItem('location', address.id);
              onClose();
            }}
          >
            {t('continue')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LocationModal;