
(function (global) {
  const Data = global.TrumpTrackData;
  if (!Data) return;

  function fmtPct(x) { return (x != null && isFinite(x)) ? x.toFixed(1) + "%" : "—"; }
  function fmt2(x) { return (x != null && isFinite(x)) ? x.toFixed(2) : "—"; }

  function lineChart(ctx, dates, values, label) {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label,
          data: values,
          fill: false,
          tension: 0.2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { intersect: false, mode: "index" }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 6 } },
          y: { ticks: { callback: (v) => v } }
        }
      }
    });
  }

  async function renderEconomy() {
    const cpiEl = document.getElementById("chart-cpi");
    if (!cpiEl) {
      return; // Economy
    }

    const cfg = [
      { key: "cpi", el: "chart-cpi", label: "CPI YoY", fmt: fmtPct, params: { observation_start: "2018-01-01" } },
      { key: "gdp_qoq_saar", el: "chart-gdp", label: "GDP QoQ (SAAR)", fmt: fmt2, params: { observation_start: "2018-01-01" } },
      { key: "unemployment", el: "chart-unemployment", label: "Unemployment Rate", fmt: fmtPct, params: { observation_start: "2018-01-01" } }
    ];

    for (const c of cfg) {
      try {
        const meta = Data.SERIES[c.key];
        if (!meta) throw new Error("Missing metadata for " + c.key);

        const { observations } = await Data.getSeries(meta.id, Object.assign({}, meta.params, c.params));

        const last = observations.filter(o => isFinite(o.value)).slice(-1)[0] || null;
        const dates = observations.map(o => o.date);
        const vals = observations.map(o => o.value);
        const ctx = document.getElementById(c.el).getContext("2d");
        lineChart(ctx, dates, vals, c.label);

        let idSuffix = c.key;
        if (c.key === "gdp_qoq_saar") idSuffix = "gdp";

        const kpi = document.getElementById("kpi-" + idSuffix);
        const asof = document.getElementById("asof-" + idSuffix);

        if (kpi && last) kpi.textContent = c.fmt(last.value);
        if (asof && last) asof.textContent = last.date;
      } catch (e) {
        console.warn("Chart render failed:", c, e);
      }
    }
  }

  async function renderApproval() {
    const canvas = document.getElementById("approvalChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    try {
      const res = await fetch("/data/approval_model.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const payload = await res.json();

      const series = Array.isArray(payload.series) ? payload.series : [];
      if (!series.length) throw new Error("Empty approval series");

      const labels = series.map(p => p.date);
      const approve = series.map(p => p.approve);
      const disapprove = series.map(p => p.disapprove);

      const last = series[series.length - 1];

      // KPIs
      const kpiApprove = document.getElementById("kpi-approval");
      const kpiDisapprove = document.getElementById("kpi-disapproval");
      const kpiNet = document.getElementById("kpi-approval-net");
      const kpiAsOf = document.getElementById("kpi-approval-asof");

      if (kpiApprove) kpiApprove.textContent = last.approve.toFixed(1) + "%";
      if (kpiDisapprove) kpiDisapprove.textContent = last.disapprove.toFixed(1) + "%";
      if (kpiNet) {
        const net = last.approve - last.disapprove;
        kpiNet.textContent = (net >= 0 ? "+" : "") + net.toFixed(1) + " pts";
      }
      if (kpiAsOf) kpiAsOf.textContent = payload.as_of || last.date;

      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Approve",
              data: approve,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.2,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)'
            },
            {
              label: "Disapprove",
              data: disapprove,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.2,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false }
          },
          scales: {
            x: {
              ticks: { maxTicksLimit: 8 }
            },
            y: {
              min: 25,
              max: 75,
              ticks: {
                callback: v => v + "%"
              }
            }
          }
        }
      });

    } catch (err) {
      console.warn("Approval chart failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderEconomy();
    renderApproval();
  });
})(window);
