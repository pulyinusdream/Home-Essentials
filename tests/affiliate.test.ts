import test from 'node:test';
import assert from 'node:assert/strict';
import { amazonProductUrl, affiliateIsActive } from '../lib/affiliate.ts';

test('unconfigured and unapproved links never contain a tracking tag', () => {
  assert.equal(amazonProductUrl('B072R6CLRC'), 'https://www.amazon.com/dp/B072R6CLRC');
  assert.equal(amazonProductUrl('B072R6CLRC', { tag: 'home-20', approved: false }), 'https://www.amazon.com/dp/B072R6CLRC');
});
test('approved valid US tracking ID is applied only to the canonical product destination', () => {
  const url = new URL(amazonProductUrl('B072R6CLRC', { tag: 'home-20', approved: true }));
  assert.equal(url.origin, 'https://www.amazon.com');
  assert.equal(url.pathname, '/dp/B072R6CLRC');
  assert.equal(url.searchParams.get('tag'), 'home-20');
});
test('malformed IDs, foreign suffixes and injection attempts never activate affiliation', () => {
  for (const tag of ['', 'a-21', 'https://bad.example', 'a-20&redirect=x', 'a b-20']) {
    assert.equal(affiliateIsActive({ tag, approved: true }), false);
    assert.equal(new URL(amazonProductUrl('B072R6CLRC', { tag, approved: true })).search, '');
  }
});
test('malformed product identifiers are rejected before creating URLs', () => {
  for (const asin of ['x', 'B072R6CLRC?x=1', '//bad.com', 'b072r6clrc']) {
    assert.throws(() => amazonProductUrl(asin));
  }
});
