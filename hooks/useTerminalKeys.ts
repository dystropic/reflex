"use client";

import { useEffect, useRef, useState } from "react";

export function useTerminalKeys(count: number, enabled = true) {
  const [selected, setSelected] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        setSelected((s) => Math.min(s + 1, count - 1));
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (event.key === "Enter") {
        setChosen(selectedRef.current);
      } else if (event.key === "Escape" || event.key === "b") {
        setChosen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, enabled]);

  return { selected, setSelected, chosen, setChosen };
}
