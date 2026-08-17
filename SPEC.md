\# PYRAMEDIA X — WEBSITE REBUILD: MASTER BUILD PROMPT

\*\*Version 1.1 — Approved by Founder (Abdou); reconfirmed \& amended in founder session 17 July 2026\*\*

\*\*Target agents: Claude Code / Codex. This document is the single source of truth. Follow it exactly.\*\*



\---



\## 1. MISSION



You are the lead engineer and designer building the new official website for \*\*PyramediaX\*\* (legal name: PYRAMEDIAX MARKETING MANAGEMENT L.L.C S.O.C), a Dubai-licensed \*\*full-service digital marketing agency\*\* based in Deira, Port Saeed, Dubai.



This is a \*\*complete rebuild that replaces\*\* the current site at `https://pyramedia.info`. The old site (Laravel template with fabricated case studies, fake testimonials, and a stale phone number) will be deleted. Nothing from it is reused.



\*\*Business goals, in strict priority order:\*\*

1\. \*\*B2B credibility\*\* — prospects from cold outreach (law firms, clinics, real-estate companies in Dubai) open this site after a call. It must close the credibility gap instantly.

2\. \*\*Lead generation\*\* — WhatsApp-first conversion, plus a form wired into the agency's own CRM.

3\. \*\*SEO foundations\*\* — clean architecture, speed, and structured data. No content-volume play at launch.



\*\*Strategic bet:\*\* the agency launches with \*\*no portfolio section\*\*. Therefore \*\*the website itself is the case study\*\*. Design quality, motion craft, speed, and bilingual polish must be at the level of award-winning agency sites. If a visitor thinks "if they built this for themselves, they can build for me" — the site has done its job.



\---



\## 2. NON-NEGOTIABLE RULES (THE CONSTITUTION)



Violating any rule below is a failed build, regardless of how good everything else is.



\### 2.1 Zero fabrication

\- \*\*No invented numbers, statistics, counters, percentages, client results, testimonials, awards, badges, team sizes, or "years of experience" claims. None.\*\*

\- The ONLY factual claims allowed on the site are those listed in \*\*§4 APPROVED FACTS\*\*. If a fact is not in that list, it does not appear on the site.

\- No stats counters of any kind (no "500+ projects", no "98% satisfaction"). Do not build counter components at all.

\- No testimonials section at launch.

\- No stock photos of offices, teams, or handshakes. No AI-generated humans.

\- Qualitative value propositions ("we build systems, not one-off posts") are allowed. Quantitative or verifiable-sounding claims that are not in §4 are forbidden.

\- Never render partner badges or imply certification/partnership with Google, Meta, or any platform. Naming tools we work with in plain text is allowed.



\### 2.2 Positioning

\- PyramediaX is a \*\*full-service digital marketing agency\*\*: Branding, Social Media \& Content, Web Design \& Development, Performance Ads, SEO. \*\*AI \& Automation is one service in the stack — never the headline identity.\*\*

\- Never describe the company as an "AI agency" or "AI-powered agency". The old site's "AI-Powered Marketing Solutions" framing is explicitly banned.



\### 2.3 Contact identity

\- Official phone \& WhatsApp: \*\*+971 56 579 9505\*\* (wa.me link: `https://wa.me/971565799505`). This is the ONLY number on the site.

\- The old number \*\*+971567249440 must never appear anywhere\*\* in the codebase. A grep for `567249440` must return zero results.

\- Official email: \*\*info@pyramedia.info\*\*.



\### 2.4 Arabic is first-class

\- Arabic is a native version of the site, not a translation afterthought. Full RTL mirroring, native Arabic copywriting (Modern Standard Arabic with a light Gulf tone), Arabic typography treated with the same design care as English.

\- Never machine-translate. Write Arabic natively, preserving the factual scope defined in this document.

\- The brand tagline \*\*"Less Talk. More Performance."\*\* stays in English on both language versions — it is a brand mark, not body copy.



\### 2.5 Performance is a feature

\- Strong, impressive motion design is required (see §8) — but implemented with GPU-cheap techniques only. The site must feel premium AND load instantly. Both. Never trade one for the other.

\- Hard budgets in §12 are gates, not suggestions.



\### 2.6 No placeholder text ships

\- No lorem ipsum anywhere. Missing assets use the explicit placeholder system in §14, clearly marked with `TODO:` code comments.



\---



\## 3. TECH STACK



| Layer | Choice | Notes |

|---|---|---|

| Framework | \*\*Astro (latest v5.x)\*\*, `output: 'static'` | Pure static output — the host is shared hosting (no Node runtime). |

| Styling | \*\*Tailwind CSS v4\*\* | Design tokens as CSS variables via `@theme`. |

| Content | Astro \*\*Content Collections\*\*: MDX + JSON | All copy lives in content files, never hardcoded in components. Owner edits content via Claude Code. |

| Animation | \*\*GSAP + ScrollTrigger\*\*, \*\*Lenis\*\* smooth scroll, Astro \*\*View Transitions\*\* | See motion spec §8. |

