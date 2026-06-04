// ============================================================================
// CONTENT PROCESSING UTILITY
// ============================================================================
// Replaces template variables like {businessName}, {city}, etc.
// with actual values from siteConfig.
// ============================================================================

import { siteConfig } from '../config.js';

const replacements = {
  '{businessName}': siteConfig.businessName,
  '{city}': siteConfig.location.city,
  '{state}': siteConfig.location.state,
  '{stateAbbr}': siteConfig.location.stateAbbr,
  '{county}': siteConfig.location.county,
  '{region}': siteConfig.location.region,
  '{phone}': siteConfig.phone.display,
  '{niche}': siteConfig.niche,
  '{nicheLC}': siteConfig.nicheLC,
};

function replaceVariables(str) {
  if (typeof str !== 'string') return str;
  let result = str;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

export function processContent(obj) {
  if (typeof obj === 'string') return replaceVariables(obj);
  if (Array.isArray(obj)) return obj.map(item => processContent(item));
  if (obj && typeof obj === 'object') {
    const processed = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processContent(value);
    }
    return processed;
  }
  return obj;
}
