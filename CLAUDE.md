# Asphalt Website Content Generation

## Overview

This is a template for generating asphalt / paving contractor websites. Claude Code generates all content files from a filled-in Site Brief and saves them to the correct locations in this Astro project.

## Paths

- **Site Briefs Location:** `C:/Users/Owner/Documents/Three Oaks Digital/3OD Obsidian Vault/Asphalt-sites/03-Sites/`
- **Content Output:** `./src/content/`

## Quick Start

When asked to generate content for a site (e.g., "Generate all content for Goshen Asphalt Pros"):

1. Read the Site Brief from: `.../Asphalt-sites/03-Sites/[site-folder]/Site-Brief.md` (or use the brief pasted into chat)
2. Read `./src/config.js` to get the EXACT service list and slugs for THIS site (see note below)
3. Generate every content file
4. Save them to the correct locations in `./src/content/`

---

## IMPORTANT: Services are NOT a fixed list

Unlike the fencing template, asphalt sites do **not** use a standard 8 services. The service
list varies per market and per **Site Focus** (Residential / Commercial / Mixed).

- **Read the actual `SERVICES` array from `./src/config.js`** (or the Services table in the Site Brief)
  and generate exactly one service page per listed slug — no more, no fewer.
- Do NOT assume a default list. Do NOT carry over fencing services.
- Match the filename to the slug exactly (`sealcoating` → `services/sealcoating.js`).

**Mixed-focus reference set (typical, 10):**

| Service | Slug | Export Name |
|---------|------|-------------|
| Asphalt Paving | asphalt-paving | asphaltPavingContent |
| Asphalt Driveway Paving | asphalt-driveway-paving | asphaltDrivewayPavingContent |
| Parking Lot Paving | parking-lot-paving | parkingLotPavingContent |
| Asphalt Resurfacing & Overlay | asphalt-resurfacing | asphaltResurfacingContent |
| Sealcoating | sealcoating | sealcoatingContent |
| Asphalt Repair | asphalt-repair | asphaltRepairContent |
| Crack Filling & Sealing | crack-filling | crackFillingContent |
| Parking Lot Striping | parking-lot-striping | parkingLotStripingContent |
| Pothole Repair | pothole-repair | potholeRepairContent |
| Pavement Maintenance | pavement-maintenance | pavementMaintenanceContent |

> Residential and Commercial menus are listed in the Site Brief. Use whichever the Brief specifies.

---

## Honor the Site Focus

Read `Site Focus` from the Site Brief / `config.js` (`siteFocus`) and weight ALL content:
- **Residential** → homeowners, driveways, curb appeal, HOAs.
- **Commercial** → property managers / business owners, parking lots, liability, minimal closure time, ADA.
- **Mixed** → both; lead each page with whichever audience fits that service.

---

## Files to Generate

| File | Location | Count |
|------|----------|-------|
| `homepage.js` | `src/content/` | 1 |
| `about.js` | `src/content/` | 1 |
| `contact.js` | `src/content/` | 1 |
| `testimonials.js` | `src/content/` | 1 |
| Service pages | `src/content/services/` | 10–12 (from config) |
| Service area pages | `src/content/service-areas/` | 8–10 |
| Neighborhood pages (if any) | `src/content/service-areas/[city]/` | 0–4 |
| **Total** | | **~24–30** |

If a city has neighborhoods, the city's own file goes at `service-areas/[city]/index.js`
and each neighborhood at `service-areas/[city]/[neighborhood].js`.

---

## Service Area Naming

- **Slug:** lowercase, spaces → dashes ("Saratoga Springs" → "saratoga-springs")
- **Export:** camelCase + "Content" ("Saratoga Springs" → "saratogaSpringsContent")

---

## Content Contracts

### Testimonials (`testimonials.js`)

```javascript
export const testimonials = [
  { quote: String, name: String, location: String },  // 4 total
];
export default testimonials;
```
- Reference a real local street/landmark; spread across service areas.
- Each testimonial features a DIFFERENT service; match Site Focus (driveways vs. lots vs. both).
- Authentic, concise, no superlatives or marketing speak.

### Homepage (`homepage.js`)

```javascript
export const homepageContent = {
  hero: { ctaText: String },
  intro: { heading: String, paragraphs: [String], formHeading: String },  // heading: "Asphalt Paving Contractor in [City] [ST]"
  serviceCards: { "[slug]": { description: String, ctaText: String } },     // ONE per service in config
  about: { heading: String, content: String, ctaText: String },
  whyChooseUs: { heading: String, intro: String, cards: [{ heading: String, content: String }] },  // 4 cards
  gallery: { heading: String },
  perks: { heading: String, intro: String, cards: [{ heading: String, content: String }] },         // 4 cards
  faq: { heading: String, intro: String, questions: [{ question: String, answer: String }] },         // 6-8
  cta: { heading: String, content: String, ctaText: String },
};
export default homepageContent;
```
**FAQ topics:** cost, asphalt lifespan, cure/drive-on time, sealcoat frequency, best paving season, asphalt vs concrete, service-area coverage, +1 to focus.

### Service Page (`services/[slug].js`)

