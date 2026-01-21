// src/middleware.ts  (hoặc middleware.js ở root nếu không dùng src/)

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Danh sách tất cả locale hỗ trợ
  locales: ['vi', 'en', 'ja', 'ko'],

  // Locale mặc định (không có prefix khi dùng 'as-needed')
  defaultLocale: 'vi',

  // -------------------------------
  // Lựa chọn 1: Khuyến nghị cho dự án Việt Nam (default không prefix)
  localePrefix: 'as-needed',

  // Lựa chọn 2: Nếu bạn muốn tất cả đều có prefix (an toàn hơn cho SEO)
  // localePrefix: 'always',

  // Tắt tự động detect browser language nếu bạn muốn kiểm soát chặt (thường dùng khi có nút chọn ngôn ngữ rõ ràng)
  // localeDetection: false,   // ← uncomment nếu cần
});

export const config = {
  matcher: [
    // Match tất cả path trừ:
    // - api routes
    // - _next (static files, server files)
    // - files có đuôi (images, favicon, robots.txt, ...)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Bắt buộc match root (/) và các path có prefix locale
    '/'
  ]
};