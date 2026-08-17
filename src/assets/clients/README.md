# Client logo assets

`source/` holds the owner-supplied originals, untouched. The `.png` files in
this directory are the processed marks the site actually imports: one light
tone, own alpha, exported on a **shared 180px canvas height** with each mark
centred at its optically-weighted size.

That shared canvas is load-bearing. `.client-logo img` sets one CSS height for
the whole set; exporting a mark at a different canvas height, or adding a CSS
width, re-flattens the balance. See SPEC Addendum A.6.

## Adding a client

1. Put the original in `source/`.
2. Process it to match: white silhouette, own alpha, trimmed, 180px canvas.
3. Import it into `CLIENT_LOGOS` in `src/components/pages/HomePage.astro`.
4. Add `{ "id": "...", "name": "..." }` to `trustedBy.clients` in **both**
   `src/content/pages/en/home.json` and `.../ar/home.json`.

An id with no logo falls back to its approved text name, so a half-finished
addition degrades instead of breaking.

## Rules

Place only owner-approved real client logos here.

Do not add generated or reconstructed logos. That includes tracing, redrawing,
or "cleaning up" a mark that was only ever supplied as a photo or a 3D mockup
— Elite Track was rejected on exactly those grounds (§2.1, Addendum A.6).
