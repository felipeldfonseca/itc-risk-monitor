# ITC Risk Cascade Monitor

Real-time macro cycle positioning dashboard based on Benjamin Cowen's ITC framework.

**Live**: [https://itc-risk-monitor.vercel.app](https://itc-risk-monitor.vercel.app)

## Quick Start

```bash
npm install
npm run dev
```

### Environment Variables

Create `.env` file:

```env
VITE_FRED_API_KEY=your_fred_api_key_here
```

Get a free FRED API key at: https://fred.stlouisfed.org/docs/api/api_key.html

## Tech Stack

- React 18 + Vite
- Recharts (Business Cycle chart)
- TradingView Widgets (Ratio charts)
- Vercel Serverless Functions (API proxies)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/coingecko` | BTC and Gold prices |
| `/api/fred?series=X` | Current FRED data (ICSA, UNRATE, FEDFUNDS, DTWEXBGS) |
| `/api/fred-historical?series=X` | Historical FRED series |
| `/api/business-cycle` | Business Cycle Metric calculation |

## Roadmap

### v1.0 (Complete)
- [x] Cascade stage visualization
- [x] Editable metric cards
- [x] BTC/Gold ratio tracker
- [x] Gold-BTC swap simulator
- [x] Variable DCA model
- [x] Action plan

### v2.0 (Complete)
- [x] Auto-fetch live data (FRED, CoinGecko)
- [x] Vercel serverless API proxies
- [x] BTC/Gold ratio chart (TradingView)
- [x] SPX/Gold ratio chart (TradingView)
- [x] Business Cycle Metric chart (Recharts)
- [x] Recession bands overlay
- [x] Mobile responsive layout

### v3.0 (Planned)
- [ ] Push notifications / Telegram alerts
- [ ] Portfolio tracker

## License

MIT
