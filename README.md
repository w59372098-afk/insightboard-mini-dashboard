# InsightBoard — Mini Analytics Dashboard

A responsive, accessible dashboard built with HTML, CSS, vanilla JavaScript, and a static JSON dataset. It includes KPI cards, a generated SVG revenue chart, sales-channel visualization, and a sortable/searchable transactions table.

## Run locally
Because the dashboard fetches `data.json`, run it using a local HTTP server rather than opening `index.html` directly.
- Python: `python -m http.server 8000`
- Then open `http://localhost:8000` in your browser.

## Features
- Loads transaction records asynchronously from `data.json`.
- Filters dashboard data by period (all months, Q3, or Q4).
- Filters the table by transaction status and searches customer names.
- Sorts the transaction table by order ID, customer, date, amount, or status.
- Updates KPI cards and the revenue chart from the selected dataset.
- Responsive layout for desktop, tablet, and mobile.
- Semantic landmarks, skip link, table caption and scoped headers, keyboard-visible focus, labels, accessible live status messages, and reduced-motion support.
- No external JavaScript or CSS libraries and no external network requests.

## Notes
This is an educational dashboard with sample transactions and illustrative channel distribution. It is not connected to a live commerce system. Amounts are displayed in USD to keep the demo self-contained.
