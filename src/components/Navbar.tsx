"use client";
import React, { useState } from 'react';
import Logo from './Logo';
import Link from "next/link";
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: "Home", href: "/" },          // Home page
  { label: "How It Works", href: "#how" },
  { label: "Safety", href: "#safety" },
  { label: "About", href: "#about" },
  { label: "Voice Chat", href: "/voice" }, // <<== VOICE CHAT tab
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full z-20 fixed backdrop-blur bg-glass/30 border-b border-white/5">
      <div className="mx-auto max-w-5xl px-2 md:px-8 flex items-center justify-between h-16">
        <Logo withText />
        <div className="hidden md:flex gap-7 items-center font-medium text-sm">
          {NAV_LINKS.map(link => (
            <Link key={link.label} href={link.href} className="hover:gradient-glow-text transition-colors">{link.label}</Link>
          ))}
          <a
            href="#chat"
            className="ml-2 px-5 py-2 rounded-lg font-semibold bg-gradient-glow text-white shadow-glow transition-all hover:scale-105"
          >
            Start Chat
          </a>
        </div>
        {/* Mobile Hamburger */}
        <button className="md:hidden text-xl text-cyan transition-colors" onClick={() => setOpen(o => !o)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 py-4 bg-navy/95 border-b border-white/5 flex flex-col gap-6 shadow-2xl">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="text-lg w-fit gradient-glow-text font-medium"
              onClick={() => setOpen(false)}
            >{link.label}</Link>
          ))}
          <a
            href="#chat"
            className="px-5 py-2 w-fit rounded-lg font-semibold bg-gradient-glow text-white shadow-glow transition-all"
            onClick={() => setOpen(false)}
          >
            Start Chat
          </a>
        </div>
      )}
    </nav>
  );
}