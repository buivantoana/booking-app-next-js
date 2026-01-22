'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.replace("/"); // đã login → đá về home
    }
  }, [router]);

  return <>{children}</>;
};

export default GuestRoute;
