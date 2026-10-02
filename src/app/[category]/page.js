import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { getCategory } from "@/lib/categories";
import { getAllArticles } from "@/lib/content";

export default function CategoryPage({ params, searchParams }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const activeSub = searchParams?.sub;
  const articles = getAllArticles(category.slug, activeSub);

  return (
    <>
      <Nav
        activeSlug={category.slug}
        activeCategory={category}
        activeSub={activeSub}
      />
      <div className="content">
        <div className="article-list">
          {articles.length === 0 && (
            <p className="empty-note">
              No articles here yet{activeSub ? ` in "${activeSub}"` : ""}.
            </p>
          )}
          {articles.map((article) => (
            <div className="article-row" key={article.slug}>
              <span className="date">{article.date}</span>
              <Link
                className="title"
                style={{ color: category.color }}
                href={`/${category.slug}/${article.slug}`}
              >
                title: {article.title}
              </Link>
              <span className="author">{article.author}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
