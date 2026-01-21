import React, { useState } from "react";
import PaymentResultView from "./PaymentResultView";
import { getDetailBooking } from "../../service/booking";

type Props = {};

const PaymentResultController = (props: Props) => {
  const  [detailBooking,setDetailBooking] = useState(null);
  const [loading,setLoading] = useState(false)
  const getDetail = async (id) => {
    setLoading(true)
    try {
      let result = await getDetailBooking(id)
      if(result?.booking_id){
        console.log("AAAAA booking_id",result?.booking_id)
        setDetailBooking(result)
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  return <PaymentResultView getDetail={getDetail} detailBooking={detailBooking} loadingDetail={loading} />;
};

export default PaymentResultController;
