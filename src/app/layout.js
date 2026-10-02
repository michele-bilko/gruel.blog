import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import Stars from "@/components/Stars";

export const metadata = {
  title: "gruel.blog",
  description: "a zine for intentional listeners, writers, readers, and enjoyers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <Suspense fallback={null}>
            <Stars />
          </Suspense>
          <div className="site-title">
            <Link href="/">gruel.blog</Link>
          </div>
          {children}
        </div>
        <div className="footer">site maintained by <Link href="https://github.com/michele-bilko" style={{ color: "lightpink" }}>michele-bilko</Link></div>
      </body>
    </html>
  );
}