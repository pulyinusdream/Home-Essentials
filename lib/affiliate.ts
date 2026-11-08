export type AffiliateConfig = { tag?: string; approved?: boolean };

export function affiliateIsActive(config: AffiliateConfig = {}): boolean {
  return config.approved === true && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}-20$/.test(config.tag ?? '');
}

export function amazonProductUrl(asin: string, config: AffiliateConfig = {}): string {
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error('Invalid Amazon product identifier');
  const url = new URL(`https://www.amazon.com/dp/${asin}`);
  if (affiliateIsActive(config)) url.searchParams.set('tag', config.tag!);
  return url.toString();
}
