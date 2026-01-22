// app/[locale]/layout.tsx

import { BookingProvider } from '@/lib/context';
import { LoadScript } from '@react-google-maps/api';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import './globals.css'; // Nếu có CSS global


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';



// Tạo queryClient ở đây (có thể tách riêng nếu cần)


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ✅ FIX Ở ĐÂY

  let messages;
  try {
    messages = (await import(`../../locales/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    
        <>
        
        <BookingProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>

            {children}
          </NextIntlClientProvider>
        </BookingProvider>


        <ToastContainer />
        </>
    



  );
}
