import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const CONTENT_DIR = path.join(process.cwd(), "content");

// article is one .md file with frontmatter like:
//
// ---
// title: yadayadyadayada yada yada yada
// author: Author Name
// date: 2026-09-01
// tags: [alpacas, farm life]
// subcategory: music
// image: /images/uploads/example.jpg
// ---
// The article body goes here.

function categoryDir(categorySlug) {
  return path.join(CONTENT_DIR, categorySlug);
}

// normalize gray-matter's YAML parser date (js object) to a plain "YYYY-MM-DD" string
function normalizeDate(data) {
  if (data.date instanceof Date) {
    data.date = data.date.toISOString().slice(0, 10);
  }
  return data;
}

export function getArticleSlugs(categorySlug) {
  const dir = categoryDir(categorySlug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getArticleMeta(categorySlug, slug) {
  const filePath = path.join(categoryDir(categorySlug), `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  return { slug, ...normalizeDate(data) };
}

export function getAllArticles(categorySlug, subcategory) {
  const slugs = getArticleSlugs(categorySlug);
  const articles = slugs.map((slug) => getArticleMeta(categorySlug, slug));
  const filtered = subcategory
    ? articles.filter((a) => a.subcategory === subcategory)
    : articles;
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getArticle(categorySlug, slug) {
  const filePath = path.join(categoryDir(categorySlug), `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return { slug, ...normalizeDate(data), contentHtml: processed.toString() };
}