| Icons | \*\*lucide\*\* (consistent 1.5px stroke) | Via astro-icon or inline SVG. |

| Fonts (AR) | \*\*Cairo\*\* (400/500/700/800) — self-hosted via @fontsource, Arabic subset, `font-display: swap`, preload woff2 | Fallback: Tajawal, system. |

| Fonts (EN) | \*\*Space Grotesk\*\* (display) + \*\*Inter\*\* (body) — self-hosted, subset | |

| Images | `astro:assets` — AVIF/WebP, responsive, lazy below fold | |

| Analytics | GA4 + Meta Pixel via \*\*Partytown\*\* (web worker), loaded only after consent | §10. |

| Hosting | \*\*Bluehost shared hosting\*\* (Apache) — deploy static `dist/` to site root | Domain `pyramedia.info` is registered at Bluehost. |

| CI/CD | \*\*GitHub Actions\*\* → FTPS deploy on push to `main` | §13. |



Repository name: `pyramedia-website`. Node 22, npm. Include `.nvmrc`, `README.md` with local-dev + deploy + content-editing instructions.



\---



\## 4. APPROVED FACTS (the complete whitelist of claims)



These are the ONLY facts the site may state:



\- Legal name: \*\*PYRAMEDIAX MARKETING MANAGEMENT L.L.C\*\* — Dubai Trade License \*\*No. 1485511\*\*. (Footer + About trust line.)

\- Brand name: \*\*PyramediaX\*\* (logo lockup: PYRAMEDIA X). Tagline: \*\*"Less Talk. More Performance."\*\*

\- Full-service digital marketing agency based in \*\*Deira, Port Saeed, Dubai, UAE\*\*, serving the UAE \& GCC.

\- Services: the six services in §7.3, exactly as scoped there.

\- Phone/WhatsApp: \*\*+971 56 579 9505\*\* · Email: \*\*info@pyramedia.info\*\* · Website: pyramedia.info

\- Office address: `\[TODO\_OFFICE\_ADDRESS\_EN]` / `\[TODO\_OFFICE\_ADDRESS\_AR]` + Google Maps embed `\[TODO\_MAPS\_EMBED\_URL]` (owner supplies — see §14).

\- Clients (logo strip ONLY — names/logos, zero claims about results):

&#x20; 1. Injazat Services Group (مجموعة إنجازات)

&#x20; 2. Etmam Center for Judicial Services (مركز إتمام للخدمات القضائية)

&#x20; 3. Mazaya Platinum Real Estate

&#x20; 4. Bashayer Real Estate

&#x20; 5. SynthCity DXB

\- Founder: \*\*Mohamed Abdou — Founder \& CEO\*\*. Leads strategy across marketing and automation. (No other biographical claims.)

\- Social profiles: instagram.com/pyramedia.dxb · facebook.com/pyramedia.official · linkedin.com/company/pyramedia-dxb

\- Work methodology (§7.1 section 4): Data → Analysis → Decision → Execution → Result → Optimization.

\- Differentiators (§7.1 section 5) — qualitative only, as written there.



\---



\## 5. INFORMATION ARCHITECTURE \& URLS



English lives at the root. Arabic mirrors it under `/ar/` with identical slugs. `dir="rtl" lang="ar"` on Arabic pages; `hreflang` pairs on every page + `x-default` → English.



```

/                        /ar/

/about                   /ar/about

/services                /ar/services

/services/social-media   /ar/services/social-media

/services/branding       /ar/services/branding

/services/web-development /ar/services/web-development

/services/performance-ads /ar/services/performance-ads

/services/seo            /ar/services/seo

/services/ai-solutions   /ar/services/ai-solutions

/contact                 /ar/contact

/privacy                 /ar/privacy

/terms                   /ar/terms

```



No portfolio, no blog, no sector pages, no testimonials, no FAQ page at launch — do not scaffold them.



\### 5.1 301 redirect map (old live URLs → new)

Ship these in `.htaccess` (§13.2). The old site has indexed URLs that must not 404:



```

/en, /en/                                          → /

/en/about                                          → /about

/en/services                                       → /services

/en/services/advanced-search-engine-optimization   → /services/seo

/en/services/digital-marketing                     → /services

/en/services/targeted-social-media-marketing       → /services/social-media

/en/services/marketing-automation                  → /services/ai-solutions

/en/services/high-converting-ppc-advertising       → /services/performance-ads

/en/services/brand-strategy                        → /services/branding

/en/contact                                        → /contact

/en/privacy-policy                                 → /privacy

/en/terms-and-conditions                           → /terms

/en/portfolio(/\*)? , /en/blog(/\*)? , /en/testimonials , /en/faq → /

/language/ar                                       → /ar/

```

Also: force HTTPS, canonical non-www.



\---



\## 6. DESIGN SYSTEM



\*\*Direction (approved): dark, bold, orange-dominant. Confident, premium, engineered — matching "Less Talk. More Performance." The pyramid mark is the recurring visual motif.\*\*



\### 6.1 Tokens

