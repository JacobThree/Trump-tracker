
(function (global) {
  const cfg = (global.TRUMPTRACK_CONFIG || {});
  const API = "https://api.stlouisfed.org/fred/series/observations";

  function qs(params) {
    return Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  }


  function fredURL(series_id, params = {}) {
    const p = Object.assign({
      series_id,
      api_key: cfg.FRED_API_KEY || "",
      file_type: "json"
    }, params || {});
    return `${API}?${qs(p)}`;
  }


  function proxied(url) {
    if (!cfg.FRED_PROXY_URL) return url;
    const u = cfg.FRED_PROXY_URL.replace(/\/+$/, "");
    return `${u}?url=${encodeURIComponent(url)}`;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }


  async function getSeries(series_id, params = {}) {
    const url = proxied(fredURL(series_id, params));
    const j = await fetchJSON(url);
    const obs = (j.observations || [])
      .filter(o => o.value !== ".")
      .map(o => ({ date: o.date, value: Number(o.value) }));
    return { series_id, units: j.units, observations: obs };
  }


  const SERIES = {
    cpi: { id: "CPIAUCSL", params: { units: "pc1" } },
    gdp_qoq_saar: { id: "A191RL1Q225SBEA", params: {} },
    unemployment: { id: "UNRATE", params: {} }
  };


  global.TrumpTrackData = {
    fredURL, proxied, getSeries, SERIES
  };
})(window);
