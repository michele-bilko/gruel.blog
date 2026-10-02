"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STAR_IMAGES = [
  "/images/stars/star-pink.png",
  "/images/stars/star-orange.png",
  "/images/stars/star-green.png",
  "/images/stars/star-purple.png",
  "/images/stars/star-yellow.png",
];

const ROW_HEIGHT = 170; // vertical spacing between stars, per side
const LEFT_PCTS = [4, 10];
const RIGHT_PCTS = [4, 10];

function randomImage() {
  return STAR_IMAGES[Math.floor(Math.random() * STAR_IMAGES.length)];
}

function buildColumn(startTop, pageHeight, pcts) {
  const rows = Math.max(0, Math.ceil((pageHeight - startTop) / ROW_HEIGHT));
  const stars = [];
  for (let row = 0; row < rows; row++) {
    stars.push({
      key: row,
      top: startTop + row * ROW_HEIGHT,
      pct: pcts[row % pcts.length],
      image: randomImage(),
      rotate: ((row * 53) % 24) - 12,
    });
  }
  return stars;
}

export default function Stars() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [columns, setColumns] = useState({ left: [], right: [] });

  useEffect(() => {
    function compute() {
      const nav = document.querySelector(".nav");
      if (!nav) return;
      const navBottom = nav.getBoundingClientRect().bottom + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      setColumns({
        left: buildColumn(navBottom + 30, pageHeight, LEFT_PCTS),
        right: buildColumn(navBottom + 10, pageHeight, RIGHT_PCTS),
      });
    }

    compute();
    window.addEventListener("resize", compute);
    const ro = new ResizeObserver(compute);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", compute);
      ro.disconnect();
    };
  }, [pathname, searchParams]);

  return (
    <div className="stars" aria-hidden="true">
      {columns.left.map((s) => (
        <img
          key={`l-${s.key}`}
          src={s.image}
          alt=""
          style={{ top: s.top, left: `${s.pct}%`, transform: `rotate(${s.rotate}deg)` }}
        />
      ))}
      {columns.right.map((s) => (
        <img
          key={`r-${s.key}`}
          src={s.image}
          alt=""
          style={{ top: s.top, right: `${s.pct}%`, transform: `rotate(${s.rotate}deg)` }}
        />
      ))}
    </div>
  );
}