```css

\--bg:        #0E0E0F;   /\* page background \*/

\--surface:   #17171A;   /\* cards, nav glass base \*/

\--surface-2: #1F1F23;

\--brand-dark:#231F20;

\--orange:    #F26E24;   /\* primary — dominant accent \*/

\--orange-hot:#FF7E33;   /\* hover state \*/

\--gold:      #F4C430;   /\* rare accent: thin rules, small tags only \*/

\--text:      #F7F5F2;   /\* headings \*/

\--text-muted:#A6A19B;   /\* body on dark \*/

\--line:      rgba(255,255,255,0.08);

```

Contrast rules: body text uses `--text` / `--text-muted` only. Orange is for display-size text, buttons, and accents — never small body text. Buttons: orange background with near-black text (`#141414`) for maximum contrast. Gold appears sparingly (≤ 1 element per viewport).



\### 6.2 Typography

\- EN display: Space Grotesk 700, tight leading, `clamp(2.5rem, 6vw, 5.5rem)` for H1. EN body: Inter 400/500.

\- AR display + body: Cairo (800 display / 400–500 body). Arabic headlines get equal visual weight and spacing care as English — test line-height for Arabic ascenders.

\- Uppercase micro-labels (EN) / small bold labels (AR) in orange with letter-spacing for section eyebrows.



\### 6.3 Motif \& texture

\- The pyramid mark (two orange peaks, from the logo) as: animated SVG line-draw in the hero, faint oversized line-art in section backgrounds, section divider element.

\- Subtle film-grain/noise overlay (CSS, \~3% opacity). Soft orange radial glows behind key sections. No gradients that muddy the black.



\### 6.4 Core components

\- \*\*Nav:\*\* sticky, dark glass (backdrop-blur), logo left (right in RTL), links, language switcher (EN ⇄ ع — swaps to the same page in the other language), orange WhatsApp CTA button. Collapses to a full-screen overlay menu on mobile with staggered link animation.

\- \*\*Buttons:\*\* primary (orange bg, dark text, magnetic hover + glow), secondary (1px `--line` border, text, arrow that translates on hover; arrow direction flips in RTL).

\- \*\*Cards:\*\* `--surface` bg, 1px `--line` border, radius 16–20px, hover: lift + orange border-glow + icon tick.

\- \*\*Floating WhatsApp button:\*\* fixed bottom corner (bottom-right LTR, bottom-left RTL), always visible, fires `whatsapp\_click` event.

\- \*\*Footer:\*\* oversized. Big wordmark, nav columns, contact block (phone, email, address), socials, license trust line: "PYRAMEDIAX MARKETING MANAGEMENT L.L.C — Dubai Trade License No. 1485511" (AR equivalent on /ar/), auto-year copyright.

\- \*\*RTL discipline:\*\* every directional element (arrows, chevrons, marquee direction, padding logic, timeline flow, floating buttons) mirrors via logical properties (`margin-inline-start`, etc.) — never hardcode left/right.



\---



\## 7. PAGE SPECIFICATIONS



Copy below is \*\*approved\*\*. EN copy is the source of truth for meaning; write Arabic natively (MSA, light Gulf tone) carrying the same meaning — do not literal-translate. Where final copy is given in both languages, use it verbatim.



\### 7.1 Homepage



\*\*Section 1 — Hero.\*\*

\- H1 (both languages, verbatim): `Less Talk. More Performance.`

\- Sub EN: `PyramediaX is a full-service digital marketing agency in Dubai — branding, content, web, and performance ads, built as one system that delivers measurable results.`

\- Sub AR (verbatim): `بيراميديا إكس وكالة تسويق رقمي متكاملة في دبي — هوية، ومحتوى، ومواقع، وإعلانات أداء، تشتغل كنظام واحد يحقق نتائج قابلة للقياس.`

\- CTAs: primary → WhatsApp (`Talk to us on WhatsApp` / `كلمنا على الواتساب`), secondary → `/services` (`Explore services` / `استكشف خدماتنا`).

\- Visual: animated pyramid SVG line-draw + orange glow; headline mask-reveal per line. Headline must be painted immediately (see §8 rules) — animation enhances, never delays first paint.

\- \*\*No counters. No stats. Nothing else in the hero.\*\*



\*\*Section 2 — Trusted-by strip.\*\*

\- Eyebrow EN: `Trusted by businesses in the UAE` / AR: `عملاء وثقوا فينا`.

\- Infinite marquee (pause on hover, direction mirrors in RTL) of the 5 client logos from §4. Until real logo files arrive, render styled text placeholders (client name in muted text) clearly marked `TODO:` in code — never draw fake logos.



\*\*Section 3 — Services grid.\*\* Six cards (name, one-liner, lucide icon, link) from §7.3. 3×2 desktop, 1-col mobile, scroll-reveal stagger.



\*\*Section 4 — How we work (methodology).\*\*

\- Title EN: `How we work` / AR: `منهجية شغلنا`.

\- The six stages as an animated flow — this is the ONE pinned horizontal-scroll section allowed on the site:

&#x20; `Data → Analysis → Decision → Execution → Result → Optimization`

