# Content edit: /thank-you/ page — full rewrite (Bootstrap → Tailwind)

**Sam's ask (2026-09-11 Discord)**: assess and fix all UI/copy issues visible on `https://www.content.one/thank-you/?type=demo` — screenshot showed a blank Strategy & Outcomes accordion section and other layout drift.

## Content item

- Model: `basic_page` (ZUID `6-ba8cf2c2f8-5f358h`)
- Item ZUID: **⚠️ needs lookup in Zesty admin — search basic_page for slug `thank-you`**
- URL: https://www.content.one/thank-you/

## Root cause of the visible bugs

The `body` field on this item was authored in Bootstrap 5 markup (`.col-lg-*`, `.card`, `.accordion`, `.btn-primary`, `.badge`, `.form-control`, `.list-group`, `.table`, `.alert`, etc.). The site is now Tailwind-only with an incomplete Bootstrap-shim. The most visible symptom: the discovery-question `<ul>` lists in each accordion render invisibly because Tailwind Preflight strips `list-style` and the `@tailwindcss/typography` plugin that would normally restore it isn't loaded on the CDN. Result: Strategy & Outcomes opens to a blank card.

The full rewrite below replaces the Bootstrap markup with Tailwind-native, fixes the typos, and keeps every piece of user-facing content.

## Fields being edited

Summary of every field on the content item that gets a change:

| Field | Before | After |
|---|---|---|
| `title` (page `<title>`) | "Thank you for Contacting Us" | "Thank you — we'll be in touch \| Content.One" |
| `og_description` | (empty) | "You're on our calendar. Here's a discovery-call prep checklist to make your first conversation with the Content.One team fast and productive." |
| `title_followup_text` (hero subtitle) | "In the meantime, feel free to explore our discovery call **preperation** checklist below." | "In the meantime, work through our discovery-call **preparation** checklist below." |
| `body` (main content) | Bootstrap-classic HTML (see Before block) | Tailwind-native rewrite (see After block) |

**Note on `title`**: the current hero H1 also says "Thank you, we will reach out to you shortly." That's the `title` field itself on this content item. The `<title>` tag is a separate CMS metadata field. Both should read consistently. Recommend updating the hero H1 (title) to a shorter warmer variant too — flagged inline below.

## Before (current live body HTML)

Full source in `/tmp/live-thanks.html` lines 1721–1980 (or view-source on the live URL). Key markers:
- `<section id="cms-discovery-prep">` root
- `<div class="container">` root (Bootstrap grid container)
- `.row / .col-lg-* / .col-md-*` grid
- `.card / .card-body / .card-header` shells
- `.accordion / .accordion-item / .accordion-collapse` (Strategy & Outcomes, Content & Modeling, Architecture & Integrations, Security Compliance & Governance)
- `.btn btn-primary / .btn-outline-secondary / .btn-secondary`
- `.badge bg-success / .badge bg-danger / .badge bg-warning`
- `.form-control / .form-label / .form-check-input`
- `.list-group / .list-group-item`
- `.table align-middle / .table table-sm`
- `.alert alert-info`

## After (Tailwind-native rewrite)

