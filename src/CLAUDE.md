# Fencing Website Content Generation Skill

## Purpose

This skill automates the generation of content files for fencing contractor websites. Given a filled-in Site Brief, it generates all required JavaScript content files and saves them to the correct locations in an Astro project.

## When to Use

Use this skill when the user:
- Asks to generate content for a fencing website
- References a Site Brief for a fencing contractor
- Asks to create service pages, service area pages, homepage, about, or contact content
- Says something like "Generate all content for [Business Name]"

## Required Inputs

Before generating content, you need:

1. **Site Brief** — A markdown file containing:
   - Business Name
   - Phone (Display format)
   - City, State, State Abbr, County, Region
   - Service Areas (list of 9 areas with primary marked)
   - Colors (optional, for reference)
   - Business Hours (for contact page)

2. **Target Directory** — The Astro project's `src/content/` folder where files will be saved

## File Structure to Generate

```
src/content/
├── homepage.js          ← 1 file
├── about.js             ← 1 file
├── contact.js           ← 1 file
├── services/
│   ├── chain-link-fence.js
│   ├── vinyl-fence.js
│   ├── wood-fence.js
│   ├── wrought-iron-fence.js
│   ├── metal-fence.js
│   ├── farm-ranch-fence.js
│   ├── fence-repair.js
│   └── commercial-fencing.js    ← 8 files
└── service-areas/
    └── [one file per area]      ← 9 files (typically)
```

**Total: 19 content files**

## Content Contracts

Each file must match the exact JavaScript structure expected by the Astro templates.

### Homepage (`homepage.js`)

```javascript
export const homepageContent = {
  hero: { ctaText: String },
  intro: { heading: String, paragraphs: [String], formHeading: String },
  serviceCards: { "[slug]": { description: String, ctaText: String } },
  about: { heading: String, content: String, ctaText: String },
  whyChooseUs: { heading: String, intro: String, cards: [{ heading: String, content: String }] },
  gallery: { heading: String },
  perks: { heading: String, intro: String, cards: [{ heading: String, content: String }] },
  faq: { heading: String, intro: String, questions: [{ question: String, answer: String }] },
  cta: { heading: String, content: String, ctaText: String },
};
export default homepageContent;
```

### Service Page (`services/[slug].js`)

```javascript
export const [serviceName]Content = {
  seo: { title: String, description: String },
  hero: { heading: String, subtitle: String, ctaText: String },
  intro: { formHeading: String, content: String },
  sections: [{ heading: String, content: String }],  // EXACTLY 3
  gallery: { heading: String },
  signsYouNeed: { heading: String, intro: String, cards: [{ heading: String, content: String }] },  // EXACTLY 4 cards
  process: { heading: String, intro: String, steps: [{ heading: String, content: String }] },  // EXACTLY 4 steps
  cta: { heading: String, content: String, ctaText: String },
  closing: String,
};
export default [serviceName]Content;
```

### Service Area Page (`service-areas/[slug].js`)

```javascript
export const [areaName]Content = {
  areaName: String,
  mapQuery: String,
  seo: { title: String, description: String },
  hero: { heading: String, subtitle: String, ctaText: String },
  intro: { welcome: String, paragraphs: [String] },
  services: { heading: String, intro: String, cards: [{ heading: String, content: String }], footer: String },  // EXACTLY 3 cards
  whyUs: { heading: String, intro: String, cards: [{ heading: String, content: String }] },  // EXACTLY 3 cards
  nearby: { heading: String, content: String, links: [{ name: String, slug: String }] },
  cta: { heading: String, content: String, ctaText: String },
};
export default [areaName]Content;
```

### About Page (`about.js`)

```javascript
export const aboutContent = {
  hero: { heading: String, subtitle: String },
  main: { heading: String, paragraphs: [String] },  // 3 paragraphs
  coreValues: { heading: String, values: [{ heading: String, content: String }] },  // EXACTLY 4 values
  whyTrustUs: { heading: String, values: [{ title: String, description: String }], closingParagraph: String },  // EXACTLY 4 values
  cta: { heading: String, content: String, ctaText: String },
};
export default aboutContent;
```

### Contact Page (`contact.js`)

```javascript
export const contactContent = {
  hero: { heading: String, subtitle: String },
  main: { heading: String, content: String },
  contactInfo: { phoneLabel: String, addressLabel: String, addressText: String, hoursLabel: String, hours: String, preferCallHeading: String },
  form: { heading: String, submitText: String, fields: {...}, timelineOptions: [...] },
};
export default contactContent;
```

## Template Variables

These placeholders are replaced at runtime by the Astro `processContent()` utility:

| Variable | Description |
|----------|-------------|
| `{businessName}` | Company name |
| `{city}` | Primary city |
| `{stateAbbr}` | Two-letter state |
| `{county}` | County name |
| `{region}` | Regional description |
| `{phone}` | Display phone number |
| `{niche}` | "Fencing" |
| `{nicheLC}` | "fencing" |

**Usage rules:**
- Service pages and service area pages: USE template variables for business name and phone
- Homepage, about, contact: Write out ACTUAL values (no template variables)

## Writing Guidelines

Apply these rules to ALL generated content:

1. **Tone:** Direct contractor voice, not marketing agency
2. **Local knowledge:** Reference real climate, geography, neighborhoods, landmarks
3. **SEO:** Natural keyword usage, no stuffing
4. **Forbidden:** 
   - Never use the word "solutions"
   - Never use "Welcome to" or "Looking for" openings
   - Never use filler phrases like "in today's world", "when it comes to"
5. **Structure:** Match exact card/section counts specified in contracts
6. **Uniqueness:** Each service area must have genuinely unique content — not name-swapped templates

## Word Count Targets

| Page Type | Target Words |
|-----------|--------------|
| Homepage | ~1,100 total across all sections |
| Service page | 750-950 |
| Service area page | 375-390 |
| About page | ~290 |
| Contact page | ~70 |

## Generation Process

When asked to generate content for a site:

1. **Read the Site Brief** to extract all business details
2. **Create the content directory structure** if it doesn't exist
3. **Generate each file** following the contracts and guidelines above
4. **Save files** to the correct locations
5. **Report completion** with a summary of files created

## Services Reference

Standard 8 services with slugs and export names:

| Service | Slug | Export Name |
|---------|------|-------------|
| Chain-Link Fence | chain-link-fence | chainLinkFenceContent |
| Vinyl Fence | vinyl-fence | vinylFenceContent |
| Wood Fence | wood-fence | woodFenceContent |
| Wrought Iron Fence | wrought-iron-fence | wroughtIronFenceContent |
| Metal Fence | metal-fence | metalFenceContent |
| Farm & Ranch Fence | farm-ranch-fence | farmRanchFenceContent |
| Fence Repair | fence-repair | fenceRepairContent |
| Commercial Fencing | commercial-fencing | commercialFencingContent |

## Service Area Naming

Convert area names to slugs and exports:
- **Slug:** Lowercase, spaces → dashes (e.g., "San Benito" → "san-benito")
- **Export:** camelCase + "Content" (e.g., "San Benito" → "sanBenitoContent")

## Example Usage

User: "Generate all content for Phoenix Fence Pros. Here's the Site Brief: [paste brief]"

Claude Code should:
1. Parse the Site Brief
2. Generate 19 files (1 homepage, 8 services, 9 service areas, 1 about, 1 contact)
3. Save each to `src/content/[appropriate path]`
4. Confirm completion
