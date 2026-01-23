"use client";
import React, { useEffect, useRef, useState } from "react";
import RoomsView from "./RoomsView";
import dayjs, { Dayjs } from "dayjs";
import { usePathname } from "@/translation/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { getAmenities, getAttribute, searchHotel } from "../../service/hotel";
import { facilities } from "../../utils/utils";
import { LoadScript } from "@react-google-maps/api";

type Props = {};

const RoomsController = (props: Props) => {
  const [queryHotel, setQueryHotel] = useState({});
  const [dataHotel, setDataHotel] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const location = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [totalAll, setTotalAll] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingScroll, setLoadingScroll] = useState(false);
  const limit = 5;
  useEffect(() => {
    console.log("AAAAAA toan tesst");
    const locationParam = searchParams.get("location") || "";
    const typeParam = searchParams.get("type") || "hourly";
    const category = searchParams.get("category");

    setQueryHotel({
      ...queryHotel,
      city: locationParam,
      rent_types: typeParam,
      category,
      limit,
      page,
    });
  }, [location, searchParams.get("search"), page]);
  useEffect(() => {
    (async () => {
      try {
        let result = await getAttribute();

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
  const prevQueryRef = useRef(queryHotel);
  useEffect(() => {
    if (Object.keys(queryHotel).length === 0) return;

    const prevQuery = prevQueryRef.current;

    // Kiểm tra xem chỉ page thay đổi
    const onlyPageChanged =
      queryHotel.page !== prevQuery.page &&
      Object.keys(queryHotel).every(
        (key) => key === "page" || queryHotel[key] === prevQuery[key]
      );

    if (onlyPageChanged) {
      // chỉ load thêm, không reset dataHotel
      getHotel(queryHotel);
    } else {
      // reset dataHotel nếu có field khác thay đổi
      setDataHotel([]);
      setPage(1);
      getHotel();
    }

    // lưu lại queryHotel hiện tại cho lần sau
    prevQueryRef.current = queryHotel;
  }, [queryHotel]);
  const getHotel = async (query) => {
    if (dataHotel.length == 0) {
      setLoading(true);
    } else {
      setLoadingScroll(true);
    }

    try {
      let result = await searchHotel(query || queryHotel);
      if (result?.hotels) {
        setDataHotel((prev) => {
          // Nếu page = 1 (làm mới), return new
          if ((query?.page || queryHotel.page) === 1) {
            return result.hotels;
          }
          // Nếu page > 1, append thêm
          return [...prev, ...result.hotels];
        });
        setTotal(result?.total_pages);
        setTotalAll(result?.total);
      }
    } catch (error) {
      console.log(error);
    }
    if (dataHotel.length == 0) {
      setLoading(false);
    } else {
      setLoadingScroll(false);
    }
  };
  const getHotelLatLon = async (query) => {
    setLoading(true);
    try {
      let result = await searchHotel(query);
      if (result?.hotels) {
        setDataHotel(result?.hotels);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  console.log("AAAAA page", page);
  return (
    <LoadScript googleMapsApiKey='AIzaSyASJk1hzLv6Xoj0fRsYnfuO6ptOXu0fZsc'>
    <RoomsView
      dataHotel={dataHotel}
      amenities={amenities}
      totalAll={totalAll}
      getHotel={getHotel}
      loading={loading}
      total={total}
      setPage={setPage}
      page={page}
      getHotelLatLon={getHotelLatLon}
      setLoading={setLoading}
      queryHotel={queryHotel}
      setQueryHotel={setQueryHotel}
      searchParams={searchParams}
      loadingScroll={loadingScroll}
    />
    </LoadScript>
  );
};

export default RoomsController;
