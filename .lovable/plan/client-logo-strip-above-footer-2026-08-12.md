# Client Logo Strip Above Footer

Add a horizontal strip of clickable client logos on the home page, directly above the footer, sourced from the uploaded PDF.

## Logos included
1. Jaycee Trading and Services
2. Baia Palawan
3. Kapwa Hospitality Group
4. San Vicente Palawan Island Directory
5. Amuma Barefoot Boutique Resorts

Each logo is extracted from the PDF, has its white background removed (transparent PNG), and is uploaded to CDN asset storage.

## Links
The Canva PDF does not carry clickable link data, so no destination URLs came through. I will seed each logo with a placeholder URL (`#`) and you can set the real link for each one in the admin panel in seconds. If you paste the five URLs in chat I will seed them directly instead.

## Appearance
- Light mode: logos render at natural color.
- Dark mode: logos are brightened and slightly contrast-lifted so the dark artwork (Kapwa, Amuma, Baia) stays readable on the dark background, while full-color logos (San Vicente, Jaycee) keep their color.
- Hover: subtle lift and full opacity; resting state slightly muted so the strip does not fight the footer.

## Uniform layout across devices
- Mobile: 2 per row, centered, equal fixed logo box height.
- Tablet: 3 per row.
- Desktop: all 5 in one row, evenly spaced.
- Every logo sits in a same-size box with `object-contain` so wide and square logos appear visually equal regardless of source dimensions.

## Admin control
New **clients** tab in the admin panel:
- Upload logo image from device
- Set name (used as alt text and tooltip)
- Set destination URL
- Reorder, add, delete entries

## Technical notes
- Extract the 5 logo images from the PDF, remove white backgrounds, upload via the assets CLI, and store `.asset.json` pointers in `src/assets/clients/`.
- Add `clients: ClientLogo[]` (`id`, `name`, `logo`, `url`) to the content store with the 5 seeded defaults, persisted through the existing site-content save path so it survives publish.
- New `ClientLogos` section component rendered on the home page between the CTA section and the footer.
- Dark-mode treatment via a CSS class in `src/styles.css` using a `filter` under the existing theme selector; no new color hardcoding in components.
- Admin tab follows the same pattern as the existing workspace/portfolio tabs, reusing the device-upload `ImageField`.