&#x20; AR: `البيانات ← التحليل ← القرار ← التنفيذ ← النتيجة ← التحسين`

\- One short sentence per stage (write it, factual, no claims).



\*\*Section 5 — Why PyramediaX.\*\* Four differentiators, qualitative, approved:

1\. EN `Arabic-first, English-native.` — copy direction: both languages built to the same standard, because half-hearted Arabic loses Gulf clients.

2\. EN `Systems, not one-off posts.` — copy direction: every retainer runs on an operations backbone (content systems, automation, CRM discipline) so output is consistent, not mood-dependent.

3\. EN `Licensed and local.` — copy direction: a Dubai-licensed company with a real office in Deira — not a freelancer collective behind a logo.

4\. EN `Direct access to the founder.` — copy direction: no account-manager maze; strategy comes from the top.



\*\*Section 6 — Founder teaser.\*\* Photo (placeholder per §14), `Mohamed Abdou — Founder \& CEO` / `محمد عبده — المؤسس والرئيس التنفيذي`, one line from §7.2 founder copy, link → `/about`.



\*\*Section 7 — CTA band.\*\* Full-width dark band, big statement EN: `Ready when you are.` / AR: `جاهزين لما تكون جاهز.` + WhatsApp primary + `/contact` secondary.



\### 7.2 About — `/about`

1\. \*\*Story\*\* (3 short paragraphs, factual): full-service digital marketing agency headquartered in Deira, Dubai; what we believe — performance over promises, and why the agency deliberately avoids inflated marketing claims (this honesty IS the brand); who we serve — businesses across the UAE \& GCC.

2\. \*\*Values\*\* (3 cards): `Performance over promises` / `Systems over chaos` / `Honesty over hype` (write AR natively).

3\. \*\*Methodology expanded\*\* — the six stages with 2–3 sentences each.

4\. \*\*Founder section:\*\* real photo (§14 placeholder until supplied), name/title, short bio limited to §4 facts: founder \& CEO, leads strategy across marketing and automation for the agency's clients. No invented history, degrees, or numbers.

5\. License trust line + CTA band.



\### 7.3 Services — hub `/services` + six pages



Hub page: intro line + the six service cards (larger format) + CTA band.



Every service page uses the same template: \*\*Hero (name + qualitative promise) → What's included (deliverables) → How it runs (3–5 process steps) → Tools we work with (ONLY where a tools line is explicitly given below — omit the section otherwise; plain text, never logos/badges) → Mini-FAQ (3 honest Q\&As, no claims) → CTA band.\*\* JSON-LD `Service` + `FAQPage` + `BreadcrumbList` on each.



Approved service scopes (EN names verbatim; AR names verbatim; deliverables = the factual scope, phrase naturally):



1\. \*\*Social Media Management \& Content Creation\*\* / \*\*إدارة السوشيال ميديا وصناعة المحتوى\*\* — slug `social-media`

&#x20;  Included: platform strategy \& content calendars; scriptwriting \& copywriting (AR/EN); design \& short-form video production; community management; monthly performance reporting.

&#x20;  Tools: Meta Business Suite, scheduling \& analytics tooling.

2\. \*\*Branding \& Identity\*\* / \*\*الهوية والبراندنج\*\* — slug `branding`

&#x20;  Included: brand strategy \& positioning; logo \& visual identity systems; bilingual brand guidelines (AR/EN typography done right); brand asset kits for social \& print.

3\. \*\*Web Design \& Development\*\* / \*\*تصميم وتطوير المواقع\*\* — slug `web-development`

&#x20;  Included: high-performance marketing websites \& landing pages; bilingual RTL/LTR builds; SEO-ready architecture; analytics \& lead-capture wiring; ongoing care.

&#x20;  (This very site is the standard we build to — allowed to say exactly that.)

4\. \*\*Performance Ads\*\* / \*\*الإعلانات الممولة\*\* — slug `performance-ads`

&#x20;  Included: Meta \& Google campaign strategy, build \& management; creative testing frameworks; tracking \& conversion setup; budget management; transparent reporting.

&#x20;  Tools: Meta Ads Manager, Google Ads.

5\. \*\*SEO\*\* / \*\*تحسين الظهور في جوجل\*\* — slug `seo`

&#x20;  Included: technical audits; on-page \& content optimization (Arabic + English search); local SEO for UAE; structured data; monthly reporting.

&#x20;  Tools: Google Search Console, Google Analytics.

6\. \*\*AI Solutions \& Automation for Business\*\* / \*\*حلول الذكاء الاصطناعي والأتمتة للأعمال\*\* — slug `ai-solutions`

&#x20;  Included: marketing \& sales workflow automation; AI chat assistants for WhatsApp/Instagram; CRM \& lead-routing automation; internal process automation. Positioned as the operations layer that makes the other services faster — one service among six, per §2.2.

&#x20;  Tools: WhatsApp Business API, workflow-automation platforms.



\### 7.4 Contact — `/contact`

