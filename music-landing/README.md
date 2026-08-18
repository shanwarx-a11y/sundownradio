# Gather — Music Landing (HTML + Tailwind)

Plain HTML + Tailwind CSS + vanilla JS port of the Next.js "Gather" album
landing page. No build step.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8000
```

## Files

| File         | Purpose                                                       |
| ------------ | ------------------------------------------------------------ |
| `index.html` | Markup — navbar, hero, album intro, tracks sections          |
| `styles.css` | Custom CSS Tailwind can't express: `@font-face`, orbit + wave keyframes |
| `script.js`  | Orbit gallery, 3D track carousel, player controls, navbar scroll |
| `fonts/`     | Local "Sloop Script" font (hero headline)                    |

## Stack notes

- **Tailwind** via Play CDN (`cdn.tailwindcss.com`) — JIT, arbitrary values
  work inline. For production, swap to the Tailwind CLI build.
- **Icons** via [lucide](https://lucide.dev) CDN (`data-lucide` attrs +
  `lucide.createIcons()`), replacing `lucide-react`.
- **Fonts**: Geist / Geist Mono / Mrs Saint Delafield from Google Fonts;
  Sloop Script served locally from `fonts/`.
- Images are placeholders from `picsum.photos`.
