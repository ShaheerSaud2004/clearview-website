# ClearView Property Inspections — website

Static site (plain HTML/CSS/JS, no build step). Open `index.html` in a browser, or host the folder on Netlify, Cloudflare Pages or GitHub Pages (all free, with HTTPS included).

## Files

| File | What it is |
|---|---|
| `index.html` | Homepage: hero, credentials, why ClearView, services, about, sample report, what we inspect, service area, reviews, FAQ, final CTA, quote form |
| `services/home-inspection.html` | Service page **template**. Copy it for radon, WDI, oil tank, drone |
| `service-area/phillipsburg-nj.html` | City page **template**. Copy it for Easton, Bethlehem, Allentown |
| `js/config.js` | **Phone, email, Spectora link, sample report link, form endpoint.** Change these once and every page updates |
| `css/styles.css` | All styling. Brand colors are at the top (`--navy`, `--blue`) |
| `assets/` | Logo, favicon, photos |

## Design style

The site uses one style, **Drafted** (`css/themes/drafted.css`). It builds on `css/themes/atelier.css`, so keep that file: a dark architectural hero with stats, the giant ClearView wordmark, and a line drawing of a house under the ClearView lens that sketches itself in below the wordmark. Sections fade in on scroll. Visitors whose phone or computer is set to reduce motion get a still page.

## Preview mode

Add `?preview` to the URL (`index.html?preview`) to see content that's hidden until it's ready, outlined in yellow: radon/WDI/drone credentials and service cards, the reviews section, etc. When something is ready, delete `pending` from that element's `class`.

## Example photos

Every photo slot currently shows an **example** stock photo from Unsplash (free license), stored in `assets/photos/`. Drafted swaps in a modern gable house for the closing photo (set in `STYLE_PHOTOS` at the top of `js/main.js`). Alt text starts with "Example photo". The inspector portrait is Omer's photo (`assets/photos/omer-qureshi.jpg`, 480×480). To replace any photo, change the `<img>` inside that `data-slot` (or delete the `<img>` to get the placeholder back). The service-area slot is a drawn map card (Phillipsburg home base, New Jersey shaded, PA marked coming soon). On the real site you can swap it for a Google Maps embed.

## Still needed from the client

- [ ] Real phone number and email → `js/config.js` (also the `telephone` line in each page's JSON-LD block)
- [ ] Domain name → replace `clearviewpropertyinspections.com` in `<link rel="canonical">` / `og:url`
- [ ] Logo → `assets/logo.svg`, then replace the placeholder `<svg class="brand-mark">` in header/footer
- [ ] Photos → each slot is a `<div class="ph" data-slot="...">`. Put an `<img src="assets/..." alt="...">` inside it and the placeholder look disappears. Slots: hero, inspector portrait, each service card, report screenshots, service-area map, inner-page photos
- [ ] Inspector name, background, training, license # (About section + footer)
- [ ] Spectora scheduler URL → `scheduleUrl` in `config.js` (Spectora: Settings → Online Scheduler). Every "Schedule" button then goes straight into Website → Schedule → Agreement → Payment flow
- [ ] Sample report link → `sampleReportUrl` (a Spectora sample report link or a PDF)
- [ ] Quote form endpoint → `formEndpoint` (e.g. a free Formspree form). A hidden honeypot field already blocks basic spam bots
- [ ] Credentials as they're finalized: radon, WDI, FAA Part 107 → remove `pending`
- [ ] Google reviews once collected → paste real reviews in the Reviews section, remove `pending`, set `googleReviewsUrl`. **No placeholder testimonials on the live site.**
- [ ] Confirm FAQ facts: inspection length (2–4 hrs), report turnaround (within 24 hrs)
- [ ] Google Analytics 4 snippet (spot marked in `<head>`), then submit the site to Search Console

## Adding pages

- **New service:** copy `services/home-inspection.html`, change title, description, H1 and content, then link it from its card on the homepage.
- **New city:** copy `service-area/phillipsburg-nj.html` to e.g. `easton-pa.html`, rewrite the title, description, H1 and local text (unique text per page matters for SEO), then turn that city's chip on the homepage and footer into a link.
