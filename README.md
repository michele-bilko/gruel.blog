# gruel.blog

working prototype to match canva design mockup

## how the site is organized

- `content/essays/`, `content/interviews-profiles/`, `content/reviews/`,
  `content/misc/`, `content/real-life-things/` one `.md` file per article.
  file headers are (title, author, date, tags, etc.)
  with article text in markdown.
- `src/lib/categories.js` sections with
  colors, and (for essays/reviews) their subcategories. 
  need to add a new section here and matching folder in `content/` to expand site later.
- `src/app/` pages (Next.js "App Router").
- `public/images/` graphics, article images (will be replaced when reconfigured from static -> dynamic)

### notes
-  essays and reviews subnav bars only appear once you're on that section's
  page (see page-4 comment) otherwise plain list.
  essays have the six subcategories from mockup (movies, music, books,
  food, art, misc) and reviews have two from (new releases, rethinking).
  easy to change in `categories.js`.
- homepage is empty (just nav and the
  corner stars) see page 1 note on animation (might consult someone on that btw)

## how to run locally

1. If running for the first time, **install Node.js**: download the "LTS" version from
   [nodejs.org](https://nodejs.org) and run the installer, should give you
   `node` and `npm`.
2. **unzip this project** somewhere on your computer, then open a terminal and
   `cd` into the folder (e.g. `cd Downloads/gruel-blog`).
3. **install dependencies**: run
   ```
   npm install
   ```
    downloads Next.js and the few small libraries the site uses and only
   needs to happen once (or again after you pull new code).
4. **run dev server**: in the terminal
   ```
   npm run dev
   ```
5. Open **http://localhost:3000** in your browser. Edits to any file will
   reload automatically (don't need to rerun npm run dev unless you end the session)

## editing articles (PENDING UPDATE)

open any `.md` file in `content/<section>/`, e.g. `content/essays/example-essay.md`:

```
---
title: my article title
author: Yasmin Hamilton
date: 2026-09-14
tags: [tag one, tag two]
subcategory: music        # only used by essays/reviews, can omit otherwise
image: /images/uploads/placeholder.svg   # optional
subtitle: subtitles example              # optional
---
Your article text goes here, in plain markdown. Blank line between
paragraphs. Start line with "> " for a pull-quote.
```

Save file, add a new `.md` file for a new article (any filename, it
becomes part of the URL), and it shows up on the site next time you reload.

## hosting options

According to my friend: Next.js sites like this deploy easily to **Vercel** or **Netlify**, both of which offer a free tier, connect straight
to a GitHub repo, and redeploy automatically every time content changes. Just push this folder to a GitHub repo and connect it.

## admin side (next phase)

-add a **git-based CMS**
(most likely Decap CMS) that gives a web form i.e. title, author,
date, image upload, a rich-text box for the body, that saves directly into the `content/` folder
