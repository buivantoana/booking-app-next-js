import React, { useEffect, useState } from "react";
import CheckOutView from "./CheckOutView";
import { useNavigate } from "react-router-dom";

type Props = {};

const CheckOutController = (props: Props) => {
  const [dataCheckout,setDataCheckOut] = useState({})
  const navigate = useNavigate()
  useEffect(()=>{
    if(localStorage.getItem("booking")){
      setDataCheckOut(JSON.parse(localStorage.getItem("booking")))
    }else{
      navigate("/")
    }
  },[])
  return <CheckOutView dataCheckout={dataCheckout}/>;
};

export default CheckOutController;
