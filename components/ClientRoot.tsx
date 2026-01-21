'use client';

import dynamic from 'next/dynamic';
import { I18nextProvider } from 'react-i18next';

const i18n = dynamic(() => import('@/translation/i18n'), {
  ssr: false,
});

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  // @ts-ignore
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
