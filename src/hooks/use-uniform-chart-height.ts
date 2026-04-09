"use client";

import { useEffect, useState } from "react";

export function useUniformChartHeight() {
  const [height, setHeight] = useState(340);

  useEffect(() => {
    function updateHeight() {
      const width = window.innerWidth;
      if (width < 640) {
        setHeight(260);
        return;
      }
      if (width < 1024) {
        setHeight(290);
        return;
      }
      if (width < 1536) {
        setHeight(320);
        return;
      }
      setHeight(340);
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return height;
}
