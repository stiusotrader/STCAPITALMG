const fetch = require("node-fetch");

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

  if (!FINNHUB_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: "FINNHUB_API_KEY not configured", fallback: true }),
    };
  }

  try {
    // Get market status + top movers from Finnhub
    // We'll fetch quotes for a curated list of large-cap stocks and sort by % change
    const WATCHLIST = [
      "AAPL","MSFT","NVDA","AMZN","META","GOOGL","TSLA","AMD","INTC","NFLX",
      "JPM","BAC","GS","WMT","PFE","JNJ","XOM","CVX","DIS","BABA",
      "COIN","MSTR","PLTR","HOOD","SOFI","NIO","RIVN","LCID","GME","AMC"
    ];

    const quotes = await Promise.all(
      WATCHLIST.map(async (sym) => {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`
          );
          const d = await r.json();
          return {
            symbol: sym,
            price: d.c,
            change: d.d,
            changePercent: d.dp,
            high: d.h,
            low: d.l,
            open: d.o,
            prevClose: d.pc,
          };
        } catch {
          return null;
        }
      })
    );

    const valid = quotes.filter((q) => q && q.price > 0 && q.changePercent !== null);
    valid.sort((a, b) => b.changePercent - a.changePercent);

    const gainers = valid.slice(0, 5);
    const losers = valid.slice(-5).reverse();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ gainers, losers }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
