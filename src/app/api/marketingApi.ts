export interface ApiSportsEvent {
  sportEventId?: number;
  opponent1NameLocalization?: string | null;
  opponent2NameLocalization?: string | null;
  tournamentNameLocalization?: string | null;
  startDate?: number;
  sportId?: number;
}

export interface SportsEvent {
  id: string;
  team1: string;
  team2: string;
  team1En?: string;
  team2En?: string;
  league: string;
  date: string;
  time: string;
  sport: string;
  country: string;
  popularity: 'top' | 'medium' | 'low';
  eventDate: Date;
  commDate: Date;
}

export interface SportOption {
  id: number;
  name: string;
}

export interface CountryOption {
  id: number;
  name: string;
}

type CountryResolver = (tournamentName: string) => string;

interface ListResponse<T> {
  items?: T[];
}

interface AccessTokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface LocalizedCountryDto {
  id?: number;
  localized?: Record<string, string | undefined>;
}

interface CachedValue<T> {
  value: T;
  expiresAt: number;
}

const TOKEN_ENDPOINT = '/api/token';
const EVENTS_ENDPOINT = '/api/marketing/datafeed/prematch/api/v2/sportevents';
const SPORTS_DIRECTORY_ENDPOINT = '/api/marketing/datafeed/directories/api/v2/sports';
const COUNTRIES_DIRECTORY_ENDPOINT = '/api/marketing/datafeed/directories/api/v1/countries';
const COUNTRIES_DIRECTORY_V3_ENDPOINT = '/api/marketing/datafeed/directories/api/v3/countries';

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const DIRECTORY_CACHE_TTL_MS = 5 * 60 * 1000;

let accessTokenCache: CachedValue<string> | null = null;
let accessTokenRequest: Promise<string> | null = null;
let sportsDictionaryCache: CachedValue<Map<number, string>> | null = null;
let sportsDictionaryRequest: Promise<Map<number, string>> | null = null;
const countriesCacheByLanguage = new Map<string, CachedValue<CountryOption[]>>();
const countriesRequestByLanguage = new Map<string, Promise<CountryOption[]>>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(input: string, init?: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === retries) {
        return response;
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }

    await delay((attempt + 1) * 300);
  }

  throw new Error('Unexpected retry state');
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeGenitiveCountry(word: string): string {
  const trimmed = word.trim();
  if (!trimmed) {
    return 'Международные';
  }

  // Преобразуем самые частые русские формы: Германии -> Германия, Англии -> Англия.
  if (trimmed.endsWith('ии')) {
    return `${trimmed.slice(0, -2)}ия`;
  }

  return trimmed;
}

function normalizeCountryName(name: string): string {
  return name.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е');
}

const FALLBACK_COUNTRY_ALIASES = new Map<string, string>([
  ['англия', 'Англия'],
  ['англии', 'Англия'],
  ['германия', 'Германия'],
  ['германии', 'Германия'],
  ['испания', 'Испания'],
  ['испании', 'Испания'],
  ['италия', 'Италия'],
  ['италии', 'Италия'],
  ['франция', 'Франция'],
  ['франции', 'Франция'],
  ['россия', 'Россия'],
  ['россии', 'Россия'],
  ['турция', 'Турция'],
  ['турции', 'Турция'],
  ['иран', 'Иран'],
  ['ирана', 'Иран'],
  ['азербайджан', 'Азербайджан'],
  ['азербайджана', 'Азербайджан'],
  ['оман', 'Оман'],
  ['омана', 'Оман'],
  ['ливан', 'Ливан'],
  ['ливана', 'Ливан'],
  ['палестина', 'Палестина'],
  ['палестины', 'Палестина'],
  ['сирия', 'Сирия'],
  ['сирии', 'Сирия'],
  ['казахстан', 'Казахстан'],
  ['казахстана', 'Казахстан'],
  ['украина', 'Украина'],
  ['украины', 'Украина'],
  ['беларусь', 'Беларусь'],
  ['беларуси', 'Беларусь'],
  ['польша', 'Польша'],
  ['польши', 'Польша'],
  ['нидерланды', 'Нидерланды'],
  ['нидерландов', 'Нидерланды'],
  ['португалия', 'Португалия'],
  ['португалии', 'Португалия'],
  ['бразилия', 'Бразилия'],
  ['бразилии', 'Бразилия'],
  ['аргентина', 'Аргентина'],
  ['аргентины', 'Аргентина'],
  ['сша', 'США'],
  ['канада', 'Канада'],
  ['канады', 'Канада'],
]);

