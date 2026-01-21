import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"], // Ưu tiên localStorage trước
      lookupLocalStorage: "i18nextLng", 
      caches: ["localStorage"], 
    },
  });

// Chuẩn hóa ngôn ngữ trước khi set vào i18next
i18n.on("languageChanged", (lng) => {
  let normalizedLang = lng;

  if (lng === "vi-VN") {
    normalizedLang = "vi";
  } else if (lng === "en-US") {
    normalizedLang = "en";
  }

  if (normalizedLang !== lng) {
    i18n.changeLanguage(normalizedLang);
    localStorage.setItem("i18nextLng", normalizedLang);
  }
});

export default i18n;