\- \*\*Form\*\* (client-side validation, bilingual errors): name\*, phone\* (international format hint, `dir="ltr"` input), email (optional), company (optional), service interest (select of the six + "General"), message\*. Honeypot field + minimum-time-on-page trap for spam.

\- Submit: `POST` JSON to `PUBLIC\_N8N\_WEBHOOK\_URL` (env). Payload contract:

```json

{

&#x20; "name": "", "phone": "", "email": "", "company": "", "service": "",

&#x20; "message": "", "lang": "en|ar", "page\_url": "",

&#x20; "utm": {"source":"","medium":"","campaign":"","term":"","content":""},

&#x20; "submitted\_at": "ISO-8601", "website": ""   // honeypot, must be empty

}

```

\- Success state (bilingual): confirmation + WhatsApp fallback button. Error state: retry + WhatsApp fallback. Fire `form\_submit` / `form\_success` events.

\- \*\*WhatsApp card:\*\* deep link `https://wa.me/971565799505?text=<url-encoded prefilled message per language>` — EN: `Hello PyramediaX, I'd like to discuss your services.` AR: `مرحباً بيراميديا إكس، حابب أستفسر عن خدماتكم.`

\- \*\*Info card:\*\* phone (tel: link, fires `call\_click`), email (mailto, fires `email\_click`), full office address `\[TODO\_OFFICE\_ADDRESS]`, Google Maps embed `\[TODO\_MAPS\_EMBED\_URL]` loaded as a click-to-load facade (no third-party iframe cost on page load). No office-hours block (not provided — do not invent).



\### 7.5 Legal — `/privacy`, `/terms`

Standard bilingual templates written factually for THIS site: data collected = form fields + analytics cookies (post-consent) + WhatsApp contact initiated by the user; no data selling; contact email for requests. Real "Last updated" date. No compliance-certification claims (no "GDPR certified" language). Keep sober and short.



\---



\## 8. MOTION DESIGN SPEC (strong, impressive — and cheap)



The client explicitly chose \*\*strong, impressive motion everywhere\*\*. Deliver a rich, award-grade motion language — under these engineering laws:



\*\*The laws:\*\*

1\. Animate `transform` and `opacity` only. Never top/left/width/height/margin.

2\. The LCP element (hero H1) renders server-side and is visible immediately; entrance animation may start from ≥ 0.4 opacity / small translate — never from `display:none` or `opacity:0` that gates first paint.

3\. One pinned/scroll-hijacked section maximum on the whole site (the methodology section). Everything else scrolls naturally.

4\. `prefers-reduced-motion: reduce` disables ALL non-essential motion (marquee becomes static row, reveals become instant).

5\. Total JS budget ≤ 180 KB gzipped including GSAP + ScrollTrigger + Lenis. No three.js / WebGL.

6\. No layout shift from animation. CLS budget in §12 applies during animations too.



\*\*The vocabulary (use all of it, tastefully):\*\*

\- Hero: per-line mask reveal of the H1, pyramid SVG stroke line-draw (\~1.2s), slow orange glow pulse, parallax pyramid layers on scroll.

\- Scroll reveals: clip + translate + fade with stagger on every section; slight scale-settle on cards.

\- Methodology: horizontal pinned scroll through the six stages, progress line drawing in orange, stage numbers counting the stage index (01→06 — index numbers are UI, not statistics; allowed).

\- Marquee logo strip: continuous, pauses on hover, mirrored direction in RTL.

\- Micro-interactions: magnetic primary buttons, arrow-slide on secondary buttons, card hover glow, nav underline slide, footer wordmark subtle skew-on-scroll.

\- Page transitions: Astro View Transitions — quick fade+lift between pages.

\- Desktop-only: small custom cursor dot that scales over interactive elements (pointer devices only; disabled on touch).



\---



\## 9. CONTENT ARCHITECTURE



\- `src/config/site.ts` — the single source of truth: phone, wa link builder, email, address placeholders, socials, legal name, license number, GA/Pixel/Webhook env reads. \*\*Every component imports contact data from here. Nothing hardcoded elsewhere.\*\*

\- `src/content/services/{en,ar}/\*.mdx` — six services × two languages, schema-validated (name, slug, oneLiner, deliverables\[], processSteps\[], tools\[], faq\[]).

\- `src/content/pages/{en,ar}/\*.json|mdx` — home/about/contact/legal copy blocks.

\- `src/i18n/` — UI strings dictionaries (nav, buttons, form labels/errors) per language + `useTranslations` helper + language-switcher path mapper.

\- `src/assets/clients/` — five logo slots. `src/assets/founder/` — photo slot.

\- README documents exactly how the owner edits content (which file = which section) — the owner maintains this site through Claude Code.

\- \*\*Blog-ready, not blog-built:\*\* structure collections/routing so a `blog` collection (MDX, both languages) can be added in v1.1 with zero refactor — but do NOT scaffold blog pages, routes, or nav links now (§5).



\---



\## 10. ANALYTICS \& CONSENT



