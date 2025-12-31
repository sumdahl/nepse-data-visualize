export const config = {
  scraper: {
    url: "https://nepsealpha.com/trading-signals/tech?v=1.0",
    tableSelector: "#funda-table",
    paginationContainerSelector: "#funda-table_paginate",
    nextButtonSelector: "#funda-table_paginate .paginate_button.next:not(.disabled)",
    currentPageSelector: "#funda-table_paginate .paginate_button.current",
    firstDataCellSelector: "#funda-table tbody tr:first-child td:first-child",
    headersWithITagTitle: [
      "10SMA",
      "Price > 20SMA",
      "Price > 50SMA",
      "Price > 200SMA",
      "5SMA > 20SMA",
      "SMA 50,200"
    ],
    headersWithTDTitle: [
      "Volume Trend",
      "3M TREND"
    ],
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    }
  },
  database: {
    connectionString: process.env.DATABASE_URL || "",
  }
};

