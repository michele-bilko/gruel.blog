// for adding a new section later (ex, "playlists"), add an entry here
// and create a matching folder in /content
export const CATEGORIES = {
  essays: {
    slug: "essays",
    label: "essays",
    color: "var(--essays)",
    subcategories: ["movies", "music", "books", "food", "art", "misc"],
  },
  "interviews-profiles": {
    slug: "interviews-profiles",
    label: "interviews/profiles",
    color: "var(--interviews)",
    subcategories: [],
  },
  reviews: {
    slug: "reviews",
    label: "reviews",
    color: "var(--reviews)",
    subcategories: ["new releases", "rethinking..."],
  },
  misc: {
    slug: "misc",
    label: "misc",
    color: "var(--misc)",
    subcategories: [],
  },
  "real-life-things": {
    slug: "real-life-things",
    label: "real life things",
    color: "var(--reallife)",
    subcategories: [],
  },
};

export const ABOUT = {
  slug: "about",
  label: "about",
  color: "var(--about)",
};

export const NAV_ITEMS = [...Object.values(CATEGORIES), ABOUT];

export function getCategory(slug) {
  return CATEGORIES[slug] || null;
}
