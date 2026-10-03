// TODO: fix the star in top right (never appears :( now)

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

// lol this is like game dev again
const STAR_SIZE = 70;
const PADDING = 14;

//  need to add selector here whenever new kind of text block is added to site (keep stars from blocking)
const PROTECTED_SELECTOR = [
  ".site-title",
  ".nav",
  ".article-row",
  ".article-header",
  ".article-meta",
  ".article-subtitle",
  ".article-image",
  ".article-body",
  ".about",
  ".empty-note",
  ".footer",
].join(", ");

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

function getProtectedRects() {
  return Array.from(document.querySelectorAll(PROTECTED_SELECTOR)).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top + window.scrollY - PADDING,
      bottom: r.bottom + window.scrollY + PADDING,
      left: r.left - PADDING,
      right: r.right + PADDING,
    };
  });
}

function boxesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function dropOverlapping(stars, side, protectedRects, viewportWidth) {
  return stars.filter((s) => {
    const left =
      side === "left"
        ? (viewportWidth * s.pct) / 100
        : viewportWidth - (viewportWidth * s.pct) / 100 - STAR_SIZE;
    const box = { left, right: left + STAR_SIZE, top: s.top, bottom: s.top + STAR_SIZE };
    return !protectedRects.some((rect) => boxesOverlap(box, rect));
  });
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
      const viewportWidth = window.innerWidth;

      const rawLeft = buildColumn(navBottom + 30, pageHeight, LEFT_PCTS);
      const rawRight = buildColumn(navBottom + 10, pageHeight, RIGHT_PCTS);
      const protectedRects = getProtectedRects();

      setColumns({
        left: dropOverlapping(rawLeft, "left", protectedRects, viewportWidth),
        right: dropOverlapping(rawRight, "right", protectedRects, viewportWidth),
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