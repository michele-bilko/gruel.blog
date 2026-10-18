import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { getCategory } from "@/lib/categories";
import { getArticle, getArticleSlugs } from "@/lib/content";

export default async function ArticlePage({ params }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const slugs = getArticleSlugs(category.slug);
  if (!slugs.includes(params.slug)) notFound();

  const article = await getArticle(category.slug, params.slug);

  return (
    <>
      <Nav activeSlug={category.slug} activeCategory={category} />
      <div className="content">
        <div className="article-header">
          <h1>title: {article.title}</h1>
          <div className="article-meta">
            {article.author}
            <br />
            {article.date}
            <br />
            tags: {(article.tags || []).join(", ")}
          </div>
        </div>

        {article.subtitle && (
          <div className="article-subtitle">{article.subtitle}</div>
        )}

        {article.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-image" src={article.image} alt="" />
        )}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </div>
    </>
  );
}
