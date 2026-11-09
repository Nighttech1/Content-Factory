# Self-hosted application fonts

Build-time Google Fonts network access was removed on 2026-11-09. Families and CSS variable contracts are preserved: JetBrains Mono (`--font-mono-jb`, variable weight 100–800), Noto Sans Armenian (`--font-hy`, 100–900). Century Gothic remains the existing OS-local UI family; no proprietary font is copied.

- `jetbrains-mono-variable.woff2`: official variable TTF from https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf, downloaded 2026-11-09 through the normal network proxy and converted to WOFF2 using fontTools + Brotli without font subsetting or changing outlines/metrics. The family name and full weight axis, Latin and Cyrillic cmap entries were checked after conversion. License: `jetbrains-mono-OFL.txt` from the same official directory.
- `noto-sans-armenian.woff2`: existing repository asset, inspected as Noto Sans Armenian variable 100–900 with Armenian cmap entries. Official family license from https://github.com/google/fonts/blob/main/ofl/notosansarmenian/OFL.txt is included as `noto-sans-armenian-OFL.txt`.

The application uses `next/font/local`; deployment builds do not fetch either family from Google. The original official TTF is not shipped separately.
