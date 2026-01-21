import React, { useEffect, useState } from "react";
import ProfileView from "./ProfileView";
import { getHashtags, historyBookingContact } from "../../service/profile";

type Props = {};

const ProfileController = (props: Props) => {
  const [historyBooking, setHistoryBooking] = useState([]);
  const [hastag, setHastag] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    total_pages: 0,
  });
  useEffect(() => {
    getHistoryBooking(1);
  }, []);
  const getHistoryBooking = async (page) => {
    setLoading(true);
    try {

      let hastag = await getHashtags();
      if (hastag?.hashtags?.length) {
        setHastag(hastag?.hashtags);
      }
      let query: any = {
        page: page || pagination.page,
        limit: pagination.limit,
      };
      let result = await historyBookingContact(query);
      console.log("AAAA result", result);
      if (result?.bookings) {
        setHistoryBooking(result?.bookings||[]);
        setPagination({
          page: result.page || 1,
          limit: result.limit || 10,
          total: result.total || 0,
          total_pages: result.total_pages || 1,
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
   
    getHistoryBooking( newPage);
    
  };
  return (
    <ProfileView
      historyBooking={historyBooking}
      getHistoryBooking={getHistoryBooking}
      hastag={hastag}
      loading={loading}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};

export default ProfileController;
