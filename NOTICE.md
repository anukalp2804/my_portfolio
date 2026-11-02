# Notice

## 1. What the MIT licence covers - and what it does not

The [MIT licence](LICENSE) applies to the **source code** of this website: the HTML, CSS and JavaScript files
(`index.html`, `style.css`, `script.js`, `analytics.js`, `theme-init.js`, `noscript.css`, `404.html`,
`Organization/**`, `check-before-publish.py` and the other configuration files).
You are free to learn from it, reuse it and adapt it, as long as the copyright notice and licence text stay with the code.

The licence **does not cover the personal content** of the site. All rights in the following are reserved by
**Anukalp Pandey** (c) 2026 and they may not be copied or reused without written permission:

- the name, biography, descriptions and every other text written about the author or his work;
- photographs, the resume (PDF), certificates and badges, and everything in the `image/` folder;
- project descriptions and project screenshots;
- the lists of pull requests and issues in the `Data/` folder (the underlying GitHub pages belong to their own repositories).

If you reuse the code for your own portfolio, replace all personal content with your own.

## 2. Trademarks

Apache, the Apache Software Foundation and OWASP are names and trademarks of their respective owners.
They are mentioned only to describe the author's open-source contributions. This site is not endorsed by, or affiliated with, those organisations.

## 3. Third-party components

These files are included in the `vendor/` folder, unchanged except where noted. Each keeps its own licence.

| Component | Version | Licence | Copyright | Files |
|---|---|---|---|---|
| Font Awesome Free (icons, as web fonts) | 6.4.0 | Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT | (c) 2023 Fonticons, Inc. | `vendor/fontawesome/` (licence: `vendor/fontawesome/LICENSE.txt`) |
| Outfit (typeface, latin subset) | from `@fontsource/outfit` | SIL Open Font License 1.1 | (c) 2021 The Outfit Project Authors | `vendor/fonts/outfit-*.woff2` (licence: `vendor/fonts/LICENSE-outfit.txt`) |
| Space Grotesk (typeface, latin subset) | from `@fontsource/space-grotesk` | SIL Open Font License 1.1 | (c) 2020 The Space Grotesk Project Authors | `vendor/fonts/space-grotesk-*.woff2` (licence: `vendor/fonts/LICENSE-space-grotesk.txt`) |

Modification: in `vendor/fontawesome/css/all.min.css` the unused `.ttf` font fallbacks were removed from the `@font-face` rules
(the `.woff2` files are used by every current browser). The Font Awesome copyright header in that file was left in place.

## 4. External services (not included in this repository)

- **Web3Forms** (contact form) and **GoatCounter** (optional, private visitor statistics) are third-party services you sign up for separately.
  The site only talks to them if you configure them (see `README.md`).
