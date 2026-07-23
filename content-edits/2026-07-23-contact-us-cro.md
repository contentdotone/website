# CRO edits: /contact-us/ page

**Content item**
- Model: `contact_us` (ZUID `6-ce81bcd0d5-xbkf0m`)
- Item ZUID: `7-e4f6f790d8-dt1w4z`
- URL: https://www.content.one/contact-us/

**Companion template change (in this same PR)**
`webengine/views/contact_us` — removes the "Talk with our team" eyebrow chip above the H1. Ships via normal sync-to-zesty on merge.

---

## Field 1: `title`

**Before**

```
Book a Demo
```

**After**

```
Book a Personalized Demo
```

---

## Field 2: `body`

Full replacement of the existing body HTML. The intro paragraph and the "What to expect:" bold line consolidate into one un-bolded lead sentence per kaya. Step 2 copy is fully rewritten. Steps 1 and 3 are unchanged. Each step heading gets a top-margin so the three steps have adequate breathing room (kaya asked for "easy on the eyes" spacing).

**Before**

```html
<p class="p1">Fill out the form and our team will reach out to schedule a time that works for you. We&rsquo;ll walk through your goals, show how the platform can support your digital strategy, and answer any questions along the way.</p>
<p class="p3"><b>What to expect:</b><b></b></p>
<p class="p3"><b>1. Discovery Call (15 minutes)</b><b></b></p>
<p class="p1">We start with a short conversation to understand your organization&rsquo;s needs, challenges, and goals so we can tailor the demo to what matters most to your team.</p>
<p class="p3"><b>2. Personalized Platform Demo</b><b></b></p>
<p class="p1">Next, we&rsquo;ll walk you through an interactive demo using examples relevant to your content, workflows, and digital experience requirements.</p>
<p class="p3"><b>3. Follow-Up and Next Steps</b><b></b></p>
<p class="p1">After the demo, we&rsquo;ll address any remaining questions, explore additional needs, and provide clear pricing and implementation options for your team.</p>
```

**After**

```html
<p class="p1">Here&rsquo;s what to expect next.</p>
<p class="p3" style="margin-top:2.5rem;"><b>1. Discovery Call (15 minutes)</b></p>
<p class="p1">We start with a short conversation to understand your organization&rsquo;s needs, challenges, and goals so we can tailor the demo to what matters most to your team.</p>
<p class="p3" style="margin-top:2.5rem;"><b>2. Personalized Platform Demo</b></p>
<p class="p1">Content.One is so fast and flexible, we&rsquo;ll have your personalized demo ready within days. You can expect an MVP or &ldquo;first draft&rdquo; of what your website(s) and digital experiences will become.</p>
<p class="p3" style="margin-top:2.5rem;"><b>3. Follow-Up and Next Steps</b></p>
<p class="p1">After the demo, we&rsquo;ll address any remaining questions, explore additional needs, and provide clear pricing and implementation options for your team.</p>
```

---

## Notes on judgement calls

- **"What to expect:" bold header removed.** Kaya's new intro line "Here's what to expect next." serves the same eyebrow role; keeping both was redundant. Flag if you want the bold line back.
- **Step 2 copy uses "Content.One" (proper casing)** even though kaya's message wrote "Content.one" — matching site-wide brand casing.
- **Spacing between steps.** `margin-top:2.5rem` (≈40px) on each step heading paragraph. Un-styled paragraphs in this WYSIWYG default to ~1rem of separation, so this roughly triples the gap between the end of one step and the heading of the next.

---

## How this ships on merge

1. Template change (eyebrow removal) syncs to Zesty automatically via CI.
2. I run the CMS API updates:
   ```
   PUT /v1/content/models/6-ce81bcd0d5-xbkf0m/items/7-e4f6f790d8-dt1w4z
   ```
   with the new `title` and `body`, then publish the item.
3. **Idempotence check**: before writing, I re-fetch the current title + body and verify the "before" strings match verbatim. If the item's been edited since this diff was drafted, I stop and re-open the PR with a fresh diff.
