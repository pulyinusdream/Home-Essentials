# Amazon Associates operating checklist

This checklist supports the website’s technical safeguards. It is not legal advice, and Amazon can update its agreement and program policies. Recheck the current official documents before launch and whenever Associates Central announces a change.

## Built into the website

- The required identity statement appears throughout the site: “As an Amazon Associate I earn from qualifying purchases.”
- A clear disclosure appears immediately before the Amazon action on each product page.
- Only HTTPS `amazon.com` product-detail URLs are accepted.
- URL credentials, custom ports, deceptive hostnames, non-product paths, ASIN mismatches, and missing tracking IDs are rejected.
- The exact verified Special Link is rendered directly in the anchor. The application does not shorten, cloak, rewrite, or route it through an intermediate redirect.
- A product cannot be published without an active category, complete editorial fields, an ASIN, an image with alt text, and an administrator-confirmed active link.
- Drafts, archived records, inactive categories, unverified links, and broken links are not publicly available.
- The application does not provide checkout, cart, payments, orders, fulfillment, or Amazon account features.
- The application does not invent reviews, star ratings, sales, prices, or availability.

## Product entry checklist

Before publishing each product:

1. Confirm that the product exists on Amazon.com for US shoppers.
2. Copy the ASIN from the real product detail page.
3. Generate the Associates Special Link using an Amazon-approved tool such as SiteStripe or an approved catalog API.
4. Paste the complete URL without shortening or modifying it.
5. Confirm that its `tag` value is the intended tracking ID.
6. Use an image you own, license, or receive through an Amazon-approved content API under its current license terms. Do not scrape or download arbitrary Amazon product images.
7. Write original commentary that explains the household need, recommendation, benefits, and tradeoffs.
8. Check every factual claim against a reliable source and avoid unsupported superlatives.
9. Preview the page and click the exact destination before publishing.

## Prices, availability, ratings, and reviews

Amazon’s current Linking Requirements limit price and availability display to data served by Amazon in the link or obtained through an approved Amazon catalog API under the applicable license. Home Essentials therefore hides prices by default, and the admin form does not accept manual live-price entry.

Do not copy Amazon customer reviews or star ratings. Amazon’s current Participation Requirements allow their use only through an approved API and subject to the applicable license. The present website intentionally has no public review or rating fields.

## Pinterest and other social channels

- Pinterest content should land on a useful Home Essentials product page or guide, not a thin or misleading bridge page.
- Follow Pinterest’s current commercial-content rules.
- If a social post itself contains an affiliate link, use a clear disclosure near that link and make the Amazon Associate identification available on the account as required by Amazon.
- Do not imply that Amazon sponsors, endorses, or owns Home Essentials.
- Do not use Amazon trademarks, logos, or Program Content outside the permissions granted by the current agreement.

## Catalog API

The website does not scrape Amazon. Automated product retrieval should be implemented only through the Amazon Creators API or another currently approved Amazon catalog interface after the Associates account is eligible and credentials are issued. Until then, enter verified product facts and Special Links manually and leave prices hidden.

## Official references checked November 8, 2026

- [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)
- [Amazon Associates Participation Requirements](https://affiliate-program.amazon.com/help/operating/participation/)
- [Amazon Associates Linking Requirements](https://affiliate-program.amazon.com/help/operating/linking/)
- [Amazon disclosure guidance](https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE)
- [Amazon Creators API documentation](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction)
