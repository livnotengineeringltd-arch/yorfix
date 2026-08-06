# YorFix

Handyman and home services website for Sheffield and South Yorkshire.
Tagline: **One Call Sorts It All**

Live site: https://yorfix.com/ (also reachable at the underlying
https://livnotengineeringltd-arch.github.io/yorfix/, and yorfix.co.uk
redirects to yorfix.com via a Cloudflare rule)

## What this is

A fully static, mobile-first site (plain HTML/CSS/JS, no build step) hosted on
GitHub Pages, with a real bookings database behind it:

- `index.html` is the public site: rotating hero, nine service cards with
  indicative pricing, areas covered, trust badges, booking
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

## Contact details

- Phone and SMS: `07757 807529` (the real business mobile, live in
  `index.html`, `js/config.js` and the flyer).
- WhatsApp: same mobile (`447757807529`).
- Email: `hello@yorfix.com`, delivered by Cloudflare Email Routing, which
  forwards it into an existing inbox rather than creating a new mailbox. It is
  receive-only: replies go out from the personal address behind it. The old
  `hello@yorfix.co.uk` was never set up and bounced every message, so it was
  retired on 1 August 2026.

## Placeholders still to replace before real marketing

- Social media URLs in the footer (currently pointing at unregistered handles).
- Hero photos are Unsplash stock, replace with photos of the real team.

## Reviews policy (important)

The site launched with six invented customer reviews, a fabricated "4.9/5 from
187 reviews" badge, `aggregateRating` schema markup, and six fictional
commercial client logos. All of it was removed on 1 August 2026 because
publishing fake reviews or fake endorsements is a criminal offence under the
Digital Markets, Competition and Consumers Act 2024, and the schema markup was
feeding invented star ratings straight into Google search results.

The reviews section is now an honest "Our promise" block. When real reviews
arrive, add them with the customer's genuine words and permission. Never
re-add `aggregateRating` until the rating it states is real and verifiable.

## Deploying changes

Push to `main` and GitHub Pages redeploys automatically within a minute or two.
