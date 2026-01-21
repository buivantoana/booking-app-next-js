import CryptoJS from "crypto-js";

// Hàm sắp xếp object theo thứ tự key tăng dần
function sortObjectByKeys(obj: Record<string, any>) {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObj: Record<string, any>, key) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {});
}

// Hàm tạo chữ ký
export function createSimpleHash(body: any) {
  // Bước 1: Sắp xếp body theo thứ tự key tăng dần
  const sortedBody = sortObjectByKeys(body);
  console.log(sortedBody);
  // Bước 2: Chuyển đổi body đã sắp xếp thành chuỗi JSON
  const jsonBody = JSON.stringify(body);

  // Bước 3: Tạo hash SHA-256 mà không cần secret key
  const hash = CryptoJS.SHA256(jsonBody).toString(CryptoJS.enc.Hex);

  return hash;
}

export function limitDescription(description: any, maxLength: any) {
  if (description.length <= maxLength) {
    return description;
  } else {
    return description.slice(0, maxLength) + "...";
  }
}

export const calculateProgress = (data: any) => {
  return data.map((course: any) => {
    let totalSubLessons = 0;
    let completedSubLessons = 0;

    course.lesson_progress.forEach((lesson: any) => {
      lesson.sub_lesson.forEach((subLesson: any) => {
        totalSubLessons++;
        if (
          (subLesson.completed == true && subLesson.result == true) ||
          (subLesson.completed === true && subLesson.result === false)
        ) {
          completedSubLessons++;
        }
      });
    });

    const progressPercentage = (completedSubLessons / totalSubLessons) * 100;
    return Math.ceil(progressPercentage);
  });
};
export function convertToVND(amount: any) {
  // Chuyển đổi số tiền thành chuỗi và thêm dấu phân tách hàng nghìn
  let formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // Thêm ký hiệu tiền tệ "₫" vào cuối
  return formattedAmount + " ₫";
}

export function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Tháng được tính từ 0-11, cần cộng thêm 1
  const year = today.getFullYear();

  return `Hà Nội,${day}/${month}/${year}`;
}

export function roundToOneDecimal(num: any) {
  return parseFloat(num.toFixed(1));
}
export const getStartOfMonth = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Lấy ngày, tháng, năm cụ thể
  const day = startOfMonth.getDate();
  const month = startOfMonth.getMonth() + 1; // Tháng bắt đầu từ 0, cần phải cộng thêm 1
  const year = startOfMonth.getFullYear();

  // Chuyển định dạng ngày, tháng, năm thành chuỗi
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

