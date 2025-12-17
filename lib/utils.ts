// lib/utils.ts
import type { Lang } from './types';

export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Build href yang sudah diprefix dengan /{lang} untuk route lokal.
 *
 * Aturan:
 * - "#anchor"  -> tetap "#anchor"
 * - "https://..." atau "http://..." -> tetap
 * - "request" / "/request"         -> "/id/request" atau "/en/request"
 * - "/id/request" atau "/en/xxx"   -> dibiarkan (nggak diprefix dua kali)
 */
export function buildLangHref(lang: Lang, href: string): string {
  if (!href) return href;

  // 1) Anchor: #layanan, #faq, dll → jangan diotak-atik
  if (href.startsWith('#')) return href;

  // 2) External link → jangan di-prefix
  if (/^https?:\/\//i.test(href)) return href;

  // 3) Normalisasi: buang semua leading slash
  const cleaned = href.replace(/^\/+/, ''); // "/request" -> "request"

  // 4) Kalau sudah diawali "id" atau "en" anggap sudah lang-specific
  const [firstSegment] = cleaned.split('/');
  if (firstSegment === 'id' || firstSegment === 'en') {
    return `/${cleaned}`; // pastikan ada satu leading slash
  }

  // 5) Default: prefix dengan /{lang}
  return `/${lang}/${cleaned}`;
}