# Status — C-124

- **Frontend:** done (2026-10-10) — static picture: no MiniMap/Controls/Dots; `nodesDraggable={false}`; solid `#08090A`; fitView; panel click kept. Shared pass with C-125.
- **Motion:** done (2026-10-10) — solid edges static/quiet (no dasharray animation); dashed Trainer calm opacity breathe; label fade ≤120ms; barbell spring appear; density strokeWidth/label offset; MiniMap/Controls/Dots not restored
- **Fixer (Client P2-B @1440):** handoff labels still sat on nodes (esp. «текст запроса» on User). `PulseEdge.tsx` — place along chord (0.64 from User / 0.55 else) + perpendicular lift ~34–42px; font 9px / opacity ~0.88; no seed coord changes; MiniMap not restored.
- **Tester:** pending
- **Deployer:** pending
- **Client:** pending
