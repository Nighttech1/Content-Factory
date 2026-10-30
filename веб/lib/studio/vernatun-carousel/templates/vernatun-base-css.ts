/**
 * Vernatun layout CSS — Design colors only.
 * Freedom modes: brand bare/float/bar; text on-photo/scrim/panel.
 */

export function vernatunBaseCss(vars: {
  panel: string;
  ink: string;
  accent: string;
  pageBg: string;
}): string {
  const { panel, ink, accent, pageBg } = vars;
  const onPhoto = "#F7F4EF";
  return `*{box-sizing:border-box}html,body{margin:0;background:${pageBg};color:${ink};font-family:Arial,Helvetica,sans-serif}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;background:${panel};isolation:isolate;--counter-scale:1;--logo-scale:1;--panel-width:62%}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.shade{position:absolute;inset:0;background:rgba(0,0,0,.22);z-index:-1}
.accent{color:${accent}}
.counter{position:absolute;right:42px;top:38px;color:#fff;font-size:calc(32px * var(--counter-scale));font-weight:900;line-height:1;letter-spacing:.5px;text-shadow:0 2px 8px rgba(0,0,0,.9);z-index:5;background:rgba(23,21,19,.55);border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:calc(10px * var(--counter-scale)) calc(14px * var(--counter-scale));min-width:calc(72px * var(--counter-scale));text-align:center;font-variant-numeric:tabular-nums}

/* Default panel — can be overridden by .on-photo / .scrim */
.panel{position:absolute;left:48px;top:110px;width:var(--panel-width);max-height:calc(100% - 200px);padding:36px 36px 40px;background:${panel};color:${ink};border:2px solid ${ink};box-shadow:10px 10px 0 ${accent};z-index:2;overflow:visible;display:flex;flex-direction:column;gap:14px;border-radius:0}
.panel.shape-rounded{border-radius:28px;box-shadow:0 18px 0 ${accent}}
.panel.shape-pill{border-radius:48px;padding:40px 44px;box-shadow:0 14px 28px rgba(0,0,0,.18)}
.panel.shape-ribbon{border-radius:0;clip-path:polygon(0 8%,100% 0,100% 92%,0 100%);padding-top:48px;padding-bottom:52px}
.panel.shape-diagonal{border-radius:0;transform:skewY(-2deg);transform-origin:left top;box-shadow:14px 18px 0 ${accent}}
.panel.shape-diagonal .panel-inner{transform:skewY(2deg)}
.panel.shape-split-band{left:0;width:62%;border-radius:0 40px 40px 0;border-left:0;box-shadow:12px 0 0 ${accent}}

/* Text ON PHOTO — no card; Design accent + light ink + shadow for readability */
.panel.on-photo{background:transparent!important;border:none!important;box-shadow:none!important;color:${onPhoto};width:min(88%,920px);max-height:calc(100% - 180px);top:120px;left:52px;padding:8px 8px 24px}
.panel.on-photo h1,.panel.on-photo .bodycopy,.panel.on-photo .sub,.panel.on-photo .insight,.panel.on-photo .question{color:${onPhoto};text-shadow:0 4px 28px rgba(0,0,0,.92),0 2px 6px rgba(0,0,0,.95),0 0 2px rgba(0,0,0,1)}
.panel.on-photo h1 .accent{color:${accent};text-shadow:0 2px 14px rgba(0,0,0,.8)}
.panel.on-photo .insight{border-left-color:${accent};background:rgba(0,0,0,.35);padding:12px 14px;border-radius:12px}
.panel.on-photo .question{background:${accent};color:#fff;border:none;text-shadow:none}
/* Extra readability veil behind on-photo type on light photos */
.slide-on-photo .shade,.cover .shade,.cta .shade,.quote .shade,.photo-top .shade{background:linear-gradient(105deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.35) 42%,rgba(0,0,0,.18) 100%)!important}

/* Soft scrim — glass over photo, still not a hard white slab */
.panel.scrim{background:rgba(12,10,8,.48)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.22)!important;box-shadow:0 18px 40px rgba(0,0,0,.35)!important;color:${onPhoto};border-radius:28px}
.panel.scrim h1,.panel.scrim .bodycopy,.panel.scrim .sub,.panel.scrim .insight{color:${onPhoto};text-shadow:0 2px 12px rgba(0,0,0,.55)}
.panel.scrim h1 .accent{color:${accent}}

.slide h1,.headline h1{font-size:clamp(38px,5vw,64px);line-height:1.1;letter-spacing:-1px;margin:0;font-weight:900;color:${ink};overflow-wrap:normal;word-break:keep-all;hyphens:manual;-webkit-hyphens:none;flex:0 0 auto}
.sub{font-size:28px;line-height:1.2;font-weight:800;margin:0;flex:0 0 auto;color:${ink}}
.bodycopy{font-size:26px;line-height:1.35;margin:0;display:block;flex:0 1 auto;overflow:visible;color:${ink};max-height:480px}
.insight{font-size:26px;line-height:1.15;font-weight:900;border-left:7px solid ${accent};padding:10px 0 10px 16px;margin:24px 0 0}

/* Brand: bar (legacy) | float (Mode-B-like pill) | bare (logo on photo, no slab) */
.brand{position:absolute;z-index:8;display:flex;align-items:center;gap:14px;color:${ink}}
.brand.brand-bar{left:0;right:0;bottom:0;height:94px;background:${panel};border-top:2px solid ${ink};padding:10px 34px}
.brand.brand-float{left:36px;bottom:40px;right:auto;top:auto;height:auto;max-width:70%;padding:12px 18px;border-radius:20px;background:rgba(12,10,8,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.28);color:#fff}
.brand.brand-bare{left:40px;bottom:44px;right:auto;top:auto;height:auto;width:auto;background:transparent;border:none;padding:0;color:#fff;filter:drop-shadow(0 3px 14px rgba(0,0,0,.65))}
.brand.brand-bare strong,.brand.brand-float strong{color:#fff}
.brand.brand-bare small,.brand.brand-float small{color:rgba(255,255,255,.92)}
.brand.place-br{left:auto;right:36px;bottom:40px;flex-direction:row}
.brand.place-bl{left:36px;right:auto;bottom:40px}
.brand.place-tr{left:auto;right:36px;top:40px;bottom:auto}
.brand.place-tl{left:36px;right:auto;top:40px;bottom:auto}
.brand.brand-bar.place-br,.brand.brand-bar.place-bl,.brand.brand-bar.place-tr,.brand.brand-bar.place-tl{left:0;right:0;bottom:0;top:auto}
.brand img{width:calc(66px * var(--logo-scale));height:calc(66px * var(--logo-scale));object-fit:contain;flex:0 0 auto}
.brand strong{display:block;font-size:22px;letter-spacing:2px;line-height:1.05}
.brand small{display:block;font-size:11px;letter-spacing:1.2px;margin-top:4px}

.photo-graphic{background:linear-gradient(145deg,${pageBg} 0%,${panel} 45%,${accent}33 100%)!important;object-fit:cover}
.cover .shade{background:linear-gradient(105deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.28) 48%,rgba(0,0,0,.12) 100%)}
.cover .panel{left:48px;top:140px;width:min(90%,960px);max-height:calc(100% - 220px);padding:28px 28px 36px}
.cover .panel.on-photo{top:160px}
.cover h1{font-size:68px;line-height:1.05;hyphens:manual;-webkit-hyphens:none}
.split .photo,.dialogue .photo,.statement .photo{left:50%;width:50%}
.split .shade,.dialogue .shade,.statement .shade{background:linear-gradient(90deg,rgba(0,0,0,.35) 0%,transparent 55%)}
.split.slide-on-photo .photo,.dialogue.slide-on-photo .photo,.statement.slide-on-photo .photo{left:0;width:100%}
.split.slide-on-photo .panel,.dialogue.slide-on-photo .panel,.statement.slide-on-photo .panel{left:48px;top:140px;width:min(54%,560px);height:auto;max-height:calc(100% - 220px);border:none;padding:24px}
.split .panel,.dialogue .panel,.statement .panel{left:0;top:0;width:50%;height:calc(100% - 40px);padding:90px 48px 100px;box-shadow:none;border:0;border-right:3px solid ${ink};border-radius:0;overflow:visible}
.split h1,.dialogue h1,.statement h1{font-size:50px}
.photo-top .photo{height:52%}
.photo-top .panel{left:0;top:52%;bottom:0;width:100%;height:auto;padding:48px 64px 120px;border:0;border-top:3px solid ${ink};box-shadow:none;border-radius:0}
.photo-top .panel.on-photo,.photo-top .panel.scrim{top:42%;bottom:auto;height:auto;border:none;padding:40px 56px;width:92%;left:4%}
.photo-top h1{font-size:70px;margin-bottom:18px}
.cards .shade{background:linear-gradient(180deg,rgba(0,0,0,.58) 0%,rgba(0,0,0,.32) 40%,rgba(0,0,0,.5) 100%)}
.cards .headline{position:absolute;left:56px;top:88px;right:110px;color:#fff;z-index:2}
.cards h1{font-size:68px;line-height:1.02;margin:0;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,.75);overflow-wrap:normal;word-break:keep-all;hyphens:none}
.cards h1 .accent{color:${accent};text-shadow:0 2px 10px rgba(0,0,0,.55)}
.duo{position:absolute;left:48px;right:48px;top:320px;bottom:140px;display:grid;grid-template-columns:1fr 1fr;gap:22px;z-index:3;align-content:stretch}
.trio{position:absolute;left:40px;right:40px;top:300px;bottom:140px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;z-index:3;align-content:stretch}
.card{background:${panel};border:3px solid ${ink};padding:28px 24px 30px;min-height:0;box-shadow:8px 8px 0 ${accent};border-radius:0;display:flex;flex-direction:column}
.trio .card h2{font-size:22px;margin:0 0 12px}
.trio .card p{font-size:19px;line-height:1.28;flex:1}
.card.shape-rounded{border-radius:24px}
.card.shape-pill{border-radius:40px}
.card.dark{background:${ink};color:${panel};border-color:${ink};box-shadow:8px 8px 0 ${accent}}
.card.mid{background:#fff;color:#171513;border-color:#171513;box-shadow:8px 8px 0 ${accent}}
.card.mid h2,.card.mid p{color:#171513}
.card.dark h2,.card.dark p{color:${panel}}
.card h2{font-size:28px;line-height:1.08;margin:0 0 18px}
.card p{font-size:24px;line-height:1.26;margin:0;flex:1}
.quote .panel{left:58px;top:130px;width:72%;padding:42px 44px}
.quote-box{border:2px solid currentColor;padding:22px;margin:16px 0;font-size:32px;font-weight:800;background:rgba(255,255,255,.12);border-radius:18px}
.statement .insight{background:${accent};color:${ink};border:0;padding:20px;border-radius:16px;text-shadow:none}
.cta .shade{background:linear-gradient(135deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.18) 50%,rgba(0,0,0,.4) 100%)}
.cta .panel{left:0;top:16%;width:90%;max-width:960px;padding:48px 56px 56px;border-radius:0 40px 40px 0;border-left:0;transform:skewY(-2deg);box-shadow:18px 22px 0 ${accent}}
.cta .panel.on-photo,.cta .panel.scrim{transform:none;box-shadow:none;border-radius:28px;left:48px;width:min(88%,920px)}
.cta .panel .panel-inner{transform:skewY(2deg)}
.cta .panel.on-photo .panel-inner,.cta .panel.scrim .panel-inner{transform:none}
.cta h1{font-size:66px;margin-bottom:22px;hyphens:manual;-webkit-hyphens:none}
.cta .question{display:inline-block;margin-top:28px;padding:18px 28px;background:${accent};color:#fff;font-size:28px;font-weight:900;border-radius:14px;text-shadow:none}
.question{border:2px solid ${ink};background:#fff;padding:14px 16px;font-size:24px;line-height:1.18;margin:12px 0;border-radius:20px}`;
}
