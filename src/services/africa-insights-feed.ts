import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  bundledInsightForDay,
  type BundledInsight,
} from '@/src/constants/africa-finance-digest';

const CACHE_KEY = 'uchumi-insights-rss-cache-v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 h

export type HomeInsightArticle = {
  title: string;
  summary: string;
  source: 'network' | 'bundle';
  bundled?: BundledInsight;
};

type CachePayload = {
  fetchedAt: number;
  titles: string[];
};

/** Extraction simple des titres RSS (sans dépendance XML lourde). */
function parseRssTitles(xml: string, max = 4): string[] {
  const out: string[] = [];
  const re =
    /<item[\s\S]*?<title(?:\s[^>]*)?>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(xml)) !== null && out.length < max) {
    let t = m[1]
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (t.length < 8 || t.toLowerCase().includes('rss')) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Flux RSS public (FR) — échoue silencieusement hors ligne / blocage.
 */
async function fetchRfiBusinessTitles(): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://www.rfi.fr/rss/business/', {
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, text/xml, */*' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssTitles(xml, 4);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function readCache(): Promise<CachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch {
    return null;
  }
}

async function writeCache(titles: string[]): Promise<void> {
  const payload: CachePayload = {
    fetchedAt: Date.now(),
    titles,
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

/**
 * Retourne une carte « actu / idée » : réseau + cache si possible, sinon contenu 100 % local.
 */
export async function loadHomeInsightArticle(): Promise<HomeInsightArticle> {
  const bundle = bundledInsightForDay();

  const cached = await readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS && cached.titles.length > 0) {
    const title = cached.titles[0];
    return {
      title,
      summary:
        'Actualité récente (cache). Sans connexion, UCHUMI affiche ce qui a été mis en cache lors du dernier succès.',
      source: 'network',
    };
  }

  const remoteTitles = await fetchRfiBusinessTitles();
  if (remoteTitles.length > 0) {
    await writeCache(remoteTitles);
    return {
      title: remoteTitles[0],
      summary:
        'Fil RFI Business (réseau). Les titres sont mis en cache en local pour une lecture hors ligne.',
      source: 'network',
    };
  }

  if (cached && cached.titles.length > 0) {
    return {
      title: cached.titles[0],
      summary:
        'Hors ligne — affichage du dernier enregistrement en cache (plus ancien possible).',
      source: 'network',
    };
  }

  return {
    title: bundle.title,
    summary: bundle.summary,
    source: 'bundle',
    bundled: bundle,
  };
}
