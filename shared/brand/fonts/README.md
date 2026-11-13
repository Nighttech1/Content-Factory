# Vernatun fonts

## Primary

- Family: **Noto Serif Display**
- Canonical visual weight: **Black 900**
- Asset: `NotoSerifDisplay[wdth,wght].ttf`
- License: SIL Open Font License 1.1, see `OFL-NotoSerifDisplay.txt`
- Source: Google Fonts repository, `ofl/notoserifdisplay`
- SHA-256: `4b661adcf6a5d38bf5befdc4d976e8a7238a4aeb57e62c1c1a67775380a09df9`

```css
@font-face {
  font-family: "Noto Serif Display";
  src: url("./NotoSerifDisplay[wdth,wght].ttf") format("truetype-variations");
  font-style: normal;
  font-weight: 100 900;
  font-stretch: 62.5% 100%;
  font-display: block;
}

:root {
  --vernatun-font-primary: "Noto Serif Display";
  --vernatun-font-primary-weight: 900;
}
```

Headlines, hooks and final CTA use weight `900`. Dates and subheads may use
`600–700` from the same variable file. A missing primary asset is a render
failure, not a reason to silently switch to a system font.

The approved logo wordmark is an image asset and is not retyped with this font.
Montserrat remains a utility sans-serif only.
