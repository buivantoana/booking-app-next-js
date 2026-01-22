// app/layout.tsx
import type { Metadata } from "next";

import { cookies } from "next/headers";


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lấy locale từ cookie (nếu middleware chưa set params.locale)
  const cookieStore = await cookies();
  const locale =  await cookieStore.get("NEXT_LOCALE")?.value || "vi";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}