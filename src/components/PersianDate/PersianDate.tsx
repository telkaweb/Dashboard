// components/PersianDate.tsx

"use client";

import jalaali from "jalaali-js";

interface PersianDateProps {
  date: string;
}

const PersianDate: React.FC<PersianDateProps> = ({ date }) => {
  const convertToJalali = (isoDate: string) => {
    const parsedDate = new Date(isoDate);
    const { jy, jm, jd } = jalaali.toJalaali(parsedDate);
    return `${jy}/${jm.toString().padStart(2, "0")}/${jd.toString().padStart(2, "0")}`;
  };

  return <span>{convertToJalali(date)}</span>;
};

export default PersianDate;
