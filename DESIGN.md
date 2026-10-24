---
name: Bedrock Model Economics
description: Your team's monthly AI bill for every Bedrock model, printed as an itemized utility statement.
colors:
  envelope-ink: "#14254d"
  envelope-ink-glow: "#1d3366"
  on-envelope: "#ffffff"
  on-envelope-muted: "#bcc7e2"
  highlighter: "#ffe14a"
  highlighter-ink: "#191400"
  focus-blue: "#2a5bd7"
  link-blue: "#2450c8"
  series-closed: "#2a78d6"
  series-open: "#eb6834"
  series-local: "#1baf7a"
  series-ref: "#9aa1ad"
  desk: "#e6e9ee"
  paper: "#ffffff"
  paper-recessed: "#f3f5f8"
  ink: "#0f1728"
  ink-secondary: "#465068"
  ink-tertiary: "#626b80"
  rule: "#dbe0e8"
  rule-strong: "#b6bfcd"
  grid-line: "#edf0f4"
  flag: "#b42318"
  flag-bg: "#fdecea"
  ok: "#18794e"
  ok-bg: "#e6f4ec"
  warn: "#8a4b00"
  warn-bg: "#fff4e0"
  register-window: "#0b111d"
  register-digit: "#f4f6fa"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.4rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display-tablet:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display-phone:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.05rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  amount-due:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 17cqi, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.3
  hint:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.45
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.3
    fontFeature: "tnum"
  ocr-line:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.12em"
rounded:
  hairline: "3px"
  sm: "4px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  gutter: "36px"
  sheet-pad: "40px"
  sheet-pad-phone: "18px"
components:
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-hover:
    backgroundColor: "{colors.paper-recessed}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink-secondary}"
  button-remit:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.highlighter-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-band-ghost:
    textColor: "{colors.on-envelope}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
    height: "36px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "34px"
  chip:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.data}"
    rounded: "{rounded.pill}"
    padding: "4px 7px"
  chip-gov:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
  chip-flag:
    backgroundColor: "{colors.flag-bg}"
    textColor: "{colors.flag}"
    rounded: "{rounded.pill}"
  statement-sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    width: "1240px"
  sticky-bar:
    backgroundColor: "{colors.paper}"
    height: "60px"
---

# Design System: Bedrock Model Economics

## Overview

**Creative North Star: "The Itemized Statement"**

Every surface is a page of a utility bill. An envelope-ink navy band carries the wordmark, the data date and a guilloché security ribbon along its rule; a white statement sheet is pulled up out of that band and everything that matters is printed on it. Sections are torn apart by perforations, not boxed into cards. Facts are set as bill rows: a quiet term column on the left, the line item, a dotted leader, the amount flush right. The one figure the reader came for, the Amount due, is struck with a highlighter.

The system is dense and numerate, but calm. Colour is spent sparingly: navy for the envelope, ink on white paper for the statement, yellow highlighter for exactly the figure that matters, and four series inks whose meaning never changes. Depth is the physical stack of envelope, sheet and pop-overs, never decoration. Motion is mechanical: meter wheels roll to new numbers and the security weave morphs when the scenario changes.

The world rejects the category-default KPI-card dashboard under a gradient hero. No card grids, no glass, no gradient text.

**Key Characteristics:**
- Navy envelope band with a scenario-seeded guilloché ribbon; a white sheet overlaps it by 120px.
- Perforated tear lines with punched edge notches separate sections; a vertical perforation tears off the remittance stub.
- Bill rows with term column, dotted leader and right-set amount; totals closed by a double rule.
- Highlighter yellow on the single amount that matters; it is also the colour of the one primary action on the stub.
- Four fixed series inks: closed blue, open orange, on-prem green, reference grey.
- Rolling meter-wheel numerals; counter-window registers for the on-prem meter.

## Colors

A restrained navy-and-paper statement palette with one highlighter and four semantic series inks; every hue is pinned to a meaning.

### Primary
- **Envelope Ink** (envelope-ink): the masthead band, theme-color, and the sticky bar's mark. Lifted with a radial **Envelope Glow** (envelope-ink-glow) from the top right. Text on it is **On Envelope** white, with **On Envelope Muted** for the data date and lead paragraph. In dark theme the band brightens (to #15306b / #22468f) so it still reads as an envelope above the darker desk.

### Secondary
- **Highlighter** (highlighter) with **Highlighter Ink** (highlighter-ink): the skewed marker stroke behind the Amount due figure, the remittance stub's copy-link button, the phone copy button, the skip link, focus outlines inside the band, and the second strand of the guilloché ribbon (at 55%).

### Tertiary: Series Inks
- **Closed Blue** (series-closed): closed models on Bedrock.
- **Open Orange** (series-open): open-weight models on Bedrock.
- **On-Prem Green** (series-local): the self-hosted box.
- **Reference Grey** (series-ref): models not on Bedrock, shown for reference.
These are owner-pinned semantics carried from the prototype; each has a tuned dark-theme value in the sidecar.

