"use client";
import React from 'react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 py-14 px-4 md:px-0 border-t border-white/10 bg-navy/80">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Logo withText size={38} className="mb-2 sm:mb-0" />
        <div className="flex flex-wrap gap-5 items-center text-slate-400 text-sm">
          <a href="#" className="hover:gradient-glow-text">Privacy Policy</a>
          <a href="#" className="hover:gradient-glow-text">Terms of Service</a>
          <a href="#" className="hover:gradient-glow-text">Community Guidelines</a>
          <a href="mailto:contact@strangerly.com" className="hover:gradient-glow-text">Contact</a>
        </div>
      </div>
      <div className="text-center text-xs text-slate-600 mt-6">
        © {new Date().getFullYear()} Strangerly. All rights reserved.
      </div>
    </footer>
  )
}