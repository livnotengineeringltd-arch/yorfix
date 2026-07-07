# YorFix

Handyman and home services website for Sheffield and South Yorkshire.
Tagline: **One Call Sorts It All**

Live site: https://livnotengineeringltd-arch.github.io/yorfix/

## What this is

A fully static, mobile-first site (plain HTML/CSS/JS, no build step) hosted on
GitHub Pages, with a real bookings database behind it:

- `index.html` is the public site: rotating hero, nine service cards with
  indicative pricing, areas covered, trust badges, reviews carousel, booking
  form, FAQ, contact form and footer.
- `admin.html` is the bookings dashboard. It asks for an admin token once per
  device and then shows every booking and contact message with status
  management (new, contacted, scheduled, done, cancelled) and delete.
- Bookings and messages are stored in a Postgres database (Supabase). The
  public key in `js/config.js` can only INSERT rows; row level security blocks
  every read. Admin reads go through token-checked database functions, so the
  admin page is safe to host publicly.
- `flyer/` contains a print-ready A5 flyer (PDF) with a QR code that links to
  this site.

## Placeholders to replace before real marketing

- Phone number `0114 496 0123` (an Ofcom drama-range placeholder) in
  `index.html`, `js/config.js` and the flyer.
- WhatsApp number `447700900123` in `index.html` and `js/config.js`.
- Email `hello@yorfix.co.uk` (domain not registered yet).
- Social media URLs in the footer (currently pointing at unregistered handles).
- Commercial client logos in the trust section (fictional example names).
- Reviews are illustrative examples, swap for real ones as they arrive.
- Hero photos are Unsplash stock, replace with photos of the real team.

## Deploying changes

Push to `main` and GitHub Pages redeploys automatically within a minute or two.
