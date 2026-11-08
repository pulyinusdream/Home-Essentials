"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const rooms = [
  "/assets/kitchen.png",
  "/assets/bedroom.png",
  "/assets/bathroom.png",
  "/assets/organization.png",
] as const;

export function HeroRoomGallery() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const syncVisibility = () => setPaused(document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  return (
    <figure className={`hero-room-gallery${paused ? " is-paused" : ""}`}>
      <div
        className="hero-room-gallery__frames"
        role="img"
        aria-label="Organized kitchen, bedroom, bathroom, and home storage spaces"
      >
        {rooms.map((src, index) => (
          <Image
            className="hero-room-gallery__frame"
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="(max-width: 900px) 100vw, 58vw"
            key={src}
          />
        ))}
      </div>
      <figcaption>Four rooms, one practical catalogue.</figcaption>
    </figure>
  );
}
