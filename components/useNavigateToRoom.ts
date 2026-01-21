import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export const useNavigateToRoom = () => {
  const navigate = useNavigate();

  return (booking) => {
    if (!booking) return;

    // parse hotel name (JSON string)
    let hotelName = "";
    try {
      const parsedName = JSON.parse(booking.hotel_name);
      hotelName = parsedName.vi || parsedName.en || "";
    } catch {
      hotelName = "";
    }

    // time xử lý
    const checkInDate = dayjs(booking.check_in);
    const checkOutDate = dayjs(booking.check_out);

    const checkIn = checkInDate.format("YYYY-MM-DD");
    const checkOut = checkOutDate.format("YYYY-MM-DD");

    const checkInTime = checkInDate.format("HH:mm");

    // duration theo giờ
    const duration = checkOutDate.diff(checkInDate, "hour");

    const params = new URLSearchParams({
      // location: "haiphong", // nếu sau này có field thì map lại
      type: booking.rent_type, // hourly / daily
      checkIn,
      checkOut,
      checkInTime,
      duration: String(duration),
      name: hotelName,
    });

    navigate(`/room/${booking.hotel_id}?${params.toString()}`);
  };
};
