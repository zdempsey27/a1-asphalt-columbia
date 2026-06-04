import fs from 'fs';
import { testimonials } from './content/testimonials.js';

// ============================================================================
// CONFIG — A1 Asphalt Columbia
// ============================================================================
// IMAGE PREFIX RULE: prefixes here MUST match generate-images.py output.
//   - Each service uses its SLUG as the image prefix  -> sealcoating-1.jpeg, etc.
//   - Crew / fallback images use the prefix "paving-crew" -> paving-crew-1.jpeg
// BACKGROUNDS NOTE: keys (wood, vinyl, chainLink, ...) are LEFT AS-IS on purpose —
//   they are indexed decorative slots the templates reference by name. Don't rename.
// ============================================================================

function getImagesMatching(prefix) {
  try {
    const files = fs.readdirSync('./public/images');
    return files
      .filter(f => f.startsWith(prefix) && /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map(f => `/images/${f}`);
  } catch {
    return [];
  }
}

function getFirstImage(prefix) {
  const images = getImagesMatching(prefix);
  return images[0] || null;
}

// ============================================================================
// MASTER DETAILS — EDIT THIS SECTION ONLY
// ============================================================================

const BUSINESS_NAME = "A1 Asphalt Columbia";
const SITE_URL = "https://a1asphaltcolumbia.com";   // confirm domain
const TAGLINE = "Quality Asphalt That Lasts";
const PHONE_DISPLAY = "(803) 369-3545";
const PHONE_TEL = "tel:+18033693545";
const PHONE_RAW = "8033693545";
const EMAIL = "";
const CLIENT_EMAIL = "";

const CITY = "Columbia";
const STATE = "South Carolina";
const STATE_ABBR = "SC";
const COUNTY = "Richland County";
const REGION = "the Midlands";
const GEO_LAT = 34.0007;
const GEO_LNG = -81.0348;

// Site Focus: "residential" | "commercial" | "mixed"
const SITE_FOCUS = "mixed";

// Colors — asphalt slate + striping yellow (swap accent to #73000A for USC garnet)
const PRIMARY_COLOR = "#1F2A33";
const PRIMARY_DARK = "#12181D";
const SECONDARY_COLOR = "#3D3D3D";
const ACCENT_COLOR = "#F2A900";
const OVERLAY_COLOR = "31, 42, 51";

// Hero & Trust Signals
const HERO_TAGLINE = "PROFESSIONAL ASPHALT PAVING";
const HERO_HEADLINE = `${CITY}'s Trusted Asphalt Paving Contractors`;
const HERO_DESCRIPTION = `${BUSINESS_NAME} delivers durable asphalt paving, sealcoating, and repair built on a properly graded base — protecting driveways and parking lots across the Midlands for years.`;
const HERO_CTA_TEXT = "Request Your Free Estimate";
const FORM_HEADING = "Get Your Free Estimate";
const FORM_URGENCY_TEXT = "Now Booking This Paving Season!";

// Reviews & Trust (set to 0 to hide)
const REVIEW_RATING = 4.9;
const REVIEW_COUNT = 100;
const TRUST_BADGES = [
  { text: "Licensed & Insured", icon: "shield" },
  { text: "Locally Owned", icon: "award" },
];

const BUSINESS_HOURS = "Mon-Fri: 7:00 AM - 5:00 PM\nSat: 8:00 AM - 2:00 PM";

const STATS = [
  { label: "Quality Materials", value: 95 },
  { label: "Customer Satisfaction", value: 98 },
  { label: "On-Time Completion", value: 94 },
];

// SERVICES — slug = image prefix. Must match generate-images.py + content files.
const SERVICES = [
  { name: "Asphalt Paving", slug: "asphalt-paving" },
  { name: "Asphalt Driveway Paving", slug: "asphalt-driveway-paving" },
  { name: "Parking Lot Paving", slug: "parking-lot-paving" },
  { name: "Asphalt Resurfacing & Overlay", slug: "asphalt-resurfacing" },
  { name: "Sealcoating", slug: "sealcoating" },
  { name: "Asphalt Repair", slug: "asphalt-repair" },
  { name: "Crack Filling & Sealing", slug: "crack-filling" },
  { name: "Parking Lot Striping", slug: "parking-lot-striping" },
  { name: "Pothole Repair", slug: "pothole-repair" },
  { name: "Pavement Maintenance", slug: "pavement-maintenance" },
];

// Primary city FIRST. Columbia carries neighborhoods (folder pattern kicks in).
const SERVICE_AREA_NAMES = [
  { name: "Columbia", neighborhoods: ["Shandon", "Rosewood", "Spring Valley"] },
  "Lexington",
  "Irmo",
  "West Columbia",
  "Cayce",
  "Forest Acres",
  "Blythewood",
  "Chapin",
  "Red Bank",
  "Gilbert",
];

// ============================================================================
// STOP EDITING HERE — Everything below auto-populates from above
// ============================================================================

function toSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const siteConfig = {
  businessName: BUSINESS_NAME,
  siteUrl: SITE_URL,
  tagline: TAGLINE,
  niche: "Asphalt Paving",
  nicheLC: "asphalt paving",
  siteFocus: SITE_FOCUS,

  phone: { display: PHONE_DISPLAY, tel: PHONE_TEL, raw: PHONE_RAW },
  email: EMAIL,

  location: {
    city: CITY,
    state: STATE,
    stateAbbr: STATE_ABBR,
    county: COUNTY,
    region: REGION,
    fullAddress: `${CITY}, ${STATE_ABBR}`,
    mapQuery: `${CITY},+${STATE_ABBR}`,
    geo: { lat: GEO_LAT, lng: GEO_LNG },
  },

  hero: {
    tagline: HERO_TAGLINE,
    headline: HERO_HEADLINE,
    description: HERO_DESCRIPTION,
    ctaText: HERO_CTA_TEXT,
    formHeading: FORM_HEADING,
    urgencyText: FORM_URGENCY_TEXT,
    reviews: { rating: REVIEW_RATING, count: REVIEW_COUNT },
    trustBadges: TRUST_BADGES,
  },

  stats: STATS,
  testimonials: testimonials,
  businessHours: BUSINESS_HOURS,

  services: SERVICES.map(s => ({ name: s.name, slug: s.slug })),

  serviceAreas: SERVICE_AREA_NAMES.map((entry, i) => {
    const name = typeof entry === 'string' ? entry : entry.name;
    const neighborhoods = typeof entry === 'object' && entry.neighborhoods
      ? entry.neighborhoods.map(n => ({ name: n, slug: toSlug(n) }))
      : [];
    return {
      name,
      slug: toSlug(name),
      ...(i === 0 ? { isPrimary: true } : {}),
      ...(neighborhoods.length > 0 ? { neighborhoods } : {}),
    };
  }),

  colors: {
    primary: PRIMARY_COLOR,
    primaryDark: PRIMARY_DARK,
    secondary: SECONDARY_COLOR,
    accent: ACCENT_COLOR,
    overlay: OVERLAY_COLOR,
    dark: "#1a1a1a",
    light: "#f5f5f5",
    white: "#ffffff",
    gray: "#555555",
  },

  images: {
    logo: getFirstImage("logo"),
    brandedTruck: getFirstImage("Branded-truck") || getFirstImage("branded-truck"),
    badges: {
      licensed: getFirstImage("Licensed") || getFirstImage("licensed"),
      award: getFirstImage("Award") || getFirstImage("award"),
      fiveStars: getFirstImage("Five-stars") || getFirstImage("five-stars") || getFirstImage("5-star"),
    },

    // Crew/fallback images — prefix MUST match generate-images.py ("paving-crew")
    installers: getImagesMatching("paving-crew"),

    // Decorative background slots (keys unchanged on purpose — see note at top)
    backgrounds: (() => {
      const fallback = getFirstImage("paving-crew");
      const serviceImages = SERVICES.map(s => getFirstImage(s.slug)).filter(Boolean);
      return {
        wood: serviceImages[0] || fallback,
        vinyl: serviceImages[1] || fallback,
        chainLink: serviceImages[2] || fallback,
        metal: serviceImages[3] || fallback,
        installer: fallback,
        commercial: serviceImages[4] || fallback,
        farmRanch: serviceImages[5] || fallback,
      };
    })(),

    heroMain: getFirstImage("hero") || getFirstImage("paving-crew"),

    serviceCards: Object.fromEntries(
      SERVICES.map(s => [s.slug, getFirstImage(s.slug) || getFirstImage("paving-crew")])
    ),

    gallery: SERVICES
      .map(s => getFirstImage(s.slug))
      .filter(Boolean)
      .slice(0, 6)
      .map(src => ({ src, alt: `Asphalt Paving in ${CITY}, ${STATE_ABBR}` })),

    serviceGalleries: Object.fromEntries(
      SERVICES.map(s => [
        s.slug,
        getImagesMatching(s.slug).length > 0
          ? getImagesMatching(s.slug)
          : getImagesMatching("paving-crew"),
      ])
    ),

    aboutWork: getFirstImage("paving-crew"),
    formImage: getFirstImage("form-image") || getFirstImage("paving-crew"),
  },

  seo: {
    titleTemplate: "{page} | {businessName}",
    defaultTitle: `${BUSINESS_NAME} | Asphalt Paving, Sealcoating & Repair in ${CITY}, ${STATE_ABBR}`,
    defaultDescription: `Professional asphalt paving contractor in ${CITY}, ${STATE_ABBR}. Driveways, parking lots, sealcoating, and repair. Call ${PHONE_DISPLAY} for a free estimate.`,
  },

  footerAbout: `${BUSINESS_NAME} provides asphalt paving, sealcoating, and repair for driveways and parking lots across ${CITY} and the surrounding Midlands. We build on a properly graded, compacted base so the surface lasts.`,

  social: { facebook: "", instagram: "", google: "", yelp: "" },

  forms: {
    action: "https://lead-form-handler.zak-b7e.workers.dev",
    clientEmail: CLIENT_EMAIL,
    serviceOptions: [
      ...SERVICES.map(s => ({ value: s.slug, label: s.name })),
      { value: "other", label: "Other" },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFullLocation() {
  return `${siteConfig.location.city}, ${siteConfig.location.stateAbbr}`;
}

export function getSeoTitle(pageTitle) {
  if (!pageTitle) return siteConfig.seo.defaultTitle;
  return `${pageTitle} | ${siteConfig.businessName}`;
}

export function getServiceBySlug(slug) {
  return siteConfig.services.find(s => s.slug === slug);
}

export function getServiceAreaBySlug(slug) {
  return siteConfig.serviceAreas.find(a => a.slug === slug);
}

export function getNeighborhoodBySlug(citySlug, neighborhoodSlug) {
  const area = getServiceAreaBySlug(citySlug);
  if (!area || !area.neighborhoods) return null;
  return area.neighborhoods.find(n => n.slug === neighborhoodSlug);
}
