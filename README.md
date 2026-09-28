# Ahrefs SEO Auditor Pro

An enterprise-grade, high-capacity Multi-Page SEO Crawler and Technical Health Audit platform built with Node.js, Express, Cheerio, React, and Vite.

![SEO Auditor Pro](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

* **Multi-Page & Direct XML Sitemap Crawler:**
  * Auto-discovers and parses XML sitemaps (including nested `<sitemapindex>` and thousands of URLs).
  * Direct Sitemap XML Input mode (e.g., `https://example.com/sitemap.xml`).
  * Concurrency pool with 20 parallel spider workers capable of crawling 10,000+ pages.

* **Ahrefs-Grade Site Health & Audit Reports:**
  * Aggregate 0–100% Site Health Score with letter grades (`A+` to `F`).
  * Crawled URL distribution (`200 OK`, `3xx Redirects`, `4xx Broken Links`, `5xx Errors`).
  * Site-wide issue aggregation with affected URL listings and actionable remediation recommendations.

* **Exact Image ALT Tracking & Remediation Center:**
  * Live visual thumbnail previews of every image on every page.
  * Exact image source URLs with 1-click new tab opening.
  * Context-aware auto-generated suggested ALT attributes.
  * 1-click HTML fix copy (`<img src="..." alt="..." />`).
  * Dedicated **Export Missing Image ALTs (CSV)** report.

* **On-Page & Technical SEO Diagnostics:**
  * **Meta Tags:** Title tag length & pixel width analysis, meta descriptions, canonical URLs, robots directives.
  * **Headings Structure:** Single H1 validation and H2–H6 hierarchy tree.
  * **Content & Readability:** Word count, text-to-HTML ratio, Flesch-Kincaid readability scoring, keyword density tables.
  * **Structured Data:** Schema.org JSON-LD and Microdata parser with JSON blueprint viewer.
  * **Security & Performance:** HTTPS validation, security headers (`HSTS`, `CSP`, `X-Frame-Options`), response times, and TTFB.

* **SERP & Social Preview Generator:**
  * Live Google Search Desktop & Mobile snippet simulator with real-time editing.
  * Facebook / LinkedIn Open Graph and Twitter Card social previews.

* **Export Suite:**
  * Export all crawled pages to CSV.
  * Export all discovered sitemap URLs to TXT.
  * Export missing ALT images to CSV.
  * Print / Save executive PDF reports.

---

## 🛠 Tech Stack

* **Backend:** Node.js, Express, Cheerio, Axios, Connection Pooling (`http.Agent` / `https.Agent`)
* **Frontend:** React 19, Vite, Lucide Icons, Vanilla Modern Glassmorphic CSS
* **Typography:** Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)

---

## 🏁 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/abuzannat911-lab/ahref-seo.git
cd ahref-seo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

* **Frontend UI:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5001](http://localhost:5001)

---

## 📄 License
ISC License. Built for high-performance SEO auditing.
