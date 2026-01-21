// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en', 'ja', 'ko'],

  defaultLocale: 'vi',

  // Khuyến nghị cho dự án Việt Nam: default locale không prefix
  localePrefix: 'as-needed',

  // Nếu muốn tất cả đều có prefix (ví dụ: /vi/, /en/, /ja/, /ko/)
  // localePrefix: 'always',

  // localeDetection: false, // Tắt auto-detect nếu bạn có nút chọn ngôn ngữ riêng
});