import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

export interface CountryItem {
  iso: CountryCode;
  name: string;
  dialCode: string; // e.g. "+91"
  flag: string;
  isPopular?: boolean;
}

// Generate emoji flag from 2-letter ISO country code
export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '🌐';
  const codePoints = code
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Comprehensive dictionary for standard fallback names
const COUNTRY_NAME_FALLBACKS: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  SG: 'Singapore',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  IE: 'Ireland',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  BR: 'Brazil',
  MX: 'Mexico',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  TH: 'Thailand',
  VN: 'Vietnam',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  NP: 'Nepal',
  QA: 'Qatar',
  KW: 'Kuwait',
  OM: 'Oman',
  BH: 'Bahrain',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  GH: 'Ghana',
  IL: 'Israel',
  TR: 'Turkey',
  PL: 'Poland',
  BE: 'Belgium',
  AT: 'Austria',
  PT: 'Portugal',
  GR: 'Greece',
  CZ: 'Czech Republic',
  RO: 'Romania',
  HU: 'Hungary',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
};

// Popular countries prioritized at the top of the selector
export const POPULAR_COUNTRY_CODES: CountryCode[] = [
  'IN', // India (company default)
  'US', // United States
  'GB', // United Kingdom
  'CA', // Canada
  'AU', // Australia
  'AE', // UAE
  'SA', // Saudi Arabia
  'SG', // Singapore
  'DE', // Germany
  'FR', // France
];

let regionDisplayNames: Intl.DisplayNames | null = null;
try {
  if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
    regionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  }
} catch {
  regionDisplayNames = null;
}

export function resolveCountryName(iso: string): string {
  if (regionDisplayNames) {
    try {
      const name = regionDisplayNames.of(iso);
      if (name) return name;
    } catch {
      // Fallback
    }
  }
  return COUNTRY_NAME_FALLBACKS[iso] || iso;
}

// Build static country catalog
export function getAllCountries(): CountryItem[] {
  const supportedISOs = getCountries();
  const list: CountryItem[] = [];

  for (const iso of supportedISOs) {
    try {
      const callingCode = getCountryCallingCode(iso);
      const name = resolveCountryName(iso);
      const flag = getFlagEmoji(iso);
      const isPopular = POPULAR_COUNTRY_CODES.includes(iso);

      list.push({
        iso,
        name,
        dialCode: `+${callingCode}`,
        flag,
        isPopular,
      });
    } catch {
      // Skip if country metadata issue
    }
  }

  // Sort alphabetically by name
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export const ALL_COUNTRIES: CountryItem[] = getAllCountries();

export const POPULAR_COUNTRIES: CountryItem[] = POPULAR_COUNTRY_CODES
  .map(code => ALL_COUNTRIES.find(c => c.iso === code))
  .filter((c): c is CountryItem => Boolean(c));