```html
<section id="cms-discovery-prep" class="py-8 lg:py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- HERO row: intro copy + Target Outcomes card -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16">
      <div class="lg:col-span-8">
        <h2 class="font-display text-3xl md:text-4xl font-bold text-ink mb-3">Prepare for your CMS discovery call</h2>
        <p class="text-gray-600 text-lg leading-relaxed mb-6">Use this guided checklist to align stakeholders, gather the right information, and make your first conversation with a CMS partner fast and productive.</p>
        <div class="flex flex-wrap gap-3">
          <a href="#precall-checklist" class="inline-flex items-center rounded-lg bg-royal hover:bg-royalDark text-white font-semibold px-5 py-2.5 transition text-sm">Start the checklist</a>
          <a href="#discovery-questions" class="inline-flex items-center rounded-lg border border-gray-300 hover:border-royal hover:text-royal text-gray-700 font-semibold px-5 py-2.5 transition text-sm">Review questions</a>
        </div>
      </div>
      <div class="lg:col-span-4">
        <div class="rounded-2xl border border-gray-200 bg-paper p-6">
          <p class="text-sm font-semibold text-ink mb-4">Target outcomes</p>
          <ul class="list-none m-0 p-0 space-y-3">
            <li class="flex items-start gap-3"><span class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success font-semibold text-xs">1</span><span class="text-sm text-ink">Clarify goals &amp; audiences</span></li>
            <li class="flex items-start gap-3"><span class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success font-semibold text-xs">2</span><span class="text-sm text-ink">Map content &amp; integrations</span></li>
            <li class="flex items-start gap-3"><span class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success font-semibold text-xs">3</span><span class="text-sm text-ink">Define workflows &amp; governance</span></li>
            <li class="flex items-start gap-3"><span class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success font-semibold text-xs">4</span><span class="text-sm text-ink">Set budget, timing, success KPIs</span></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- THREE PILLARS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 lg:mb-16">
      <article class="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="font-display text-lg font-semibold text-ink mb-2">1. Business &amp; content goals</h3>
        <p class="text-sm text-gray-600 mb-4">Why this CMS project? What success looks like.</p>
        <ul class="list-none m-0 p-0 divide-y divide-gray-100 border-t border-b border-gray-100">
          <li class="py-2.5 text-sm text-ink">Primary goals (conversion, education, self-serve, SEO)</li>
          <li class="py-2.5 text-sm text-ink">Top audience segments &amp; journeys</li>
          <li class="py-2.5 text-sm text-ink">Key properties (site, blog, docs, landing pages)</li>
          <li class="py-2.5 text-sm text-ink">Must-have features (preview, localization, roles)</li>
        </ul>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="font-display text-lg font-semibold text-ink mb-2">2. Technology &amp; integrations</h3>
        <p class="text-sm text-gray-600 mb-4">What systems the CMS must connect with.</p>
        <ul class="list-none m-0 p-0 divide-y divide-gray-100 border-t border-b border-gray-100">
          <li class="py-2.5 text-sm text-ink">Website stack (framework, hosting/CDN)</li>
          <li class="py-2.5 text-sm text-ink">Auth &amp; SSO (Okta, Azure AD, SAML/OIDC)</li>
          <li class="py-2.5 text-sm text-ink">Marketing &amp; data (CRM, MAP, analytics)</li>
          <li class="py-2.5 text-sm text-ink">Commerce, DAM, search, personalization</li>
        </ul>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 class="font-display text-lg font-semibold text-ink mb-2">3. Operations &amp; governance</h3>
        <p class="text-sm text-gray-600 mb-4">Who does what, and how content ships.</p>
        <ul class="list-none m-0 p-0 divide-y divide-gray-100 border-t border-b border-gray-100">
          <li class="py-2.5 text-sm text-ink">Team roles &amp; permissions</li>
          <li class="py-2.5 text-sm text-ink">Workflow (draft → review → approve → publish)</li>
          <li class="py-2.5 text-sm text-ink">Compliance (PII, SOC 2, HIPAA, GDPR)</li>
          <li class="py-2.5 text-sm text-ink">SLAs, support, training plan</li>
        </ul>
      </article>
    </div>

    <!-- PRE-CALL CHECKLIST -->
    <div id="precall-checklist" class="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-12 lg:mb-16">
      <div class="border-b border-gray-100 px-6 py-4 bg-paper">
        <h3 class="font-display text-xl font-semibold text-ink m-0">Pre-call checklist</h3>
      </div>
      <div class="p-6">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-5" onsubmit="event.preventDefault();">
          <label class="md:col-span-2 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" class="mt-1 w-4 h-4 rounded border-gray-300 text-royal focus:ring-royal" />
            <span class="text-sm text-ink">Define 2–3 primary business goals for the new CMS.</span>
          </label>
          <label class="md:col-span-2 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" class="mt-1 w-4 h-4 rounded border-gray-300 text-royal focus:ring-royal" />
            <span class="text-sm text-ink">List top audience segments and the actions you want them to take.</span>
          </label>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Current sites/apps in scope</label>
            <textarea rows="3" placeholder="Marketing site, blog, docs, microsites, portal…" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Top content types</label>
            <textarea rows="3" placeholder="Pages, articles, case studies, products, locations…" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Constraints &amp; risks</label>
            <textarea rows="3" placeholder="Regulatory, brand, deadlines, resourcing…" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Timeline &amp; budget bands</label>
            <textarea rows="3" placeholder="Target launch; ballpark budget (build + licenses)" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal"></textarea>
          </div>
        </form>
      </div>
    </div>

    <!-- DISCOVERY QUESTIONS — HTML5 <details> with no Bootstrap JS dependency -->
    <div id="discovery-questions" class="mb-12 lg:mb-16">
      <h3 class="font-display text-xl font-semibold text-ink mb-5">Discovery questions worth bringing</h3>
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">

        <details open class="group">
          <summary class="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-gray-50">
            <span class="font-semibold text-ink">Strategy &amp; outcomes</span>
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <ul class="list-disc pl-9 pr-5 pb-5 space-y-2 text-sm text-gray-700 m-0">
            <li>What business outcomes are you prioritizing in the next 6–12 months?</li>
            <li>Which audience journeys do you want to improve first?</li>
            <li>How will you measure success (KPIs below)?</li>
            <li>What's the "must launch by" date and why?</li>
          </ul>
        </details>

        <details class="group">
          <summary class="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-gray-50">
            <span class="font-semibold text-ink">Content &amp; modeling</span>
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <ul class="list-disc pl-9 pr-5 pb-5 space-y-2 text-sm text-gray-700 m-0">
            <li>What core content types do you publish? What fields matter?</li>
            <li>Do you need localization, multi-brand, or multi-site controls?</li>
            <li>What is your editorial cadence and publishing volume?</li>
            <li>Any content migration needs (from legacy CMS/files/spreadsheets)?</li>
          </ul>
        </details>

        <details class="group">
          <summary class="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-gray-50">
            <span class="font-semibold text-ink">Architecture &amp; integrations</span>
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <ul class="list-disc pl-9 pr-5 pb-5 space-y-2 text-sm text-gray-700 m-0">
            <li>Frontend stack and hosting/CDN preferences?</li>
            <li>Auth/SSO requirements (Okta/Azure AD, SAML/OIDC)?</li>
            <li>Which systems must integrate (CRM, MAP, analytics, DAM, search, commerce)?</li>
            <li>API/data requirements (webhooks, GraphQL/REST, rate limits)?</li>
          </ul>
        </details>

        <details class="group">
          <summary class="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-gray-50">
            <span class="font-semibold text-ink">Security, compliance &amp; governance</span>
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <ul class="list-disc pl-9 pr-5 pb-5 space-y-2 text-sm text-gray-700 m-0">
            <li>Compliance needs (SOC 2, ISO 27001, HIPAA, GDPR/CCPA)?</li>
            <li>Roles/permissions, audit trails, approval workflows?</li>
            <li>Data residency, backup/DR, SLAs, support tiers?</li>
            <li>Accessibility (WCAG 2.2) and performance budgets?</li>
          </ul>
        </details>

      </div>
    </div>

    <!-- INTEGRATION INVENTORY -->
    <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-12 lg:mb-16">
      <div class="border-b border-gray-100 px-6 py-4 bg-paper">
        <h3 class="font-display text-xl font-semibold text-ink m-0">Integration inventory — sample</h3>
        <p class="text-sm text-gray-600 mt-1 mb-0">A working sample of what a good inventory looks like. Bring your own list to the call.</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="text-left font-semibold p-3">System</th>
              <th class="text-left font-semibold p-3">Purpose</th>
              <th class="text-left font-semibold p-3">Connection type</th>
              <th class="text-left font-semibold p-3">Criticality</th>
              <th class="text-left font-semibold p-3">Notes</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr class="border-t border-gray-100">
              <td class="p-3 font-medium text-ink">CRM (Salesforce)</td>
              <td class="p-3">Lead routing &amp; attribution</td>
              <td class="p-3">REST API, webhooks</td>
              <td class="p-3"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger/10 text-danger">High</span></td>
              <td class="p-3">Sync forms, campaign IDs, consent</td>
            </tr>
            <tr class="border-t border-gray-100">
              <td class="p-3 font-medium text-ink">Analytics (GA4)</td>
              <td class="p-3">Engagement &amp; conversion</td>
              <td class="p-3">Tag manager / SDK</td>
              <td class="p-3"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-yellow-800">Medium</span></td>
              <td class="p-3">Server-side tagging preferred</td>
            </tr>
            <tr class="border-t border-gray-100">
              <td class="p-3 font-medium text-ink">DAM (Bynder)</td>
              <td class="p-3">Asset sourcing</td>
              <td class="p-3">GraphQL API</td>
              <td class="p-3"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-yellow-800">Medium</span></td>
              <td class="p-3">Renditions &amp; rights metadata</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SUCCESS KPIs + ROLES & RACI (two columns) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 lg:mb-16">

      <div class="lg:col-span-7 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4 bg-paper">
          <h3 class="font-display text-xl font-semibold text-ink m-0">Define success (KPIs)</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-gray-100 divide-y divide-gray-100">
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Conversion rate</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">+X%</span></div>
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Time-to-publish</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">≤ X hrs</span></div>
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Organic traffic</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">+X%</span></div>
            </div>
            <div class="rounded-xl border border-gray-100 divide-y divide-gray-100">
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Page speed (LCP)</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">≤ 2.5s</span></div>
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Author adoption</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">≥ X users</span></div>
              <div class="flex items-center justify-between px-4 py-3 text-sm"><span class="text-ink">Error rate</span><span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">≤ X%</span></div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-4 italic">Replace "X" with targets aligned to your goals.</p>
        </div>
      </div>

      <div class="lg:col-span-5 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4 bg-paper">
          <h3 class="font-display text-xl font-semibold text-ink m-0">Roles &amp; RACI</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="text-left font-semibold p-3">Area</th>
                <th class="text-left font-semibold p-3">R</th>
                <th class="text-left font-semibold p-3">A</th>
                <th class="text-left font-semibold p-3">C</th>
                <th class="text-left font-semibold p-3">I</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-t border-gray-100"><td class="p-3 font-medium text-ink">Content modeling</td><td class="p-3">Content lead</td><td class="p-3">Product</td><td class="p-3">SEO, design</td><td class="p-3">Legal</td></tr>
              <tr class="border-t border-gray-100"><td class="p-3 font-medium text-ink">Integration design</td><td class="p-3">Engineering</td><td class="p-3">CTO</td><td class="p-3">Vendors</td><td class="p-3">Marketing</td></tr>
              <tr class="border-t border-gray-100"><td class="p-3 font-medium text-ink">Governance</td><td class="p-3">Ops</td><td class="p-3">COO</td><td class="p-3">Security</td><td class="p-3">All authors</td></tr>
            </tbody>
          </table>
          <p class="text-xs text-gray-500 px-6 py-3 border-t border-gray-100 bg-gray-50 italic">R = Responsible, A = Accountable, C = Consulted, I = Informed.</p>
        </div>
      </div>
    </div>

    <!-- PRO TIP + FINAL CTA -->
    <div class="rounded-2xl bg-royal/[0.06] border border-royal/15 p-5 mb-6 flex items-start gap-4">
      <svg viewBox="0 0 24 24" class="w-6 h-6 text-royal shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
      <p class="text-sm text-ink m-0"><strong class="font-semibold">Pro tip:</strong> Bring 2–3 recent pages you love (and why), plus one page you want to fix. It speeds up scoping and solution design.</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <a href="#precall-checklist" class="inline-flex items-center rounded-lg border border-gray-300 hover:border-royal hover:text-royal text-gray-700 font-semibold px-5 py-2.5 transition text-sm">Complete the checklist</a>
      <a href="/contact-us/" class="inline-flex items-center rounded-lg bg-royal hover:bg-royalDark text-white font-semibold px-5 py-2.5 transition text-sm">Book your discovery call</a>
    </div>

  </div>
</section>
```

