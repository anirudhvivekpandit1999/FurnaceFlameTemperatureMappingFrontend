import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import img from "./assets/abhitech-logo.png"

const BASE_URL = "https://furnaceflametemperaturemappingbackend.onrender.com";

const COLORS = {
  c1: "#1600d9",
  c2: "#B8860B",
  c3: "#1A6B8A",
  c4: "#6B3FA0",
  avg: "#C0392B",
};

const CORNER_LABELS = {
  c1: "Corner 1",
  c2: "Corner 2",
  c3: "Corner 3",
  c4: "Corner 4",
  avg: "Average",
};

export default function App() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [datasets, setDatasets] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await axios.get(`${BASE_URL}/history`);
    setHistory(res.data);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${BASE_URL}/upload`, formData);
    await fetchHistory();
    setUploading(false);
  };

  const toggleSelection = async (item) => {
    const isSelected = selected.includes(item.id);
    if (isSelected) {
      setSelected((prev) => prev.filter((id) => id !== item.id));
      return;
    }
    if (!datasets[item.id]) {
      const res = await axios.get(`${BASE_URL}/history/${item.id}`);
      setDatasets((prev) => ({ ...prev, [item.id]: res.data }));
    }
    setSelected((prev) => [...prev, item.id]);
  };

  const buildRunData = (dataset) =>
    dataset.elevation.map((el, i) => ({
      elevation: Number(el),
      c1: Number(dataset.corner1[i]),
      c2: Number(dataset.corner2[i]),
      c3: Number(dataset.corner3[i]),
      c4: Number(dataset.corner4[i]),
      avg: Number(dataset.average[i]),
    }));

  const buildComparisonData = () => {
    if (!selected.length) return [];
    const base = datasets[selected[0]];
    if (!base) return [];
    return base.elevation.map((el, i) => {
      let row = { elevation: Number(el) };
      selected.forEach((id) => {
        row[`run_${id}`] = Number(datasets[id]?.average[i]);
      });
      return row;
    });
  };

  const comparisonData = buildComparisonData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <div style={styles.tooltipHeader}>
            <span style={styles.tooltipLabel}>ELEVATION</span>
            <span style={styles.tooltipValue}>{label}m</span>
          </div>
          {payload.map((entry) => (
            <div key={entry.dataKey} style={styles.tooltipRow}>
              <span style={{ ...styles.tooltipDot, background: entry.color }} />
              <span style={styles.tooltipKey}>
                {CORNER_LABELS[entry.dataKey] || entry.dataKey}
              </span>
              <span style={{ ...styles.tooltipVal, color: entry.color }}>
                {Number(entry.value).toFixed(1)}°C
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>


      <div className="heat-bar" />
      <div className="grid-bg" />

      <div className="content" style={{ minHeight: "100vh" }}>

        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logoBlock}>
              <div style={styles.logoMark}>
                <img style={styles.logoImage} src={img} />
              </div>
              <div>
                <div style={styles.brandName}>ABHITECH FURNACE FLAME TEMPERATURE MAPPING</div>
                <div style={styles.brandTagline}>FURNACE FLAME TEMPERATURE MAPPING SYSTEM</div>
              </div>
            </div>

            <div style={styles.headerStats}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{history.length}</span>
                <span style={styles.statLabel}>RUNS LOGGED</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNum}>{selected.length}</span>
                <span style={styles.statLabel}>SELECTED</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <div className="pulse-dot" />
                <span style={styles.statLabel}>LIVE</span>
              </div>
            </div>
          </div>
        </header>

        <div style={styles.mainLayout}>

          <aside style={styles.sidebar}>
            <div style={styles.sideSection}>
              <div style={styles.sideLabel}>INGEST DATA</div>
              <label className="upload-zone">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1v8M4 4l3-3 3 3M2 11h10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {uploading ? "UPLOADING..." : "UPLOAD CSV"}
                <input type="file" onChange={handleUpload} accept=".csv" />
              </label>
            </div>

            <div style={{ ...styles.sideSection, borderBottom: "none" }}>
              <div style={styles.sideLabel}>RUN ARCHIVE</div>
              <div style={styles.runList}>
                {history.length === 0 && (
                  <div style={styles.emptyState}>No runs found. Upload a CSV to begin.</div>
                )}
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`run-card ${selected.includes(item.id) ? "active" : ""}`}
                    onClick={() => toggleSelection(item)}
                  >
                    <div className={`checkbox-custom ${selected.includes(item.id) ? "checked" : ""}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.runFileName}>
                        {item.filename.replace(/\.[^/.]+$/, "")}
                      </div>
                      <div style={styles.runMeta}>
                        {new Date(item.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })} · {new Date(item.timestamp).toLocaleTimeString("en-GB", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div style={{
                      ...styles.runIndex,
                      color: selected.includes(item.id) ? "#0400d9" : "#b5b7c8"
                    }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main style={styles.mainContent}>

            {selected.length === 0 && (
              <div style={styles.emptyMain}>
                <div style={styles.emptyIcon}>
                  <img style={styles.logoImage} src={img} />

                </div>
                <div style={styles.emptyTitle}>SELECT A RUN TO ANALYZE</div>
                <div style={styles.emptyBody}>
                  Choose one or more runs from the archive to visualize thermal profiles and compare performance across sessions.
                </div>
              </div>
            )}

            {selected.map((id, runIdx) => {
              const dataset = datasets[id];
              if (!dataset) return null;
              const runData = buildRunData(dataset);
              const temps = runData.map((r) => r.avg);
              const maxTemp = Math.max(...temps);
              const minTemp = Math.min(...temps);
              const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

              const accentHues = ["#0000d9", "#271a8a", "#3f41a0", "#0e0bb8", "#402e7d"];
              const accent = accentHues[runIdx % accentHues.length];

              return (
                <section key={id} style={styles.runSection} className="section-paper">

                  <div style={styles.runHeader}>
                    <div style={styles.runTitleBlock}>
                      <div style={{ ...styles.runAccent, background: accent }} />
                      <div>
                        <div style={styles.runTitle}>
                          {dataset.filename.replace(/\.[^/.]+$/, "").toUpperCase()}
                        </div>
                        <div style={styles.runSubtitle}>{dataset.filename}</div>
                      </div>
                    </div>

                    <div style={styles.runKpis}>
                      {[
                        { label: "PEAK TEMP", value: `${maxTemp.toFixed(0)}°C`, color: "#2b2bc0" },
                        { label: "FLOOR TEMP", value: `${minTemp.toFixed(0)}°C`, color: "#1a258a" },
                        { label: "AVG TEMP", value: `${avgTemp}°C`, color: "#0e00d9" },
                        { label: "DATA POINTS", value: runData.length, color: "#39355a" },
                      ].map((kpi) => (
                        <div key={kpi.label} style={styles.kpiCard}>
                          <div style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</div>
                          <div style={styles.kpiLabel}>{kpi.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.chartPanel}>
                    <div style={styles.chartLabel}>THERMAL PROFILE — ELEVATION VS TEMPERATURE</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={runData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="2 6" stroke="rgba(26,22,18,0.06)" vertical={false} />
                        <XAxis
                          dataKey="elevation"
                          stroke="rgba(18, 18, 26, 0.15)"
                          tick={{ fill: "#88849a", fontSize: 10, fontFamily: "'DM Mono'" }}
                          tickLine={false}
                          axisLine={{ stroke: "rgba(43, 0, 217, 0.2)" }}
                          label={{ value: "ELEVATION (m)", position: "insideBottomRight", offset: -10, fill: "#a7a6b8", fontSize: 9, fontFamily: "'DM Mono'", letterSpacing: "0.1em" }}
                        />
                        <YAxis
                          type="number"
                          domain={[500, Math.max]}
                          allowDataOverflow
                          stroke="rgba(20, 18, 26, 0.1)"
                          tick={{ fill: "#84849a", fontSize: 10, fontFamily: "'DM Mono'" }}
                          tickLine={false}
                          axisLine={false}
                          width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line dataKey="c1" stroke={COLORS.c1} strokeWidth={1.5} dot={false} name="Corner 1" />
                        <Line dataKey="c2" stroke={COLORS.c2} strokeWidth={1.5} dot={false} name="Corner 2" />
                        <Line dataKey="c3" stroke={COLORS.c3} strokeWidth={1.5} dot={false} name="Corner 3" />
                        <Line dataKey="c4" stroke={COLORS.c4} strokeWidth={1.5} dot={false} name="Corner 4" />
                        <Line dataKey="avg" stroke={COLORS.avg} strokeWidth={3} dot={false} name="Average" />
                      </LineChart>
                    </ResponsiveContainer>

                    <div style={styles.legendRow}>
                      {Object.entries(COLORS).map(([key, color]) => (
                        <div key={key} style={styles.legendItem}>
                          <div style={{
                            width: key === "avg" ? 20 : 12,
                            height: key === "avg" ? 3 : 2,
                            background: color,
                            borderRadius: 2,
                            flexShrink: 0,
                          }} />
                          <span style={{ ...styles.legendText, color: key === "avg" ? color : "#69657a" }}>
                            {CORNER_LABELS[key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.tablePanel}>
                    <div style={styles.chartLabel}>RAW MEASUREMENT DATA</div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ELEVATION</th>
                            <th>CORNER 1</th>
                            <th>CORNER 2</th>
                            <th>CORNER 3</th>
                            <th>CORNER 4</th>
                            <th style={{ color: "#1900d9" }}>AVERAGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataset.elevation.map((_, i) => (
                            <tr key={i}>
                              <td>{dataset.elevation[i]}m</td>
                              <td>{dataset.corner1[i]}</td>
                              <td>{dataset.corner2[i]}</td>
                              <td>{dataset.corner3[i]}</td>
                              <td>{dataset.corner4[i]}</td>
                              <td className="avg-col">{dataset.average[i]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </section>
              );
            })}

            {selected.length > 1 && (
              <section style={{ ...styles.runSection, borderColor: "rgba(34, 11, 184, 0.2)" }} className="section-paper">
                <div style={styles.runHeader}>
                  <div style={styles.runTitleBlock}>
                    <div style={{ ...styles.runAccent, background: "#0b0bb8" }} />
                    <div>
                      <div style={styles.runTitle}>CROSS-RUN COMPARATIVE ANALYSIS</div>
                      <div style={styles.runSubtitle}>Average temperature overlay — {selected.length} runs selected</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selected.map((id, i) => (
                      <div key={id} className="comparison-run-label">
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: `hsl(${i * 70 + 15}, 65%, 45%)` }} />
                        {datasets[id]?.filename.replace(/\.[^/.]+$/, "") || `Run ${id}`}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.chartPanel}>
                  <div style={styles.chartLabel}>AVG TEMPERATURE BY ELEVATION — ALL RUNS</div>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={comparisonData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="2 6" stroke="rgba(20, 18, 26, 0.05)" vertical={false} />
                      <XAxis
                        dataKey="elevation"
                        stroke="rgba(18, 18, 26, 0.12)"
                        tick={{ fill: "#84869a", fontSize: 10, fontFamily: "'DM Mono'" }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(43, 11, 184, 0.2)" }}
                      />
                      <YAxis
                        type="number"
                        domain={[500,Math.max]}
                        allowDataOverflow
                        stroke="rgba(20, 18, 26, 0.1)"
                        tick={{ fill: "#85849a", fontSize: 10, fontFamily: "'DM Mono'" }}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "#69657a", letterSpacing: "0.1em" }}>
                            {datasets[value.replace("run_", "")]?.filename.replace(/\.[^/.]+$/, "") || value}
                          </span>
                        )}
                      />
                      {selected.map((id, i) => (
                        <Line
                          key={id}
                          dataKey={`run_${id}`}
                          stroke={`hsl(${i * 70 + 15}, 65%, 45%)`}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid #d1cfe0",
    background: "rgba(238, 237, 245, 0.95)",
    backdropFilter: "blur(16px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 1px 0 rgba(14, 0, 217, 0.08), 0 2px 16px rgba(18, 19, 26, 0.05)",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "64px",
    width: "100%",
  },
  logoBlock: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoMark: {
    width: "40px",
    height: "40px",
    border: "1.5px solid rgba(11, 0, 217, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
    background: "rgba(18, 0, 217, 0.05)",
    overflow: "hidden",
  },
  brandName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px",
    letterSpacing: "0.15em",
    color: "#12121a",
    lineHeight: 1,
  },
  brandTagline: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: "rgba(18, 0, 217, 0.65)",
    textTransform: "uppercase",
    marginTop: "3px",
  },
  headerStats: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statNum: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "22px",
    color: "#000ed9",
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.15em",
    color: "#85849a",
    textTransform: "uppercase",
  },
  statDivider: {
    width: "1px",
    height: "24px",
    background: "#cfd2e0",
  },
  mainLayout: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
    width: "100%",
  },
  sidebar: {
    width: "280px",
    flexShrink: 0,
    borderRight: "1px solid #d3cfe0",
    background: "#f8f7fd",
    padding: "24px 0",
    overflowY: "auto",
    maxHeight: "calc(100vh - 64px)",
    position: "sticky",
    top: "64px",
  },
  sideSection: {
    padding: "0 16px 24px",
    borderBottom: "1px solid #e0dfee",
    marginBottom: "0",
  },
  sideLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.25em",
    color: "rgba(4, 0, 217, 0.55)",
    textTransform: "uppercase",
    marginBottom: "12px",
    paddingTop: "8px",
  },
  runList: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  runFileName: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#1d1a2a",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  runMeta: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    color: "#87849a",
    marginTop: "3px",
    letterSpacing: "0.04em",
  },
  logoImage: {
    maxWidth: "70%",
    maxHeight: "70%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  },
  runIndex: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "16px",
    letterSpacing: "0.1em",
    transition: "color 0.2s",
  },
  emptyState: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    color: "#a6a8b8",
    lineHeight: 1.7,
    letterSpacing: "0.04em",
  },
  mainContent: {
    flex: 1,
    padding: "32px 40px",
    background: "#ededf5",
    minWidth: 0,
  },
  emptyMain: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "20px",
    textAlign: "center",
  },
  emptyIcon: { opacity: 0.7 },
  emptyTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px",
    letterSpacing: "0.2em",
    color: "#b5b7c8",
  },
  emptyBody: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#84879a",
    maxWidth: "360px",
    lineHeight: 1.7,
  },
  runSection: {
    marginBottom: "28px",
    overflow: "hidden",
    transition: "box-shadow 0.2s ease",
  },
  runHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    padding: "22px 28px",
    borderBottom: "1px solid #e3e3f0",
    background: "#f7f8fd",
    flexWrap: "wrap",
  },
  runTitleBlock: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },
  runAccent: {
    width: "3px",
    height: "40px",
    flexShrink: 0,
    marginTop: "2px",
  },
  runTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "22px",
    letterSpacing: "0.12em",
    color: "#13121a",
    lineHeight: 1,
  },
  runSubtitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    color: "#84859a",
    letterSpacing: "0.08em",
    marginTop: "5px",
  },
  runKpis: {
    display: "flex",
    gap: "1px",
  },
  kpiCard: {
    padding: "10px 20px",
    background: "#eeedf5",
    borderLeft: "1px solid #dfe1ee",
    textAlign: "right",
    minWidth: "90px",
  },
  kpiValue: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "22px",
    letterSpacing: "0.05em",
    lineHeight: 1,
  },
  kpiLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "8px",
    letterSpacing: "0.2em",
    color: "#84889a",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  chartPanel: {
    padding: "24px 28px",
    borderBottom: "1px solid #e3e3f0",
    background: "#ffffff",
  },
  chartLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.25em",
    color: "rgba(0, 29, 217, 0.55)",
    textTransform: "uppercase",
    marginBottom: "20px",
  },
  legendRow: {
    display: "flex",
    gap: "20px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  tablePanel: {
    padding: "24px 28px",
    background: "#ffffff",
  },
  tooltip: {
    background: "#ffffff",
    border: "1px solid #cfd1e0",
    padding: "12px 16px",
    minWidth: "200px",
    boxShadow: "0 8px 32px rgba(18, 20, 26, 0.12)",
  },
  tooltipHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e3e5f0",
  },
  tooltipLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.2em",
    color: "#84859a",
  },
  tooltipValue: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "16px",
    color: "#0021d9",
    letterSpacing: "0.1em",
  },
  tooltipRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "5px",
  },
  tooltipDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  tooltipKey: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    color: "#88849a",
    flex: 1,
    letterSpacing: "0.08em",
  },
  tooltipVal: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    fontWeight: "500",
    letterSpacing: "0.05em",
  },
};