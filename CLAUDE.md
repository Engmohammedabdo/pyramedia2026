# Claude Code repository entry point

This file is the permanent entry point for Claude Code. The current operational
handoff is in [`docs/CLAUDE_CODE_HANDOFF.md`](docs/CLAUDE_CODE_HANDOFF.md).

## Required reading order

Before changing code, read these files in full and in this order:

1. `SPEC.md` — the product, content, routing, quality, and release source of truth.
2. `docs/CLAUDE_CODE_HANDOFF.md` — current verified state and next-work boundary.
3. `BUILD_NOTES.md` — placeholders, owner inputs, implementation decisions, and QA history.
4. `README.md` — local commands, content map, architecture, and deployment summary.
5. `REVIEW_GATE1_REREVIEW.md` — independent GATE 1 evidence and remaining limits.

Read `REVIEWER.md` only when Muhammad explicitly assigns an independent review.
Its reviewer-only restriction on source edits does not apply to an explicitly
authorized implementation task.

## Working with Muhammad

- Address him as Muhammad or Abduh. Communicate in clear Egyptian Arabic while
  keeping established technical terms in English.
- Treat him as the business/marketing owner, not as the implementation engineer:
  lead with business impact, then give the necessary technical evidence.
- When a real choice is needed, ask one manager-level question and include your
  recommended option with the reason and tradeoff.
- Keep status concrete and visual where useful: what is done, what is verified,
  what remains, who owns it, and what the next decision is.
- Locked decisions stay locked. Do not restart settled design or architecture
  discussions without new evidence and Muhammad's explicit permission.
- Never blur verification boundaries. Say whether evidence is from source
  inspection, local preview, CI, staging, or the live production destination.

## Non-negotiable repository rules

- `SPEC.md` wins over assumptions, generic best practices, and existing copy.
- Do not add factual claims, numbers, awards, testimonials, certifications,
  clients, people, or positioning that the SPEC does not approve.
- Keep the banned legacy contact number from SPEC §2.3 out of `src/`, `dist/`,
  and public output, and preserve the clean mandatory scans.
- AI & Automation is one of the six approved services, not the company's
  identity or primary positioning. Do not describe PyramediaX as AI-first.
- Keep the tagline "Less Talk. More Performance." in English in both languages.
- Do not add or scaffold a portfolio, blog, testimonials section, or standalone
  FAQ page for the current launch scope.
- English and Arabic are separate native content. Update both deliberately; do
  not machine-translate one into the other.
- Keep contact and company data in `src/config/site.ts`. Keep page copy in the
  content files identified by `README.md`, not in presentation components.
- Preserve RTL behavior and use logical layout utilities. Do not introduce
  physical left/right Tailwind spacing or alignment utilities.
- Never replace pending founder/client assets with stock, AI-generated, or
  reconstructed material. Use only owner-approved files.
- Preserve the static Apache/Bluehost architecture, extensionless live URLs,
  canonical Arabic homepage `/ar/`, and the existing `.htaccess` contract.
- Do not weaken the GATE 1 regression suite or reopen a verified GATE 1 decision
  without new evidence and Muhammad's approval.
- Never treat a local Astro preview as proof of live Apache, redirects, headers,
  DNS, FTPS, analytics, webhook delivery, or production device behavior.

## Working conventions

- Use Node 22 (`.nvmrc`). On Windows, prefer `npm.cmd` in automation.
- Start with `git status --short --branch` and preserve user-owned untracked or
  unrelated changes.
- Before declaring work complete, run the checks required by the active gate,
  plus `npm.cmd run test:gate1`, `npm.cmd run build`, and `git diff --check` when
  the change can affect the current site.
- Do not push, deploy, configure external services, or use owner secrets unless
  Muhammad explicitly authorizes that action.
- Record any new assumption or placeholder in `BUILD_NOTES.md`; never hide it in
  code or present it as verified fact.
