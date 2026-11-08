import { affiliateIsActive } from './affiliate';

export const site = {
  name: 'Home Essentials',
  origin: 'https://home-essentials-us.youraicompanion0.chatgpt.site',
  email: process.env.CONTACT_EMAIL ?? '',
  pinterest: process.env.PINTEREST_URL ?? '',
  affiliate: {
    tag: process.env.AMAZON_ASSOCIATE_TAG ?? '',
    approved: process.env.AMAZON_ASSOCIATES_APPROVED === 'true',
  },
};
export const affiliateActive = affiliateIsActive(site.affiliate);
export const disclosureText = affiliateActive
  ? 'As an Amazon Associate I earn from qualifying purchases.'
  : 'Amazon links currently open without an affiliate tracking ID. We do not earn a commission from these links.';
