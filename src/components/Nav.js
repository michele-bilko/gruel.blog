import Link from "next/link";
import { NAV_ITEMS } from "@/lib/categories";

// activeSlug: which top-level section (or undefined on the home page)
// activeCategory: full active category object (if there is one)
// activeSub: currently selected subcategory (if there is one)
export default function Nav({ activeSlug, activeCategory, activeSub }) {
  const basePath = activeSlug ? `/${activeSlug}` : null;

  return (
    <nav className="nav">
      <div className="nav-row">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            data-active={item.slug === activeSlug}
            style={{ color: item.color }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* only rendered if there are subcategories in a section */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="subnav-row" style={{ color: activeCategory.color }}>
          {activeCategory.subcategories.map((sub) => (
            <Link
              key={sub}
              href={`${basePath}?sub=${encodeURIComponent(sub)}`}
              data-active={activeSub === sub}
            >
              {sub}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
