import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    locale = 'vi';
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
