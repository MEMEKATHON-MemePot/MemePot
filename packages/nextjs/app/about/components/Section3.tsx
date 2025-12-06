"use client";

import Image from "next/image";

export const Section3 = () => {
  return (
    <section className="w-full h-full flex items-center justify-center relative px-10 bg-gradient-to-b from-[#1a0a2e] to-[#0a0514] flex-col max-md:px-5">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-15 items-center">
        <div className="animate-float relative w-full h-[400px] rounded-2xl overflow-hidden border border-purple-400/20 shadow-[0_0_30px_rgba(167,139,250,0.2)] max-md:h-[400px]">
          <Image src="/section3.png" alt="MemePot Project Introduction" fill className="object-cover" priority />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-center text-6xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent max-md:text-3xl">
            MAKE FUN <br /> IS GOOD
          </h2>
        </div>
      </div>
    </section>
  );
};
