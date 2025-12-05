"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

// import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Staking",
    href: "/staking",
  },
  {
    label: "24/7 event pools",
    href: "/prizes",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

/**
 * Site header
 */
export const Header = () => {
  // const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="top-0 z-50 backdrop-blur-sm border-b border-slate-800">
      <nav className="max-w-7xl mx-auto py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/about" className="flex items-center cursor-pointer">
            <Image src="/memepot_logo.png" alt="MEMEPOT Logo" width={40} height={40} className="w-16 h-16" />
            {/* <span className="text-white font-bold text-2xl">MEMEPOT</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`font-medium transition-colors cursor-pointer ${
                  pathname === href ? "text-[#AD47FF]" : "text-slate-300 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Wallet Button & Faucet */}
          <div className="hidden md:flex items-center">
            <RainbowKitCustomConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white cursor-pointer w-10 h-10 flex items-center justify-center"
          >
            <i className={`text-2xl ${isMenuOpen ? "ri-close-line" : "ri-menu-line"}`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {menuLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`block font-medium transition-colors cursor-pointer ${
                  pathname === href ? "text-[#AD47FF]" : "text-slate-300 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="flex flex-col gap-3">
              <RainbowKitCustomConnectButton />
              {/* {isLocalNetwork && <FaucetButton />} */}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
