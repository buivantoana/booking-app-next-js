'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
};

export default PrivateRoute;
