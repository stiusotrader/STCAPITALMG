const fetch = require("node-fetch");

exports.handler = async function () {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };

  try {
    const [dolarRes, riesgoRes] = await Promise.allSettled([
      fetch("https://dolarapi.com/v1/dolares"),
      fetch("https://api.estadisticasbcra.com/riesgo_pais"),
    ]);

    let dolares = {};
    if (dolarRes.status === "fulfilled" && dolarRes.value.ok) {
      const arr = await dolarRes.value.json();
      arr.forEach((d) => { dolares[d.casa] = d; });
    }

    let riesgoPais = null;
    if (riesgoRes.status === "fulfilled" && riesgoRes.value.ok) {
      const rd = await riesgoRes.value.json();
      if (Array.isArray(rd) && rd.length > 0) {
        riesgoPais = rd[rd.length - 1].v;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ dolares, riesgoPais }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
