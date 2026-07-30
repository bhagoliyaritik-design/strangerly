"use client";
import React from "react";
import Image from "next/image";

type LogoProps = {
  className?: string;
  withText?: boolean;
  size?: number;
};

export default function Logo({ className = "", withText = false, size = 40 }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Image src="/assets/logo.svg" width={size} height={size} alt="Strangerly Logo" />
      {withText && (
        <span className="gradient-glow-text font-bold text-xl tracking-tighter -ml-1 select-none">
          Strangerly
        </span>
      )}
    </span>
  )
}