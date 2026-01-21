// src/app/layout.tsx (Server Component - KHÔNG 'use client')

import type { Metadata } from 'next';
import './globals.css'; // Nếu có CSS global

import { BookingProvider } from '@/lib/context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { cookies } from 'next/headers';
import Header from '@/components/Header';

// Tạo queryClient ở đây (có thể tách riêng nếu cần)

export const metadata: Metadata = {
  title: 'Booking App',
  description: 'Ứng dụng đặt phòng khách sạn',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get('i18next')?.value || 'vi';
  return (
    <html lang={lang}>
      <body>
          
            <BookingProvider>
              {children}
            </BookingProvider>
        
      
        <ToastContainer />
      </body>
    </html>
  );
}