"use client";

import Image from "next/image";
import { Section1 } from "./components/Section1";
import { Section2 } from "./components/Section2";
import { Section3 } from "./components/Section3";
import { Section4 } from "./components/Section4";
import { HorizontalSectionsWrapper } from "~~/components/HorizontalSectionsWrapper";

export default function MemePotLanding() {
  return (
    <div className="text-white relative">
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Image src="/background.png" alt="Background" fill className="object-cover" priority />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Horizontal Sections (1-4) */}
        <div className="h-screen">
          <HorizontalSectionsWrapper>
            <Section1 />
            <Section2 />
            <Section3 />
            <Section4 />
          </HorizontalSectionsWrapper>
        </div>

        {/* Vertical Sections (5-8) */}
        <div className="relative">
          {/* Section5: 프로젝트 소개 */}
          <section className="min-h-screen snap-start flex items-center justify-center relative py-20 px-10 flex-col text-center max-md:px-5 max-md:py-15">
            <h2 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-15 max-md:text-4xl">
              MemePot
            </h2>
            <div className="max-w-4xl text-3xl leading-relaxed text-gray-400 max-md:text-lg">
              <p className="mb-1">
                Creating a New DeFi Culture
                <br />
                MemePot goes beyond simple DeFi.
              </p>
              <p className="mb-1">
                We prioritize trust and safety,
                <br />
                and we will continue to evolve our offerings.
              </p>
              <p className="mb-1">
                Built to inherit the values of the MemeCore Foundation and <br />
                establish itself as part of a broader culture, <br />
                MemePot is a DeFi project that combines trust, safety, and fun.
              </p>
            </div>
          </section>

          {/* Section6: Core values */}
          <section className="min-h-screen snap-start flex items-center justify-center relative py-20 px-10 bg-gradient-to-b from-[#1a0a2e] to-[#0f0820] flex-col max-md:px-5 max-md:py-15">
            <h2 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent text-center mb-20 max-md:text-4xl max-md:mb-12">
              Core Values
            </h2>
            <div className="max-w-6xl w-full">
              {/* Value 1: Trust */}
              <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12">
                <div className="flex flex-col gap-4">
                  <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">01</div>
                  <div className="text-5xl font-bold max-md:text-3xl">Trust</div>
                  <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                    DeFi projects must operate based on trust. That&apos;s why we&apos;re building long-term rewards and
                    trust with well-established, transparent strategies rather than engagement-centric ones.
                  </div>
                </div>
                <div className="w-full h-80 flex items-center justify-center max-md:h-64">
                  <Image src="/trust.png" alt="MemePot Logo" width={80} height={80} className="w-80 h-80" />
                </div>
              </div>

              {/* Value 2: Safety */}
              <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12 md:[direction:rtl] [&>*]:md:[direction:ltr]">
                <div className="flex flex-col gap-4">
                  <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">02</div>
                  <div className="text-5xl font-bold max-md:text-3xl">Safety</div>
                  <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                    We believe technology cannot fix DeFi projects. It requires the security trusted such as Liquidity.
                    That&apos;s why we consider security as our foremost goal.
                  </div>
                </div>
                <div className="w-full h-80 flex items-center justify-center max-md:h-64">
                  <Image src="/safety.png" alt="MemePot Logo" width={80} height={80} className="w-60 h-60" />
                </div>
              </div>

              {/* Value 3: Fun */}
              <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12">
                <div className="flex flex-col gap-4">
                  <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">03</div>
                  <div className="text-5xl font-bold max-md:text-3xl">Fun</div>
                  <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                    With every project launch, 20% takes a year, we build it to provide the fun and excitement of
                    continuous events.
                  </div>
                </div>
                <div className="w-full h-80 flex items-center justify-center max-md:h-64 animate-float">
                  <Image src="/fun.png" alt="MemePot Logo" width={80} height={80} className="w-80 h-80" />
                </div>
              </div>
            </div>
          </section>

          {/* Section7: Roadmap */}
          <section className="min-h-screen snap-start flex items-center justify-center relative py-30 px-10 flex-col max-md:px-5 max-md:py-15">
            <h2 className="text-8xl font-bold text-center mb-2 max-md:text-4xl">Roadmap</h2>
            <p className="text-center text-gray-400 text-4xl mb-25 max-md:text-base">
              Building the future of DeFi together
            </p>
            <div className="max-w-3xl w-full relative py-5">
              <div className="absolute left-0 top-5 bottom-5 w-[3px] bg-purple-400/20" />

              <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
                  2026 Q1
                </div>
                <div className="text-lg text-gray-300 max-md:text-base">Community Building</div>
                <div className="text-lg text-gray-300 max-md:text-base">
                  Backend (Smart Contract/Beta) Security Audit
                </div>
                <div className="text-lg text-gray-300 max-md:text-base">
                  MemePot(Swap, Bridge, and Event Pool) Beta Launch
                </div>
              </div>

              <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
                  2026 Q2
                </div>
                <div className="text-lg text-gray-300 max-md:text-base">Community Building</div>
                <div className="text-lg text-gray-300 max-md:text-base">Comprehensive Formal Code Security Audit</div>
                <div className="text-lg text-gray-300 max-md:text-base">MemePot Alpha Mainnet Launch</div>
              </div>

              <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
                  2026 Q3
                </div>
                <div className="text-lg text-gray-300 max-md:text-base">추후 피드백 반영</div>
              </div>

              <div className="pl-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
                  2026 Q4
                </div>
                <div className="text-lg text-gray-300 max-md:text-base">추후 피드백 반영</div>
              </div>
            </div>
          </section>

          {/* Section8: Footer Section */}
          <section className="min-h-[60vh] snap-start flex items-center justify-center relative py-[150px] px-10 flex-col text-center max-md:px-5">
            <h2 className="text-8xl font-bold mb-4 max-md:text-3xl">A New DeFi Culture</h2>
            <h3 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-2 max-md:text-3xl">
              On the MemeCore Chain
            </h3>
            <p className="text-8xl font-bold max-md:text-2xl">MEMEPOT</p>
          </section>
        </div>
      </div>
    </div>
  );
}