export function calculateTimeAgoString(
  pastDate: Date,
  currentDate: Date = new Date()
): string {
  const timeDifference = currentDate.getTime() - pastDate.getTime();

  // Chuyển milliseconds thành các đơn vị thời gian
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} năm trước`;
  } else if (months > 0) {
    return `${months} tháng trước`;
  } else if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else if (minutes > 0) {
    return `${minutes} phút trước`;
  } else {
    return `${seconds} giây trước`;
  }
}
export function formattedDateHHMMDDMMYYYY(data) {
  const date = new Date(data);

  const formatted = date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  });
  return formatted;
}

export const ERROR_MESSAGES = {
  OK: "Thành công",

  USER_NOT_FOUND: "Không tìm thấy tài khoản",
  USER_NOT_PW: "Tài khoản chưa cấu hình mã pin",
  WRONG_PW: "Sai mã PIN",

  UPDATE_ERROR: "Cập nhật thất bại",
  UNAUTHORIZED: "Lỗi đăng nhập",

  INVALID_DATETIME_FORMAT: "Sai định dạng thời gian",
  INVALID_BODY: "Vui lòng điền đầy đủ các thông tin cần thiết",
  INVALID_PARTNER: "Đối tác không hợp lệ hoặc bị khoá",
  INVALID_STATUS: "Trạng thái không hợp lệ, vui lòng kiểm tra lại",
  INVALID_ACTION: "Hành động không hợp lệ, vui lòng kiểm tra lại",

  ROOM_TYPE_NOT_FOUND: "Không tìm thấy hạng phòng",
  RENT_TYPE_NOT_FOUND:
    "Không tìm thấy kiểu thuê phù hợp, vui lòng kiểm tra cấu hình thuê theo giờ, đêm hoặc ngày",
  ROOM_NOT_FREE: "Phòng không còn trống hoặc mới bị giữ chỗ",

  EMAIL_USED: "Email đã được sử dụng",
  PHONE_USED: "Số điện thoại đã được sử dụng",

  ACCOUNT_LOCKED: "Tài khoản bị khoá",
  NOT_PERMISSION: "Không có quyền truy cập",

  BOOKING_NOT_FOUND: "Mã đặt phòng không tồn tại",
  HOTEL_NOT_FOUND: "Không tìm thấy khách sạn",
  NOT_FOUND: "Không tìm thấy dữ liệu",

  INTERNAL_ERROR: "Lỗi nội bộ hệ thống",
};
// Hàm lấy message từ code lỗi
export const getErrorMessage = (errorCode) => {
  return ERROR_MESSAGES[errorCode] || null;
};

export const normalizePhoneForAPI = (phone) => {
  if (!phone) return "";

  let p = phone.trim().replace(/\D/g, ""); // chỉ giữ số

  if (p.startsWith("0")) {
    p = p.slice(1); // xoá số 0 đầu tiên
  }

  return p;
};

export const parseName = (name?: string) => {
  let currentLanguage = localStorage.getItem("i18nextLng")
  if (!name) return "Không có tên";

  try {
    if (typeof name == "object") {
      return name?.[currentLanguage] || "Không có tên";
    }
    const parsed = JSON.parse(name);
    return parsed?.[currentLanguage]  || "Không có tên";
  } catch {
    console.log("AAAAA test");
    // name là plain text (ví dụ: "Suite")
    return name;
  }
};

export const validateChar = (value) => {
    return /^\d*$/.test(value); // Hoặc dùng !isNaN(Number(value)) && value !== ''
  };
export const facilities = [
  {
    id: "luggage_storage",
    name: {
      en: "Luggage Storage",
      vi: "Bảo quản hành lý",
      ja: "荷物預かり",
      ko: "수하물 보관",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/double%20shopping%20bag.png",
  },
  {
    id: "elevator",
    name: {
      en: "Elevator",
      vi: "Thang máy",
      ja: "エレベーター",
      ko: "엘리베이터",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%20(1).png",
  },
  {
    id: "safe_box",
    name: {
      en: "Safe Box",
      vi: "Két sắt",
      ja: "セーフティボックス",
      ko: "금고",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%201321317930%20(1).png",
  },
  {
    id: "parking",
    name: {
      en: "Parking",
      vi: "Bãi đỗ xe",
      ja: "駐車場",
      ko: "주차장",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%201321317935%20(1).png",
  },
  {
    id: "pool",
    name: {
      en: "Swimming Pool",
      vi: "Bể bơi",
      ja: "プール",
      ko: "수영장",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%201321317932%20(1).png",
  },
  {
    id: "air_conditioner",
    name: {
      en: "Air Conditioner",
      vi: "Điều hòa",
      ja: "エアコン",
      ko: "에어컨",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/hotel-air-conditioner--heating-ac-air-hvac-cool-cooling-cold-hot-conditioning-hotel.png",
  },
  {
    id: "smart_tv",
    name: {
      en: "Smart TV",
      vi: "Smart TV",
      ja: "スマートテレビ",
      ko: "스마트 TV",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Display.png",
  },
  {
    id: "love_chair",
    name: {
      en: "Love Chair",
      vi: "Ghế tình yêu",
      ja: "ラブチェア",
      ko: "러브 체어",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Armchair%202.png",
  },
  {
    id: "bathtub",
    name: {
      en: "Bathtub",
      vi: "Bồn tắm",
      ja: "バスタブ",
      ko: "욕조",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Bath.png",
  },
  {
    id: "kitchenware",
    name: {
      en: "Kitchenware",
      vi: "Đồ bếp",
      ja: "キッチン用品",
      ko: "주방용품",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/pot-01%20(1).png",
  },
  {
    id: "refrigerator",
    name: {
      en: "Refrigerator",
      vi: "Tủ lạnh",
      ja: "冷蔵庫",
      ko: "냉장고",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Fridge.png",
  },
  {
    id: "wifi",
    name: {
      en: "WiFi",
      vi: "Wifi",
      ja: "Wi-Fi",
      ko: "와이파이",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%201321317936.png",
  },
  {
    id: "hair_dryer",
    name: {
      en: "Hair Dryer",
      vi: "Máy sấy tóc",
      ja: "ヘアドライヤー",
      ko: "헤어드라이어",
    },
    icon: "https://raw.githubusercontent.com/buivantoana/host-file/main/Frame%201321317937%20(1).png",
  },
];

export const mapLocale = (lng?: string) => {
  if (!lng) return 'vi'; // fallback an toàn

  if (lng.startsWith('vi')) return 'vi';
  if (lng.startsWith('en')) return 'en';
  if (lng.startsWith('ko')) return 'ko';
  if (lng.startsWith('ja')) return 'ja';

  return 'vi';
};