const fetch = require("node-fetch");

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const symbol = event.queryStringParameters?.symbol;
  const range = event.queryStringParameters?.range || "1d";
  const interval = event.queryStringParameters?.interval || "5m";

  if (!symbol) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "symbol required" }) };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const url2 = url.replace("query1", "query2");
      const res2 = await fetch(url2, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });
      if (!res2.ok) throw new Error(`Yahoo Finance error: ${res2.status}`);
      const data2 = await res2.json();
      return { statusCode: 200, headers, body: JSON.stringify(data2) };
    }

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