\- Env: `PUBLIC\_GA4\_ID`, `PUBLIC\_META\_PIXEL\_ID`, `PUBLIC\_N8N\_WEBHOOK\_URL`, `PUBLIC\_SITE\_URL=https://pyramedia.info`.

\- GA4 + Meta Pixel load via Partytown, and \*\*only after consent\*\*.

\- Minimal bilingual consent banner (bottom sheet, on-brand, not a cookie-wall): Accept / Decline, choice persisted in `localStorage`. Decline = no analytics scripts load at all. Site works fully either way.

\- Events (both GA4 + Pixel where applicable): `whatsapp\_click {placement}`, `form\_submit`, `form\_success`, `call\_click`, `email\_click`. These are the conversion events Meta campaigns will optimize on — name them exactly.



\---



\## 11. SEO \& STRUCTURED DATA



\- Unique `<title>` + meta description per page per language (write them; ≤ 60 / ≤ 155 chars; include "Dubai" naturally on EN pages, «دبي» on AR pages).

\- `hreflang` en/ar pairs + `x-default` on every page; canonical tags; OpenGraph + Twitter cards with a branded dark OG image (generate one static OG template with logo + tagline).

\- JSON-LD: `Organization` + `LocalBusiness` (site-wide, address from placeholders, phone, geo when map URL supplied), `WebSite`, `Service` + `FAQPage` + `BreadcrumbList` per service page.

\- `sitemap.xml` (both language trees) + `robots.txt`.

\- Semantic HTML throughout; one `h1` per page; descriptive alt text in the page's language.



\---



\## 12. PERFORMANCE \& ACCESSIBILITY BUDGETS (release gates)



Measured on the production build, mobile emulation, for `/` AND `/ar/`:

\- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

\- LCP < 2.0s (4G), CLS < 0.05, INP < 200ms.

\- Total JS ≤ 180 KB gzip; fonts subset (Arabic subset for Cairo, Latin for EN fonts); images AVIF/WebP responsive; zero render-blocking third parties.

\- WCAG AA contrast everywhere (verify orange usage rules §6.1); full keyboard navigation; visible focus states; skip-link; form errors announced (aria-live).

\- RTL audit: every page visually inspected in Arabic — mirrored arrows, marquee direction, floating button side, pinned-section direction, form alignment.



\---



\## 13. DEPLOYMENT PIPELINE



\### 13.1 GitHub Actions → Bluehost

\- Workflow on push to `main`: checkout → Node 22 → `npm ci` → `npm run build` → deploy `dist/` via FTPS using `SamKirkland/FTP-Deploy-Action@v4` with state-file sync.

\- Secrets: `FTP\_SERVER`, `FTP\_USERNAME`, `FTP\_PASSWORD`, plus target dir variable `BLUEHOST\_SITE\_ROOT` (e.g. `public\_html/`). Owner supplies (§14).

\- Keep each build as a workflow artifact (simple rollback: re-run previous deploy).

\- \*\*CI guard step (runs after build, BEFORE deploy — fails the pipeline if triggered):\*\* scan `dist/` for the banned legacy number and leftover filler: if `grep -r "567249440" dist/` or `grep -ri "lorem ipsum" dist/` returns any match → exit 1. The old phone number must be physically unable to reach production.

\- README: local dev (`npm run dev`), content editing map, and manual-deploy fallback instructions.



\### 13.2 `.htaccess` (committed to `public/`)

\- All 301s from §5.1; force HTTPS; canonical non-www.

\- `mod\_deflate` compression; long-cache immutable headers for hashed `/\_astro/\*` assets; short cache for HTML.

