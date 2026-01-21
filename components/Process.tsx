import { Box, CircularProgress } from "@mui/material";
import React from "react";

const Progress = (props: any) => {
  console.log("AAAA Progress", props);
  return (
    <>
      {props.showProgress && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0,0,0,.5)",
            zIndex: 20000,
          }}>
          <Box
            sx={{
              width: "130px",
              height: "130px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "white",
              borderRadius: "10px",
            }}>
            <CircularProgress size={35} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default Progress;