### Neutral
- **Desk** (desk): the surface the statement lies on, and the colour punched through the perforation notches.
- **Paper** (paper) and **Recessed Paper** (paper-recessed): the sheet, and hover fills or the notes footer of the sheet.
- **Ink** (ink), **Ink Secondary**, **Ink Tertiary**: figures and headings; descriptive lines; term columns, units and hints.
- **Rule** and **Rule Strong**: row hairlines; control borders, perforations and dot leaders. **Grid Line** for chart grids and meter tracks.
- **Focus Blue** (focus-blue): focus rings and field focus glow. **Link Blue** (link-blue): inline links.
- **Status pairs**: flag (non-US origin, invalid), ok (GovCloud/authorized), warn (caveats), each with a tinted background.

### Named Rules
**The One Highlighter Rule.** Highlighter yellow marks the single figure that answers the question (Amount due) and the one action that sends it onward. Never use it for a second figure, a series, or decoration other than the ribbon strand.

**The Fixed Inks Rule.** Closed blue, open orange, on-prem green and reference grey mean exactly those four categories everywhere: chart points, legend, ledger dots. Never reuse a series ink for status or emphasis.

## Typography

**Display Font:** Schibsted Grotesk (with ui-sans-serif, system-ui)
**Body Font:** Public Sans (with ui-sans-serif, system-ui)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, Menlo)

**Character:** A tight, heavy grotesk prints the headline and every amount like a bill's bold figures; Public Sans carries the plain civic reading voice; Plex Mono is the machine voice for rates, table numbers, chips and the OCR line.

### Hierarchy
- **Display** (800, 3.4rem, 1.02, -0.035em): the single question headline in the band. Steps to 2.6rem under 900px and 2.05rem on phones.
- **Amount Due** (800, clamp(2.5rem, 17cqi, 4rem), 1.05): the highlighted figure in the remittance stub, sized to its container. The on-prem meter total uses the same voice at 2.1rem.
- **Headline** (700, 1.5rem, -0.02em): section titles, always sitting on a 2px ink rule.
- **Title** (700, 19px; amounts 21px): bill-row line items and their amounts; 17px on phones.
- **Lead** (400, 17px, 1.55, max 66ch): the band's intro paragraph only.
- **Body** (400, 15px, 1.55) and **Body Small** (14px): running text and section descriptions, capped at 70 to 76ch.
- **Label** (600, 13.5px, 1.3): term columns, field labels, button text. Sentence case, no tracking.
- **Hint** (400, 12.5px, 1.45): field hints, table sub-lines, units.
- **Data** (Plex Mono 500, 13.5px, tabular): table figures and meter readings.
- **OCR Line** (Plex Mono 500, 11.5px, 0.12em): the scan line above the stub's action.

### Named Rules
**The Tabular Figures Rule.** Every figure that can change is set with tabular numerals (or in Plex Mono) so columns and rolling wheels never jitter. Punctuation inside rolling numbers stays proportional.

**The Sentence-Case Labels Rule.** Labels and term columns are sentence-case Public Sans in ink-tertiary. Letter-spaced uppercase is reserved for nothing; the only tracked text is the OCR line.

## Layout

One centred column: the band's inner content and the statement sheet share a 1240px measure, with a 40px sheet padding (18px on phones). The sheet is pulled up 120px over the band (84px on phones) and gains 16px side margins under 1280px, 8px on phones. Inside, the statement stub is a two-column grid (flexible bill rows, 320 to 420px remittance stub separated by a 36px gutter and vertical perforation); the comparison is a 300px control column beside the chart, with the chart sticky at 76px on tall desktop viewports. Under ~1000px everything collapses to one column, the chart and stub move first, and the stub's vertical perforation turns horizontal. Wide tables scroll inside their own box with soft edge shadows and a swipe hint; on wide desktops the ledger header sticks under the sticky bar. Section rhythm is 28px top / 36px bottom with a 16px gap above the heading rule and 24px below it; bill rows breathe at 18/16px.

## Elevation & Depth

Depth is a physical paper stack: desk, envelope band, statement sheet, and transient pop-overs. Nothing else casts a shadow. Interior structure comes from rules: hairlines between rows, a 2px ink rule under every section head, a 3px double rule closing a total.

### Shadow Vocabulary
- **Sheet** (`--shadow-sheet`): the statement sheet resting on the band and desk. Used once.
- **Pop** (`--shadow-pop`): the sticky summary bar and chart tooltip, things that float over the sheet.
- **Register window** (inset shadows): the recessed counter windows of the on-prem meter.

### Named Rules
**The Paper Stack Rule.** Only the sheet and things floating above it get shadows. Sections inside the sheet are separated by perforations and rules, never by raised cards.

## Shapes

