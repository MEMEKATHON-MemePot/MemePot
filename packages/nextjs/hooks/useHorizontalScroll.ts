"use client";

import { useEffect, useRef } from "react";

export const useHorizontalScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 수평 스크롤이 가능한 영역인지 확인
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      if (!hasHorizontalScroll) return;

      // 끝에 도달했는지 확인
      const isAtStart = container.scrollLeft === 0;
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

      if (e.deltaY > 0 && !isAtEnd) {
        // 아래로 스크롤 → 오른쪽으로 (빠르게)
        e.preventDefault();
        velocityRef.current = e.deltaY * 1.5;
      } else if (e.deltaY < 0 && !isAtStart) {
        // 위로 스크롤 → 왼쪽으로 (빠르게)
        e.preventDefault();
        velocityRef.current = e.deltaY * 1.5;
      } else {
        // 끝에 도달하면 velocity 리셋
        velocityRef.current = 0;
        return;
      }

      // 부드럽고 빠른 애니메이션 (requestAnimationFrame)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        let newScrollLeft = container.scrollLeft + velocityRef.current;

        // 경계 제한
        newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
        container.scrollLeft = newScrollLeft;
      });
    };

    // passive: false로 preventDefault 가능
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return containerRef;
};
