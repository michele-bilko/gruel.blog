import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

// see the comment at the top of this file for how to edit the lists
const LISTS_FILE = path.join(
  process.cwd(),
  "content",
  "real-life-things-lists.md"
);

async function toHtml(markdown) {
  if (!markdown.trim()) return "";
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

// splits text on lines starting with `marker` ("# " or "## ").
// returns { before, sections: [{ name, body }] }
function splitOn(text, marker) {
  const sections = [];
  const before = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (line.startsWith(marker)) {
      current = { name: line.slice(marker.length).trim(), body: [] };
      sections.push(current);
    } else {
      (current ? current.body : before).push(line);
    }
  }
  return {
    before: before.join("\n"),
    sections: sections.map((s) => ({ name: s.name, body: s.body.join("\n") })),
  };
}

// returns { introHtml, cities: [{ name, noteHtml, subcategories: [{ name, html }] }] }
export async function getRealLifeThings() {
  if (!fs.existsSync(LISTS_FILE)) return { introHtml: "", cities: [] };

  const raw = fs
    .readFileSync(LISTS_FILE, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "");

  const { before: intro, sections: citySections } = splitOn(raw, "# ");

  const cities = await Promise.all(
    citySections.map(async (city) => {
      const { before: note, sections } = splitOn(city.body, "## ");
      return {
        name: city.name,
        noteHtml: await toHtml(note),
        subcategories: await Promise.all(
          sections.map(async (sub) => ({
            name: sub.name,
            html: await toHtml(sub.body),
          }))
        ),
      };
    })
  );

  return { introHtml: await toHtml(intro), cities };
}
