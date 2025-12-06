"use client";

import { ReactNode } from "react";
import { useHorizontalScroll } from "~~/hooks/useHorizontalScroll";

interface HorizontalSectionsWrapperProps {
  children: ReactNode[];
}

export const HorizontalSectionsWrapper = ({ children }: HorizontalSectionsWrapperProps) => {
  const containerRef = useHorizontalScroll();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-x-auto overflow-y-hidden"
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>

      {/* 가로 스크롤 컨테이너 */}
      <div className="flex h-full" style={{ width: `${children.length * 100}vw` }}>
        {children.map((child, index) => (
          <div key={index} className="w-screen h-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