```javascript
export const [serviceName]Content = {
  shortDesc: String,                                  // for the Services listing page (~25-35 words)
  seo: { title: String, description: String },
  hero: { heading: String, subtitle: String, ctaText: String },
  intro: { formHeading: String, content: String },
  sections: [{ heading: String, content: String }],   // EXACTLY 3
  gallery: { heading: String },
  signsYouNeed: { heading: String, intro: String, cards: [{ heading: String, content: String }] },  // EXACTLY 4
  process: { heading: String, intro: String, steps: [{ heading: String, content: String }] },        // EXACTLY 4
  cta: { heading: String, content: String, ctaText: String },
  closing: String,
};
export default [serviceName]Content;
```
**750–950 words.** Variables allowed: {businessName}, {city}, {stateAbbr}, {phone}.
Write with real asphalt expertise — base/sub-base prep, compaction, hot-mix, drainage/grading,
sealcoat chemistry + recoat intervals, mill-and-overlay vs. full-depth, crack routing, striping/ADA.
"Signs You Need" + "Process" must be TRUE to the specific service (sealcoating ≠ paving).

### Service Area Page (`service-areas/[slug].js`)

```javascript
export const [areaName]Content = {
  areaName: String,
  mapQuery: String,                                   // "AreaName,+ST"
  seo: { title: String, description: String },
  hero: { heading: String, subtitle: String, ctaText: String },   // "Asphalt Paving in [Area], [ST]"
  intro: { welcome: String, paragraphs: [String] },   // 2 paragraphs, <strong> on street/area names
  services: { heading: String, intro: String, cards: [{ heading: String, content: String }], footer: String },  // EXACTLY 3
  whyUs: { heading: String, intro: String, cards: [{ heading: String, content: String }] },                      // EXACTLY 3
  nearby: { heading: String, content: String, links: [{ name: String, slug: String }] },                          // 3-5
  cta: { heading: String, content: String, ctaText: String },
};
export default [areaName]Content;
```
**375–390 words.** Variables: {businessName}, {phone}. Genuinely unique per area — no name-swapping.

### Neighborhood Page (`service-areas/[city]/[neighborhood].js`)
Same shape as a service area page **plus** `parentCity: String`. **300–350 words.** Hyper-local;
reference real streets/landmarks; do not reuse the parent city's content.

### About Page (`about.js`)

```javascript
export const aboutContent = {
  hero: { heading: String, subtitle: String },
  main: { heading: String, paragraphs: [String] },    // 3 paragraphs
  coreValues: { heading: String, values: [{ heading: String, content: String }] },  // EXACTLY 4
  whyTrustUs: { heading: String, values: [{ title: String, description: String }], closingParagraph: String },  // EXACTLY 4, title ONE word
  cta: { heading: String, content: String, ctaText: String },
};
export default aboutContent;
```
**~290 words.** No template variables — write out actual business name and city.

### Contact Page (`contact.js`)

```javascript
export const contactContent = {
  hero: { heading: String, subtitle: String },
  main: { heading: String, content: String },
  contactInfo: { phoneLabel, addressLabel, addressText, hoursLabel, hours, preferCallHeading },  // all String; {city}/{stateAbbr} only in addressText; \n in hours
  form: { heading: String, submitText: String, fields: {...}, timelineOptions: [...] },  // 5 timeline options
};
export default contactContent;
```
**~70 words.**

---

## Template Variables

`{businessName}` `{city}` `{stateAbbr}` `{county}` `{region}` `{phone}` `{niche}`("Asphalt Paving") `{nicheLC}`("asphalt paving")

- Service & service-area pages: USE variables for business name + phone.
- Homepage, about, contact: write out ACTUAL values.

---

## Writing Rules (ALL content)

- **Tone:** direct contractor voice, confident, not a marketing agency.
- **Local knowledge:** real streets/landmarks; real conditions (freeze-thaw, drainage, summer heat/UV, soil/base).
- **SEO:** natural keywords, city in key headings, no stuffing.
- **Forbidden:** the word "solutions"; "Welcome to"/"Looking for" openers; filler ("in today's world", "when it comes to", "look no further"); buzzwords ("leverage", "synergy", "cutting-edge").
- **Structure:** match exact card/section counts; vary openings; don't start more than one section with "At {businessName}" or "We".

---

## Generation Process

1. **Read the Site Brief** + **read `config.js`** for the exact service list, slugs, areas, and Site Focus.
2. **Create directories** if missing: `src/content/services/`, `src/content/service-areas/` (and `service-areas/[city]/` for neighborhoods).
3. **Generate in this order:** `testimonials.js` → `homepage.js` → `about.js` → `contact.js` → all service pages → all service area pages → any neighborhood pages.
4. **Save each file** to its correct location.
5. **Verify slug parity:** every `services/[slug].js` filename must match a slug in `config.js` `SERVICES`. Flag any mismatch.
6. **Report completion** with a file-count summary grouped by type.

---

## Config.js

`config.js` is normally **pre-filled** during site setup (business details, colors, SERVICES, service
areas, Site Focus). You do not need to rewrite it. Only verify that the `SERVICES` slugs there match
the service files you generated, and report any discrepancy.

> Optional `guides/` layer: if `src/content/guides/` exists and the Site Brief requests guides,
> generate them per the guide-page contract. Skip entirely otherwise.
