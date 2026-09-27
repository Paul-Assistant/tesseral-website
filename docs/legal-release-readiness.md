# Service legal release — 27 September 2026

## Prepared

Draft routes `/terms` and `/privacy` cover the website and app. `lib/legal.ts` contains the text; `legalReviewPending` is true. Draft pages are visibly labelled and noindex. Staging only: do not publish these drafts as effective policies yet.

Owner-confirmed: This is Garcy s.r.o.; Na Usedlosti 1837/10, Prague 4, Czech Republic; VAT CZ07826800. ARES confirmed full name, IČO 07826800 and postal code 147 00. Consumers and businesses may subscribe. 14-day refunds (draft uses initial purchase, matching the question asked); paid access until period end, then 30 days for export; explicit account/project deletion within 30 days with legally required billing records retained separately. Customer content must not train general-purpose AI models. Support/privacy: loren@garcy.studio.

## Required before effective publication

- Verify Exa account agreement. Its standard privacy policy says query data may train models powering Exa, while separately contracted business processing is governed by that agreement. Current research code sends company names, research queries and URLs. Do not conflate an enterprise zero-retention offer with a contract the account actually has.
- Verify Anthropic organisation has not opted into training/Development Partner Program and that customer content is not submitted as training feedback. Commercial API documentation provides no-training by default but has opt-in exceptions. Retention is separate from training.
- Verify executed provider DPAs, transfer safeguards and deployment regions. Record actual backup expiry; do not claim a verified schedule without one.
- Dashboard must implement or establish a reliable support workflow for 30-day exports after paid coverage ends, deletion after that window, explicit deletion within 30 days, auth/storage/database cleanup, shared-workspace ownership checks and deletion replay after backup restore. No complete workflow was established in this audit.
- Provide a customer DPA and accurate subprocessor/security schedule where handling client personal data as processor.
- App signup should link dated Terms and Privacy, record Terms acceptance, preserve separate optional analytics consent and provide refund/withdrawal information. Do not treat a privacy notice as blanket consent to all processing.
- Replace Stripe's legacy legal URLs with https://tesseral.design/terms and https://tesseral.design/privacy only after publication. Dashboard notes still identify unrelated legacy URLs.
- Set website integration request recipient `INTEGRATION_REQUEST_TO` to loren@garcy.studio in Production and the existing branch preview; do not broaden credential scopes. No email has been sent to Loren during this work.
- Once resolved, remove draft flag, review final wording/effective date, add `/terms` to production sitemap and update its test, build, deploy and verify both URLs plus footer/app links. Current production remains unchanged.

## Sources checked

- ARES API: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/07826800
- Exa policy: https://exa.ai/privacy-policy
- Anthropic commercial training: https://privacy.claude.com/en/articles/7996885-how-do-you-use-personal-data-in-model-training
- Anthropic retention: https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
- Consumer withdrawal: https://europa.eu/youreurope/citizens/consumers/shopping/returns/indexamp_en.htm
- Czech ADR: https://coi.gov.cz/en/information-about-adr/

This draft preserves consumer rights, includes an optional withdrawal notice and avoids an invented liability cap. Have Czech/EU counsel review before paid consumer launch; code checks are not legal certification.
