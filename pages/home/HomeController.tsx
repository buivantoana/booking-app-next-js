// src/components/HomeController.tsx
'use client';

import React, { useEffect, useState } from "react";
import HomeView from "./HomeView";
import { getLocation, searchHotel } from "@/service/hotel"; // Giả sử bạn đã migrate service
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { Close, Tune } from "@mui/icons-material";
import Image from 'next/image'; // Sử dụng NextImage
import success from "@/images/Capa_1.png"; // Giả sử đường dẫn images đã config đúng trong Next.js
import { useTranslations } from "next-intl";



const HomeController = () => {
  const [location, setLocation] = useState([]);
  const [newHotel, setNewHotel] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [toprated, setToprated] = useState([]);
  const [recommend, setRecommend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registerSuccessOpen, setRegisterSuccessOpen] = useState(false);
  const [forgotSuccessOpen, setForgotSuccessOpen] = useState(false); 
 
  const  t  = useTranslations();
  // useEffect(() => {
  //   if (searchParams.get("msg") === "success"&& searchParams.get("from") == "register") {

  //     setRegisterSuccessOpen(true)
  //     searchParams.delete("msg");
  //     searchParams.delete("from");
  //     setSearchParams(searchParams, { replace: true });
  //   }else if(searchParams.get("msg") === "success" && searchParams.get("from") == "forgot-password" ){
  //     setRegisterSuccessOpen(true)
  //     setForgotSuccessOpen(true)
  //     searchParams.delete("msg");
  //     searchParams.delete("from");
  //     setSearchParams(searchParams, { replace: true });
  //   }
  // }, [searchParams]);
  useEffect(() => {
    
    (async () => {
      setLoading(true);
      try {
        let recommend = await searchHotel({ category: "recommend" });
        let toprated = await searchHotel({ category: "toprated" });
        let newHotel = await searchHotel({ category: "new" });
        
        if (recommend?.hotels?.length) {
          setRecommend(recommend?.hotels);
        }
        if (toprated?.hotels?.length) {
          setToprated(toprated?.hotels);
        }
        if (newHotel?.hotels?.length) {
          setNewHotel(newHotel?.hotels);
        }

       
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    })();
  }, []);
  useEffect(()=>{
    getLocationAddess()
  },[])
  const getLocationAddess = async()=>{
    try {
      let result = await getLocation();
      console.log("AAA location", result);
      if (result?.locations) {
        setLocation(result?.locations);
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
    <HomeView
      newHotel={newHotel}
      toprated={toprated}
      featured={featured}
      recommend={recommend}
      location={location}
      loading={loading}
    
      />
       <Dialog
        open={registerSuccessOpen}
        onClose={() => setRegisterSuccessOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ textAlign: "center", pt: 4, pb: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#ffebee",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}>
              <Image src={success} alt='' />
            </Box>
            <IconButton
              onClick={() => setRegisterSuccessOpen(false)}
              sx={{ position: "absolute", top: -40, left: -30 }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", px: 4, pb: 3 }}>
          <Typography suppressHydrationWarning  fontWeight={600} fontSize='18px' mb={1}>
          {forgotSuccessOpen ? t('pin_change_success'):t('account_creation_success')} 
          </Typography>
          <Typography suppressHydrationWarning  fontSize='14px' color='#666'>
          {t('pin_new_login_prompt')}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 4,
            gap: 2,
            flexDirection: "column",
          }}>
          <Button
            onClick={() => {
              setRegisterSuccessOpen(false)
            }}
            variant='contained'
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              bgcolor: "#98b720",
              "&:hover": { bgcolor: "#8ab020" },
              width: "100%",
            }}>
           {t('pin_new_login_agree')}
          </Button>
         
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomeController;