# Decisions — C-41

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Localhost: `.env.local` / snippet; prod: encrypted store later | Data-safety |
| D2 | OWNER-only connect/save | Secrets like mesh |
| D3 | No publish permissions in C-41 | Smaller App Review surface |
| D4 | No IG Business on Page → hard stop + instruction | Common setup fail |
| D5 | OAuth `state` CSRF cookie | Security |
| D6 | **No password form / no scrape login** | Meta ToS + reliability |
