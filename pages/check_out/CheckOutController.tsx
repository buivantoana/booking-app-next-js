"use client";
import React, { useEffect, useState } from "react";
import CheckOutView from "./CheckOutView";
import { useRouter } from "next/navigation";


type Props = {};

const CheckOutController = (props: Props) => {
  const [dataCheckout,setDataCheckOut] = useState({})
  const navigate = useRouter()
  useEffect(()=>{
    if(localStorage.getItem("booking")){
      setDataCheckOut(JSON.parse(localStorage.getItem("booking")))
    }else{
      navigate.push("/")
    }
  },[])
  return <CheckOutView dataCheckout={dataCheckout}/>;
};

export default CheckOutController;
