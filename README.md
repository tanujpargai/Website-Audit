# Website Audit — AI-Powered Website Analysis

A modern, standalone web application that produces business-friendly, consultant-grade website audit reports for business owners, founders, and digital agencies.

Instead of outputting developer jargon, Website Audit evaluates a public website's homepage across seven core dimensions, provides an authoritative health score (0–100), reveals key strengths, weaknesses, and prioritized improvements, and connects detected issues to actionable solutions from **Integral Labs**.

---

## Architecture & Analysis Model

Website Audit combines **objective technical measurement** with **Google Gemini qualitative interpretation**:

1. **Objective Scraper**: Fetches the submitted homepage using native server-side fetch with streaming size limits (3MB max) and strict SSRF defenses (blocking private/internal networks, loopbacks, and cloud metadata).
2. **Cheerio Extraction**: Determines 25+ objective data points:
   - Page title, meta description, and canonical link
   - Primary heading (H1) and subheading (H2) structure
   - Total image count and images missing alt attributes (treating intentional `alt=""` as valid decorative images)
   - Internal vs. external link counts (excluding duplicate anchors and mailto/tel links)
   - Contact signals (telephone links, mailto links, visible phone/email patterns, contact forms)
   - Call-to-action (CTA) signals (action buttons and links matching business triggers)
   - Social media profiles (Twitter/X, LinkedIn, GitHub, Facebook, Instagram, YouTube, TikTok)
   - Robots meta directives, viewport tag, Open Graph tags, and JSON-LD schema markup
   - Clean visible text sample and approximate word count
3. **Deterministic Scoring**:
   - **Technical Score (0–100)**: Evaluates HTTPS, HTTP status codes, mobile viewport configuration, canonical tags, indexing directives, Open Graph, and JSON-LD schema.
   - **SEO Score (0–100)**: Evaluates title length, meta description length, single H1 requirement, H2 hierarchy, image alt coverage, Open Graph discoverability, and canonical URLs.
4. **Gemini AI Qualitative Engine**: Interprets the objective findings to assess:
   - Business type & target audience
   - Design & visual hierarchy
   - User experience (UX) & navigation flow
   - Content clarity & value proposition resonance
   - Conversion paths & CTA visibility
   - Performance signals & lightweight asset indicators
5. **Authoritative Server Overall Score**: Calculated deterministically on the server:
   $$\text{Overall Score} = \text{round}(0.15 \cdot \text{Design} + 0.20 \cdot \text{UX} + 0.20 \cdot \text{SEO} + 0.15 \cdot \text{Content} + 0.15 \cdot \text{Conversion} + 0.05 \cdot \text{Performance} + 0.10 \cdot \text{Technical})$$
6. **Vetted Service Recommendations**: Connects audit findings strictly to an approved whitelist of 9 Integral Labs digital services.

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (tested on Node v22)
- npm (or yarn / pnpm)
- Google Gemini API Key

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Security Note:** `GEMINI_API_KEY` is loaded strictly on the server and is never exposed to client-side code (no `NEXT_PUBLIC_` prefix).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## Verification & Testing

The repository includes comprehensive automated test suites covering URL validation, SSRF protections, live public scraping, edge cases, and Gemini AI qualitative analysis.

- **Run Lint Check:**
  ```bash
  npm run lint
  ```

- **Run Unit & Integration Test Suite (46 Tests):**
  ```bash
  npx tsx scripts/test-audit.ts
  ```

- **Run Live End-to-End Gemini Audit Test:**
  ```bash
  npx tsx scripts/test-live-e2e.ts
  ```

---

## Product Limitations & Scope

- **Homepage-Only Analysis**: V1 analyzes only the submitted homepage. It does not perform recursive multi-page site crawling.
- **Client-Side Rendering (SPAs)**: The scraper parses server-rendered HTML. Single-page applications that render 100% of their DOM via client-side JavaScript will have limited visible text extracted on initial load.
- **Robots.txt**: Detects `<meta name="robots">` on the page itself, but does not fetch or parse separate `/robots.txt` files.
- **No Database / Authentication**: Fully stateless V1 architecture with no user accounts, tracking cookies, or database storage required.