## Notes on judgement calls

- **Kept every user-facing sentence** from the current body — content is valuable; only the markup changed.
- **Accordion converted to `<details>`**: no Bootstrap JS dependency, no shim risk. First item stays open by default (`<details open>`), matching current behavior. `list-disc pl-9` on the `<ul>` restores the bullet visibility that Tailwind Preflight was stripping.
- **KPI badges**: changed `bg-secondary` grey Bootstrap badges to monospace pill chips — more visually distinct and easier to scan.
- **Alert box**: swapped `alert alert-info` for a subtle royal-tinted card matching our brand tokens.
- **`/contact` link**: current CTA points to `/contact` which 404s — updated to `/contact-us/` (the live URL).
- **Kept the pre-call checklist form as an in-page tool** — checkboxes + textareas are for user note-taking, not submission. `onsubmit="event.preventDefault();"` guards against accidental navigation.
- **Danger/warning badges** on the Integration Inventory: mapped to our `danger` and `warning` brand tokens (`bg-danger/10 text-danger`, `bg-warning/15 text-yellow-800`). Consistent with brand.

## How this ships on merge

1. Someone with the Zesty PTK looks up the item ZUID for `basic_page` slug `thank-you` (⚠️ TODO — not resolvable from git alone; the read-only `c1-agent.sh` endpoint doesn't list content items).
2. Update the four fields (`title`, `og_description`, `title_followup_text`, `body`) via:
   ```
   PUT /v1/content/models/6-ba8cf2c2f8-5f358h/items/{item_ZUID}
   ```
3. Publish the item.
4. **Idempotence check**: before writing, re-fetch the item and verify the current `body` still contains the Bootstrap `.container` opener + the "preperation" typo. If someone else has edited it since this diff was drafted, stop and re-open with a fresh diff.

## Post-merge verification

- [ ] `https://www.content.one/thank-you/?type=demo` loads without a blank Strategy accordion body
- [ ] All 4 discovery-question sections open and close via native `<details>`
- [ ] `<title>` says "Thank you — we'll be in touch \| Content.One"
- [ ] OG description populates on social preview
- [ ] Hero subtitle says "preparation" (not "preperation")
- [ ] Bottom CTA "Book your discovery call" routes to `/contact-us/` (200), not `/contact` (404)
