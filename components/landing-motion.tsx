"use client";
import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function reduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Hero entrance: staggered rise, expo ease, from a visible default. */
export function HeroEnter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    gsap.fromTo(
      ref.current.children,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "expo.out", delay: 0.1, overwrite: "auto" }
    );
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

/** Image scale 0.85 -> 1 on entry, darken + fade on exit. */
export function ScaleFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { scale: 0.85 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 88%", end: "top 38%", scrub: 0.6 } }
    );
    gsap.to(el, {
      opacity: 0.25, filter: "brightness(0.55)", ease: "none",
      scrollTrigger: { trigger: el, start: "bottom 62%", end: "bottom 18%", scrub: 0.6 },
    });
  }, { scope: ref });
  return <div ref={ref} className={className}>{children}</div>;
}

/** Seamless GSAP marquee: track holds exactly 2 copies, loops xPercent -50. */
export function Marquee({ children, className = "", duration = 24 }: {
  children: React.ReactNode; className?: string; duration?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const tween = React.useRef<gsap.core.Tween | null>(null);
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    tween.current = gsap.to(ref.current, {
      xPercent: -50, ease: "none", duration, repeat: -1,
    });
    return () => { tween.current?.kill(); tween.current = null; };
  }, { scope: ref });
  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => tween.current?.pause()}
      onMouseLeave={() => { if (!reduced()) tween.current?.play(); }}
    >
      <div ref={ref} className="flex w-max items-center will-change-transform">{children}</div>
    </div>
  );
}export function PinSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const leftRef = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced() || !ref.current || !leftRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top+=110",
        end: "bottom bottom-=40",
        pin: leftRef.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    });
    return () => mm.revert();
  }, { scope: ref });
  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div ref={leftRef} className="lg:self-start">{left}</div>
      <div className="grid content-start gap-5">{right}</div>
    </div>
  );
}
