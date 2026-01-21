import React, { useEffect, useState } from "react";
import DetailRoomView from "./DetailRoomView";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getAmenities,
  getAttribute,
  getAvailableRooms,
  getDetailHotelApi,
  getReviewHotel,
  searchHotel,
} from "../../service/hotel";
import { getHashtags } from "../../service/profile";
import { facilities } from "../../utils/utils";

type Props = {};

const DetailRoomController = (props: Props) => {
  const { id: idPrams } = useParams();
  const [searchParams] = useSearchParams();
  const [detailHotel, setDetailHotel] = useState({});
  const [loading, setLoading] = useState(true);
  const [recommend, setRecommend] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hastag, setHastag] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [idHotel, setIdHotel] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [attribute, setAttribute] = useState({});
  useEffect(() => {
    const checkIn = searchParams.get("checkIn"); // 2026-01-05
    const checkOut = searchParams.get("checkOut");
    const type = searchParams.get("type"); // hourly / daily
    const checkInTime = searchParams.get("checkInTime"); // 18:00
    const durationStr = searchParams.get("duration");
    const duration = durationStr ? Number(durationStr) : null;

    let finalCheckIn = checkIn;
    let finalCheckOut = checkOut;
    let rentType = type;

    if (type === "hourly") {
      if (!checkIn || !checkInTime || !duration || isNaN(duration)) {
        console.error("Missing params for hourly");
        return;
      }

      // Không dùng new Date() + toISOString() để tránh convert UTC
      // Thay vào đó: trực tiếp ghép chuỗi theo định dạng backend mong muốn
      finalCheckIn = `${checkIn} ${checkInTime}:00`; // "2026-01-05 18:00:00"

      // Tính check out
      const [hourStr, minuteStr] = checkInTime.split(":");
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);

      let outHour = hour + duration;
      let outDay = checkIn;

      // Nếu vượt 24h thì sang ngày hôm sau (hiếm, nhưng xử lý cho chắc)
      if (outHour >= 24) {
        outHour -= 24;
        const nextDay = new Date(checkIn);
        nextDay.setDate(nextDay.getDate() + 1);
        outDay = nextDay.toISOString().slice(0, 10);
      }

      const outTime = `${outHour.toString().padStart(2, "0")}:${minuteStr}`;
      finalCheckOut = `${outDay} ${outTime}:00`; // ví dụ: "2026-01-05 20:00:00"
    }

    if (idPrams && finalCheckIn && finalCheckOut) {
      getAvaibleRoom(idPrams, {
        check_in: finalCheckIn,
        check_out: finalCheckOut,
        rent_type: rentType,
      });
    }
  }, [searchParams, idPrams]);
  useEffect(() => {
    (async () => {
      try {
        let result = await getAttribute();
        setAttribute(result)
        if (result?.amenities?.length > 0) {
          setAmenities(
            result?.amenities.map((item) => {
              return {
                ...item,
                active: false,
              };
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  useEffect(() => {
    if (idPrams) {
      setIdHotel(idPrams);
    }
  }, [idPrams]);
  const getAvaibleRoom = async (id, query) => {
    try {
      let result = await getAvailableRooms(id, query);
      if (result.room_types) {
        setRooms(result.room_types);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (idHotel) {
      getDetailHotel();
      getReview();
      getHashtagsReview();
    }
  }, [idHotel]);
  const getDetailHotel = async () => {
    setLoading(true);
    try {
      let result = await getDetailHotelApi(idHotel);
      let recommend = await searchHotel({ category: "recommend" });

      if (recommend?.hotels?.length) {
        setRecommend(recommend?.hotels);
      }
      if (result && Object.keys(result).length > 0) {
        setDetailHotel(result);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const getReview = async (id) => {
    try {
      let review = await getReviewHotel(id || idHotel);
      console.log("AAAA review", review);
      if (review?.reviews) {
        setReviews(review?.reviews);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHashtagsReview = async () => {
    try {
      let hastag = await getHashtags();
      if (hastag?.hashtags?.length) {
        setHastag(hastag?.hashtags);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <DetailRoomView
      detailHotel={detailHotel}
      recommend={recommend}
      loading={loading}
      reviews={reviews}
      getReviewHotel={getReview}
      hastag={hastag}
      rooms={rooms}
      amenities={amenities}
      attribute={attribute}
    />
  );
};

export default DetailRoomController;
