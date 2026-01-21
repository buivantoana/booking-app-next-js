// src/components/ThemeRegistry.tsx
'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { I18nextProvider } from 'react-i18next';
 // import instance đã init
import theme from '@/theme';
import i18nInstance from '@/translation/i18n';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18nInstance}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </I18nextProvider>
  );
}