"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The 37-second tour.
 *
 * Nothing about it is fetched until the visitor scrolls near it: the
 * poster, the mp4 and the webm are all attached on approach. The video
 * is muted and does not autoplay — the visitor presses play, and the
 * browser's own controls handle the rest.
 */
export default function TourVideo() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setArmed(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef}>
      <video
        className="tour-video"
        poster={armed ? "/media/xr-tour-poster.webp" : undefined}
        preload="none"
        playsInline
        muted
        loop
        controls
        aria-label="Recorded screen capture of the XR desktop app answering a question, its budget screen, and the XR mobile app"
      >
        {armed ? (
          <>
            <source src="/media/xr-tour.webm" type="video/webm" />
            <source src="/media/xr-tour.mp4" type="video/mp4" />
          </>
        ) : null}
        Your browser cannot play this video. The same session is transcribed in the interactive
        preview below.
      </video>
    </div>
  );
}
