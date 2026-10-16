import Link from "next/link";
import { getRealLifeThings } from "@/lib/realLifeThings";
import { getAllArticles } from "@/lib/content";

// "real life things" page: intro + one expandable section per city.
// uses <details>/<summary> so clicking a city opens it without any JS.
export default async function RealLifeThings({ category }) {
  const { introHtml, cities } = await getRealLifeThings();
  const articles = getAllArticles(category.slug);

  return (
    <div className="real-life">
      <div
        className="real-life-intro"
        dangerouslySetInnerHTML={{ __html: introHtml }}
      />

      {cities.map((city) => {
        const cityArticles = articles.filter((a) => a.subcategory === city.name);
        const isEmpty =
          !city.noteHtml &&
          city.subcategories.length === 0 &&
          cityArticles.length === 0;

        return (
          <details className="city" key={city.name}>
            <summary>{city.name}</summary>
            <div className="city-body">
              {city.noteHtml && (
                <div dangerouslySetInnerHTML={{ __html: city.noteHtml }} />
              )}

              {city.subcategories.map((sub) => (
                <div className="city-subcategory" key={sub.name}>
                  <h3>{sub.name}</h3>
                  <div dangerouslySetInnerHTML={{ __html: sub.html }} />
                </div>
              ))}

              {cityArticles.length > 0 && (
                <div className="city-subcategory">
                  <h3>on gruel.blog</h3>
                  <ul>
                    {cityArticles.map((article) => (
                      <li key={article.slug}>
                        <Link href={`/${category.slug}/${article.slug}`}>
                          {article.title}
                        </Link>{" "}
                        <span className="muted">— {article.author}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isEmpty && <p className="empty-note">nothing here yet!</p>}
            </div>
          </details>
        );
      })}
    </div>
  );
}