function resolveKnownCountryName(candidate: string, exactNames?: Map<string, string>): string | null {
  const normalized = normalizeCountryName(candidate);
  if (!normalized) {
    return null;
  }

  return exactNames?.get(normalized) || FALLBACK_COUNTRY_ALIASES.get(normalized) || null;
}

function createCountryResolver(countries: CountryOption[]): CountryResolver {
  const exactNames = new Map<string, string>();

  for (const country of countries) {
    exactNames.set(normalizeCountryName(country.name), country.name);
  }

  return (tournamentName: string) => {
    const trimmed = tournamentName.trim();
    if (!trimmed) {
      return 'Международные';
    }

    const championshipMatch = trimmed.match(/^Чемпионат\s+([^.]+)\./i);
    if (championshipMatch?.[1]) {
      const matchedCountry = resolveKnownCountryName(normalizeGenitiveCountry(championshipMatch[1]), exactNames);
      if (matchedCountry) {
        return matchedCountry;
      }
    }

    const cupMatch = trimmed.match(/^(?:Кубок|Суперкубок)\s+([^.]+?)(?:\.|$)/i);
    if (cupMatch?.[1]) {
      const matchedCountry = resolveKnownCountryName(normalizeGenitiveCountry(cupMatch[1]), exactNames);
      if (matchedCountry) {
        return matchedCountry;
      }
    }

    const beforeDot = trimmed.split('.')[0]?.trim() || '';
    if (beforeDot) {
      const matchedCountry = resolveKnownCountryName(beforeDot, exactNames);
      if (matchedCountry) {
        return matchedCountry;
      }
    }

    return extractCountryFromTournamentName(trimmed);
  };
}

function extractCountryFromTournamentName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Международные';
  }

  const championshipMatch = trimmed.match(/^Чемпионат\s+([^.]+)\./i);
  if (championshipMatch?.[1]) {
    return resolveKnownCountryName(normalizeGenitiveCountry(championshipMatch[1])) || 'Международные';
  }

  const cupMatch = trimmed.match(/^(?:Кубок|Суперкубок)\s+([^.]+?)(?:\.|$)/i);
  if (cupMatch?.[1]) {
    return resolveKnownCountryName(normalizeGenitiveCountry(cupMatch[1])) || 'Международные';
  }

  // Лиги без явной страны в названии объединяем в международные.
  if (/^(кхл|khl|nhl|nba|uefa|fifa|лига чемпионов|лига европы|лига конференций)\b/i.test(trimmed)) {
    return 'Международные';
  }

  const beforeDot = trimmed.split('.')[0]?.trim() || '';
  if (beforeDot) {
    return resolveKnownCountryName(beforeDot) || 'Международные';
  }

  return 'Международные';
}

function getPopularity(index: number): SportsEvent['popularity'] {
  if (index < 5) {
    return 'top';
  }

  if (index < 15) {
    return 'medium';
  }

  return 'low';
}

function toDateOnlyISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function toTimeString(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (accessTokenCache && accessTokenCache.expiresAt > now) {
    return accessTokenCache.value;
  }

  if (accessTokenRequest) {
    return accessTokenRequest;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  accessTokenRequest = (async () => {
    const response = await fetchWithRetry(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      throw new Error(`OAuth request failed with status ${response.status}`);
    }

    const data = (await response.json()) as AccessTokenResponse;
    if (!data.access_token) {
      throw new Error('OAuth response does not contain access_token');
    }

    const ttlMs = Math.max(((data.expires_in ?? 3600) - 60) * 1000, 60_000);
    accessTokenCache = {
      value: data.access_token,
      expiresAt: Date.now() + ttlMs
    };

    return data.access_token;
  })();

  try {
    return await accessTokenRequest;
  } finally {
    accessTokenRequest = null;
  }
}

async function loadSportsDictionary(ref: string, token: string): Promise<Map<number, string>> {
  const now = Date.now();
  if (sportsDictionaryCache && sportsDictionaryCache.expiresAt > now) {
    return sportsDictionaryCache.value;
  }

  if (sportsDictionaryRequest) {
    return sportsDictionaryRequest;
  }

  const url = new URL(SPORTS_DIRECTORY_ENDPOINT, window.location.origin);
  url.searchParams.set('ref', ref);

  sportsDictionaryRequest = (async () => {
    const response = await fetchWithRetry(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return new Map<number, string>();
    }

    const payload = (await response.json()) as ListResponse<{ id?: number; name?: string | null }>;
    const map = new Map<number, string>();

    for (const item of payload.items || []) {
      if (typeof item.id === 'number' && item.name) {
        map.set(item.id, item.name);
      }
    }

    sportsDictionaryCache = {
      value: map,
      expiresAt: Date.now() + DIRECTORY_CACHE_TTL_MS
    };

    return map;
  })();

  try {
    return await sportsDictionaryRequest;
  } finally {
    sportsDictionaryRequest = null;
  }
}

async function loadSportsOptions(ref: string, token: string): Promise<SportOption[]> {
  const map = await loadSportsDictionary(ref, token);

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

async function loadCountryOptions(token: string, language = 'ru'): Promise<CountryOption[]> {
  const now = Date.now();
  const cached = countriesCacheByLanguage.get(language);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = countriesRequestByLanguage.get(language);
  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
  const v1Countries = await loadCountryOptionsV1(token, language);
    const countries = v1Countries.length > 0 ? v1Countries : await loadCountryOptionsV3(token, language);

    countriesCacheByLanguage.set(language, {
      value: countries,
      expiresAt: Date.now() + DIRECTORY_CACHE_TTL_MS
    });

    return countries;
  })();

  countriesRequestByLanguage.set(language, request);

  try {
    return await request;
  } finally {
    countriesRequestByLanguage.delete(language);
  }
}

