"use client";

import { useEffect, useState } from "react";

export const STAGE_W = 2560;
export const STAGE_H = 1920;

export function useStageScale() {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const update = () => setScale(window.innerWidth / STAGE_W);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}
