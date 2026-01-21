import { ReactNode, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header";

import { Box } from "@mui/material";
import Footer from "../Footer";

const LayoutWebsite = () => {
  return (
    <Box bgcolor={"#f8fafc"} minHeight={"100vh"}>
      <Header />
      <Box>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutWebsite;