Corners are barely softened: 6px on the sheet, buttons, fields and segment groups; 4px on segment options and small icon buttons; 3px on tick boxes and register windows; 10px only on the sticky bar's bottom corners; full pills for chips. The recurring silhouettes are stationery ones: dashed 2px perforation lines with 9px semicircle notches punched through to the desk at both sheet edges, 2px dotted leaders, 2px vertical dashes for tear-off stubs, double rules under totals, and the skewed, irregularly rounded highlighter stroke (rotated -1.4deg, skewed -8deg).

## Components

### Buttons
Quiet, printed-form buttons; the only loud one is yellow.
- **Shape:** gently squared (6px), 36px tall, 14px side padding, 600 13.5px Public Sans, 16px inline SVG icons.
- **Default:** paper fill, rule-strong border, ink text; hover to recessed paper with an ink-secondary border; press nudges down 1px.
- **Primary:** ink fill with paper text; hover to ink-secondary.
- **Remit (copy link):** highlighter fill, ink border, 40px tall, 700 weight. One per statement stub; repeated in the sticky bar and as the phone-only copy button in the band.
- **Band ghost:** translucent white (5% fill, 24% border) on the navy, brightening on hover; focus outlines turn highlighter yellow inside the band.

### Chips
- **Style:** Plex Mono 500 11px pills, rule-strong outline, ink-secondary text.
- **Variants:** gov-authorized (ok tint, no border), non-US origin (flag tint), estimated (dashed border), unavailable (ink-tertiary), featured (ink border and text).

### Inputs / Fields
- **Style:** paper fill, rule-strong 1px border, 6px radius, 36px tall, 500 14px tabular figures. Selects carry an inline SVG chevron.
- **Focus:** border turns focus-blue with a 3px 25% focus-blue glow.
- **Error / Disabled:** invalid takes a flag-red border; disabled drops to 50% opacity.
- **Stepper:** a 118px boxed field with 32px minus and plus cells that share the focus glow.
- **Segmented rate plans:** a bordered 2px-padded group of options; the checked option fills ink with paper text, like a marked rate-plan box.
- **Tick boxes:** 18px printed squares with a 1.5px ink-secondary border that fill ink and scale in a check when ticked.

### Navigation
The band's top bar holds the mark, wordmark (700 16px display), data date and band-ghost actions. Once the statement scrolls away, a paper **sticky bar** slides down from the top (320ms) holding the mark, best-value model and its amount, the secondary figure behind a hairline divider, and the copy action; it drops its rounded corners and secondary figure on narrow screens.

### Bill Row (signature)
A definition row: 152px term column (84px on phones) in label type, then the line item in title type, a flexible 2px dotted leader, and the amount with a small unit. A descriptive line sits below in body-small. Rows divide on hairlines; the leader disappears on phones and the amount wraps under.

### Remittance Stub (signature)
The tear-off column at the right of the statement: Amount due as the highlighted figure closed by a double ink rule, a short term/value list (service, basis, per user), the OCR scan line encoding the scenario, then the remit button.

### Perforation (signature)
A 28px separator: a 2px dashed rule-strong line inset 22px, with desk-coloured semicircle notches punched at both sheet edges. Used between every top-level section of the sheet.

### Guilloché Ribbon (signature)
Two mirrored families of 22 envelope-modulated sine lines (white at 30%, highlighter at 55%, 0.7px non-scaling strokes) across a 64px band (48px on phones) with a 1px rule through the middle. The weave is seeded from the scenario hash, so every scenario prints its own security pattern, and paths morph over 900ms when it changes.

### Meter Numerals (signature)
Changing figures roll digit by digit on vertical strips (700ms ease-out). In register mode each digit sits in a dark counter window (#0b111d face, #f4f6fa digits, inset shadows) that stays dark in both themes.

## Do's and Don'ts

### Do:
- **Do** put new content on the statement sheet, separated from neighbours by a perforation, headed by a 1.5rem headline on a 2px ink rule.
- **Do** set facts as bill rows (term column, line item, dotted leader, right-set amount) before reaching for tables or tiles.
- **Do** close any total with a 3px double ink rule.
- **Do** keep every changing figure in tabular numerals or Plex Mono, and roll it with the meter wheels.
- **Do** keep the four series inks bound to closed / open / on-prem / reference in every chart, legend and dot.
- **Do** use the 160ms `cubic-bezier(0.16, 1, 0.3, 1)` ease for state changes and honour reduced motion by zeroing durations.

### Don't:
- **Don't** build KPI-card grids or a gradient hero; the band is an envelope, the content is a printed statement.
- **Don't** apply highlighter yellow to more than the one figure that answers the question and its send action.
- **Don't** add shadows to sections inside the sheet; only the sheet and floating layers (sticky bar, tooltip) cast one.
- **Don't** use letter-spaced uppercase labels or eyebrows above headings; labels are sentence case in the term column.
- **Don't** reuse a series ink for status; status uses the flag / ok / warn pairs.