async function loadCountryOptionsV1(token: string, language: string): Promise<CountryOption[]> {
  const url = new URL(COUNTRIES_DIRECTORY_ENDPOINT, window.location.origin);
  url.searchParams.set('lng', language);

  const response = await fetchWithRetry(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as ListResponse<{ id?: number; name?: string | null }> | Array<{ id?: number; name?: string | null }>;
  const items = Array.isArray(payload) ? payload : payload.items || [];

  return items
    .filter((item): item is { id: number; name: string } => typeof item.id === 'number' && Boolean(item.name))
    .map((item) => ({ id: item.id, name: item.name }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

async function loadCountryOptionsV3(token: string, language: string): Promise<CountryOption[]> {
  const url = new URL(COUNTRIES_DIRECTORY_V3_ENDPOINT, window.location.origin);
  url.searchParams.set('languages', language);

  const response = await fetchWithRetry(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as LocalizedCountryDto[];

  return payload
    .map((item) => ({
      id: item.id,
      name: item.localized?.[language]
    }))
    .filter((item): item is { id: number; name: string } => typeof item.id === 'number' && Boolean(item.name))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

async function loadApiSportsEvents(
  ref: string,
  token: string,
  language: string,
  options?: {
    sportId?: number;
    tournamentCountryId?: number;
    count?: number;
  }
): Promise<ApiSportsEvent[]> {
  const requestedCount = options?.count ?? 100;
  const fallbackCounts = [requestedCount];

  if (requestedCount > 100) {
    fallbackCounts.push(100);
  }
  if (requestedCount > 50) {
    fallbackCounts.push(50);
  }

  const uniqueCounts = Array.from(new Set(fallbackCounts));
  let lastStatus: number | null = null;

  for (const count of uniqueCounts) {
    const url = new URL(EVENTS_ENDPOINT, window.location.origin);
    url.searchParams.set('ref', ref);
    url.searchParams.set('lng', language);
    url.searchParams.set('count', String(count));
    if (options?.sportId) {
      url.searchParams.set('sportIds', String(options.sportId));
    }
    if (options?.tournamentCountryId) {
      url.searchParams.set('tournamentCountryIds', String(options.tournamentCountryId));
    }

    const response = await fetchWithRetry(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      const payload = (await response.json()) as ListResponse<ApiSportsEvent>;
      return payload.items || [];
    }

    lastStatus = response.status;
    if (!RETRYABLE_STATUS.has(response.status)) {
      break;
    }
  }

  throw new Error(`Events request failed with status ${lastStatus ?? 'unknown'}`);
}

function mapApiEventToUiEvent(
  event: ApiSportsEvent,
  sportNameById: Map<number, string>,
  index: number,
  resolveCountry: CountryResolver,
  englishNamesById: Map<number, { team1?: string; team2?: string }>,
  countryOverride?: string
): SportsEvent | null {
  const eventId = event.sportEventId;
  const team1 = event.opponent1NameLocalization?.trim();
  const team2 = event.opponent2NameLocalization?.trim();
  const league = event.tournamentNameLocalization?.trim();
  const startDateSeconds = event.startDate;

  if (!eventId || !team1 || !team2 || !league || !startDateSeconds) {
    return null;
  }

  const eventDate = new Date(startDateSeconds * 1000);
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }

  const commDate = new Date(eventDate);
  commDate.setDate(commDate.getDate() - 3);

  const sport = event.sportId ? sportNameById.get(event.sportId) || `Sport #${event.sportId}` : 'Unknown sport';
  const englishNames = englishNamesById.get(eventId);

  return {
    id: String(eventId),
    team1,
    team2,
    team1En: englishNames?.team1,
    team2En: englishNames?.team2,
    league,
    date: toDateOnlyISO(eventDate),
    time: toTimeString(eventDate),
    sport,
    country: countryOverride || resolveCountry(league),
    popularity: getPopularity(index),
    eventDate,
    commDate
  };
}

async function getApiConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const clientId = requireEnv('VITE_CLIENT_ID', env.VITE_CLIENT_ID || env.CLIENT_ID);
  const clientSecret = requireEnv('VITE_CLIENT_SECRET', env.VITE_CLIENT_SECRET || env.CLIENT_SECRET);
  const ref = requireEnv('VITE_REF', env.VITE_REF || env.REF);

  const accessToken = await getAccessToken(clientId, clientSecret);

  return {
    ref,
    accessToken
  };
}

export async function loadAvailableSports(): Promise<SportOption[]> {
  const { ref, accessToken } = await getApiConfig();

  return loadSportsOptions(ref, accessToken);
}

export async function loadAvailableCountries(language = 'ru'): Promise<CountryOption[]> {
  const { accessToken } = await getApiConfig();

  return loadCountryOptions(accessToken, language);
}

export async function loadPrematchEvents(
  language = 'ru',
  options?: {
    sportId?: number;
    tournamentCountryId?: number;
    tournamentCountryName?: string;
    count?: number;
    includeEnglishNames?: boolean;
  }
): Promise<SportsEvent[]> {
  const { ref, accessToken } = await getApiConfig();
  const includeEnglishNames = options?.includeEnglishNames ?? true;
  const englishItemsPromise = includeEnglishNames
    ? loadApiSportsEvents(ref, accessToken, 'en', options).catch(() => [] as ApiSportsEvent[])
    : Promise.resolve([] as ApiSportsEvent[]);

  const [sportNameById, countries, localizedItems, englishItems] = await Promise.all([
    loadSportsDictionary(ref, accessToken),
    loadCountryOptions(accessToken, language),
    loadApiSportsEvents(ref, accessToken, language, options),
    englishItemsPromise
  ]);
  const resolveCountry = createCountryResolver(countries);
  const englishNamesById = new Map<number, { team1?: string; team2?: string }>();

  for (const event of englishItems) {
    if (typeof event.sportEventId === 'number') {
      englishNamesById.set(event.sportEventId, {
        team1: event.opponent1NameLocalization?.trim() || undefined,
        team2: event.opponent2NameLocalization?.trim() || undefined,
      });
    }
  }

  return localizedItems
    .map((event, index) => mapApiEventToUiEvent(event, sportNameById, index, resolveCountry, englishNamesById, options?.tournamentCountryName))
    .filter((event): event is SportsEvent => Boolean(event));
}