\- Security headers: `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo off), conservative CSP compatible with GA4/Pixel/Partytown and the click-to-load map.

\- Custom branded 404 page (bilingual, links home).



\---



\## 14. OWNER-SUPPLIED ASSETS (placeholder system)



Build with explicit placeholders; each must be a single-file swap, findable via `grep "TODO\_"`:



| Key | Asset | Placeholder behavior until supplied |

|---|---|---|

| `TODO\_FOUNDER\_PHOTO` | Real photo of Mohamed Abdou | On-brand dark panel with pyramid line-art + name/title. Never a stock face. |

| `TODO\_CLIENT\_LOGO\_1..5` | 5 client logo files (SVG/PNG) | Styled text of client name in muted color inside the marquee. |

| `TODO\_OFFICE\_ADDRESS\_EN/AR` | Exact office address lines | Show "Deira, Port Saeed — Dubai, UAE" / «ديرة، بور سعيد — دبي، الإمارات» until exact line arrives. |

| `TODO\_MAPS\_EMBED\_URL` | Google Maps embed/share URL | Address card renders without the map block. |

| `PUBLIC\_N8N\_WEBHOOK\_URL` | n8n form webhook | Form disabled state with WhatsApp fallback + console warning in dev. |

| `PUBLIC\_GA4\_ID` / `PUBLIC\_META\_PIXEL\_ID` | Analytics IDs | Analytics simply not injected. |

| FTP secrets | Bluehost FTPS credentials | CI deploy step skipped with clear log message. |



\---



\## 15. BUILD ORDER \& DEFINITION OF DONE



\*\*Build phases (commit at each):\*\*

1\. Scaffold: Astro + Tailwind v4 + tokens + fonts + i18n plumbing + `site.ts`.

2\. Layout shell: nav, footer, language switcher, WhatsApp float, consent banner.

3\. Homepage (all 7 sections, static first).

4\. Services hub + 6 service pages from content collections.

5\. About, Contact (form + webhook contract), legal pages, 404.

6\. Motion pass (§8) across the whole site.

7\. SEO layer: meta, hreflang, JSON-LD, sitemap, OG image, `.htaccess` + redirects.

8\. Analytics + consent wiring.

9\. QA gates (below) + CI/CD pipeline + README.



\*\*Definition of done — every item must pass:\*\*

\- \[ ] All 24 pages (12 × 2 languages) build with zero errors/warnings.

\- \[ ] `grep -r "567249440" .` → 0 matches. `grep -ri "lorem" src/` → 0 matches.

\- \[ ] Claims audit: every number or verifiable claim rendered on the site traces to §4. No counters exist in the codebase.

\- \[ ] "AI-powered agency" framing absent; positioning per §2.2.

\- \[ ] Budgets in §12 met on `/` and `/ar/` (attach Lighthouse reports).

\- \[ ] Full RTL visual audit completed page-by-page.

\- \[ ] Form tested end-to-end against a test webhook (payload matches §7.4 contract); honeypot verified; success/error states verified in both languages.

\- \[ ] All §5.1 redirects verified with curl after deploy.

\- \[ ] `prefers-reduced-motion` verified.

\- \[ ] Language switcher lands on the equivalent page (not the homepage) in the other language.

\- \[ ] iPhone Safari + Android Chrome manual pass (nav overlay, pinned section, form, WhatsApp links).



Ship it clean. The site is the case study.


---

## ADDENDUM A — FOUNDER-APPROVED SCOPE CHANGES

### A.1 Instagram reels box (approved by Abdou, 18 July 2026)

The homepage gains ONE additional section between the founder teaser (§7.1
section 6) and the CTA band (section 7), in both languages:

- Three **owner-curated** Instagram reels (no auto-feed). The links live in
  `src/content/instagram.json`; the owner changes them by sending new links —
  a rebuild refreshes everything automatically.
- Rendered as on-brand facade cards: reel cover images are fetched once at
  **build time** and optimized into local assets — the page makes zero
  Instagram requests at load (§2.5 and §12 stay fully binding).
- Clicking a card loads the **official Instagram embed** for that reel
  (click-to-load, same pattern as the §7.4 map facade). Without JS the cards
  are plain links to the reels.
- No API keys or tokens in the client. No counters and no captions are
  reproduced as site copy (§2.1 unaffected). §8 motion laws apply to the
  facade.

This addendum does not reopen §5's exclusions (no portfolio, blog,
testimonials, or FAQ page).

### A.2 Careers application link (approved by Abdou, 18 July 2026)

The site links out to the owner's Airtable application form for jobs and
internships, in both languages:

- **Homepage hero** — a third, *tertiary* action after the WhatsApp and
  services CTAs. Tertiary styling is required: §1 makes the homepage a B2B
  credibility and lead-generation surface, so the careers link must not
  compete visually with the two conversion CTAs.
- **Footer navigation column** — site-wide on all 24 pages.

Rules: the destination URL lives only in `src/config/site.ts`
(`careersUrl`); the label is neutral and states no hiring volume, team size,
growth, or employment claim (§2.1 unaffected); the link opens in a new tab
with `rel="noopener"` and carries a direction-aware external-link icon. No
careers page, job listings, or applicant content is added to this site
(§5 exclusions intact).

### A.3 Hero gateways: become a client / apply for a job (approved by Abdou, 29 July 2026)

Amends §7.1 section 1 and §10.

**Hero CTAs (amends §7.1 s1).** The hero carries the WhatsApp primary CTA,
then a pair of *gateway* pills directly beneath it:

- `Become our client` / `كن عميلاً لدينا` → the owner's client-intake form.
- `Apply to jobs & internships` / `التقديم على الوظائف والتدريب` → the
  owner's Airtable careers form (Addendum A.2).

The `Explore services` secondary CTA is **removed from the hero** with founder
approval: the services grid is the next section on the page and Services
remains in the nav, so the link is redundant while the two gateways are not.
The §7.1 verbatim H1, sub-line and WhatsApp CTA copy are untouched.

**Gateway styling.** Gateway pills use an icon badge, a slow travelling sheen
and a hover lift. Every animated property is `transform`/`opacity` only and
the whole treatment is disabled under `prefers-reduced-motion` — §8 laws are
unchanged. Gateways must stay visually below the WhatsApp primary in weight.

**Analytics (amends §10).** Two non-conversion engagement events join the
five conversion events, with the same `{placement}` payload:

- `client_apply_click {placement}`
- `careers_click {placement}`

The five §10 conversion events keep their exact names and meaning; Meta
campaign optimisation continues to use only those five.

**Placeholder.** `TODO_CLIENT_FORM_URL` in `src/config/site.ts`
(`clientFormUrl`). While empty the "become our client" gateway falls back to
`/contact`, the approved §7.4 intake path, so the button is never dead. No
client-intake form, page, or applicant content is added to this site.

### A.4 TikTok Pixel as a third analytics provider (approved by Abdou, 30 July 2026)

§10 named GA4 and the Meta Pixel. The owner carried three tracking IDs over
from the previous pyramedia.info site, including a TikTok Pixel, so TikTok
joins them as a third **independent** provider under the same rules:

- It loads through Partytown and **only after the visitor accepts** the
  consent banner. Decline ⇒ it is never injected.
- Each provider is independent: any combination of the three IDs may be
  configured, and only the configured ones load. With none configured, no
  analytics code and no consent banner render at all.
- The conversion events of §10 keep their exact names across all three
  providers. TikTok receives them via `ttq.track`.
- The consent banner and the privacy policies name the providers that are
  actually configured in the build — §2.1 applies to disclosures too.

### A.5 Outbound work showcases (approved by Abdou, 13 August 2026)

§5 excludes a portfolio section from launch scope, and A.5 does **not** reopen
that exclusion. The owner separately built and published two showcase pages on
the `card.pyramedia.info` subdomain — a website-design showcase (`/`) and a
video-production showcase (`/vp/`). This site **links out** to them; it hosts
no portfolio, case study, project entry, or client-work claim of its own.

Placement (both languages):

- **Homepage** — a bordered strip directly under the §7.1 services grid,
  labelled with a neutral eyebrow, holding one *secondary* button per showcase.
  Secondary styling is required for the same reason as A.2: neither button may
  compete with the two conversion CTAs.
- **Service pages that have a showcase** — one *secondary* button in the hero
  action row, after the WhatsApp and contact CTAs. Only `web-development` and
  `social-media` qualify; the other four service pages render no such button.

Rules:

- Destination URLs live only in `src/config/site.ts` (`SHOWCASE_URLS`, read
  through `showcaseUrl(slug)`). Emptying a value removes every button for that
  service with no other edit, so a link can never go dead in the build.
- Labels are neutral and state no client name, project count, sector count,
  revenue, result, or ranking. Claims that appear **on** the destination pages
  are the owner's own publication and are outside this SPEC's §2.1 surface;
  nothing from them may be restated on this site without §4 approval.
- Links open in a new tab with `rel="noopener"` and carry `hreflang="ar"`,
  because both destinations are Arabic-only. English pages additionally render
  one short note stating that the showcases open in Arabic — §2.1 applies to
  the visitor's expectations, not only to factual claims.
**Analytics (amends §10).** A third non-conversion engagement event joins the
two from A.3, with the same `{placement}` payload:

- `work_click {placement}` — `placement` identifies the surface as
  `home-<slug>` or `service-<slug>`.

The five §10 conversion events keep their exact names and meaning; Meta
campaign optimisation continues to use only those five.

### A.6 Client logo strip — revised roster (approved by Abdou, 17 August 2026)

§4 approved five client names for the §7.1 logo strip, and no logo files
existed, so the strip shipped as the approved text-name treatment. The owner
supplied real logo files and directed that the strip become **logos only**.

**Revised §4 client roster.** The five names in §4 are replaced by the six
clients whose logo files the owner supplied:

1. Injazat Group (مجموعة إنجازات)
2. Etmam Center for Judicial Services (مركز إتمام للخدمات القضائية)
3. Aown Domestic Workers Services (مركز عون لخدمات العمالة المساعدة)
4. Al Alson Typing & Legal Translation (الألسن للطباعة والترجمة القانونية)
5. BellaDente Dental Studio
6. Maken Properties

Mazaya Platinum Real Estate, Bashayer Real Estate and SynthCity DXB leave the
strip: the owner confirmed no logo files are available for them, and a strip
that mixes marks with bare names reads as unfinished. Their removal is a
presentation decision, not a statement about the relationship. Elite Track
Cars Rental was supplied but is **not** published — see the note below.

Rules, unchanged from §4: the strip carries names and marks only, and states
zero results, spend, duration, ranking or testimonial. Every mark must come
from an owner-supplied file. §2.1 continues to forbid reconstructing,
redrawing or generating a logo that was not supplied.

**Rendering.** Each supplied file is reduced to a single light tone with its
own alpha and exported on a shared canvas height, with per-mark size set by
optical weight rather than bounding box. One CSS height therefore renders the
whole set in balance; setting a width, or exporting the marks at differing
canvas heights, would flatten that balance and must not be done. Marks sit at
60% opacity and reach full opacity on hover — opacity only, so §8 holds.

**Not published: Elite Track Cars Rental.** The only supplied file is a 3D
wall-mockup render. Its letterforms carry dark bevel shading inside the
glyphs, so thresholding punches holes through them and morphological closing
dissolves into the spotlit wall. Both were attempted and rejected. It joins
the strip if and only if the owner supplies a real logo file; it is never to
be traced, redrawn or approximated (§2.1).
