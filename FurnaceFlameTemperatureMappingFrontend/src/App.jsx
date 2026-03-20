import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

const BASE_URL = "https://furnaceflametemperaturemappingbackend.onrender.com";

export default function App() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [datasets, setDatasets] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${BASE_URL}/upload`, formData);
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const toggleSelection = async (item) => {
    const isSelected = selected.includes(item.id);

    if (isSelected) {
      setSelected(prev => prev.filter(id => id !== item.id));
      return;
    }

    if (!datasets[item.id]) {
      try {
        const res = await axios.get(`${BASE_URL}/history/${item.id}`);
        setDatasets(prev => ({
          ...prev,
          [item.id]: res.data
        }));
      } catch (err) {
        console.error("Error loading dataset", err);
        return;
      }
    }

    setSelected(prev => [...prev, item.id]);
  };

  // 🔥 Individual run data builder
  const buildRunData = (dataset) => {
    return dataset.elevation.map((el, i) => ({
      elevation: safeNumber(el),
      c1: safeNumber(dataset.corner1[i]),
      c2: safeNumber(dataset.corner2[i]),
      c3: safeNumber(dataset.corner3[i]),
      c4: safeNumber(dataset.corner4[i]),
      avg: safeNumber(dataset.average[i])
    }));
  };

  // 🔥 Comparison builder
  const buildComparisonData = () => {
    if (selected.length === 0) return [];

    const base = datasets[selected[0]];
    if (!base) return [];

    return base.elevation.map((el, i) => {
      let row = {
        elevation: safeNumber(el)
      };

      selected.forEach((id) => {
        const dataset = datasets[id];
        if (!dataset) return;

        row[`run_${id}`] = safeNumber(dataset.average[i]);
      });

      return row;
    });
  };

  const comparisonData = buildComparisonData();

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Furnace Flame Temperature Dashboard</h2>

      <input type="file" onChange={handleUpload} />

      {/* ================= HISTORY ================= */}
      <h3>📁 Saved History</h3>

      {history.length === 0 && <p>No saved runs</p>}

      {history.map((item) => (
        <div key={item.id}>
          <label>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggleSelection(item)}
            />
            <b>{item.filename}</b> —{" "}
            <small>{new Date(item.timestamp).toLocaleString()}</small>
          </label>
        </div>
      ))}

      {/* ================= PER RUN VIEW ================= */}
      {selected.map((id) => {
        const dataset = datasets[id];
        if (!dataset) return null;

        const runData = buildRunData(dataset);

        return (
          <div key={id} style={{ marginBottom: 40 }}>
            <h3>
              📄 {dataset.filename} —{" "}
              {new Date(dataset.timestamp).toLocaleString()}
            </h3>

            {/* ===== TABLE ===== */}
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th>Elevation</th>
                  <th>C1</th>
                  <th>C2</th>
                  <th>C3</th>
                  <th>C4</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {dataset.elevation.map((_, i) => (
                  <tr key={i}>
                    <td>{dataset.elevation[i]}</td>
                    <td>{dataset.corner1[i]}</td>
                    <td>{dataset.corner2[i]}</td>
                    <td>{dataset.corner3[i]}</td>
                    <td>{dataset.corner4[i]}</td>
                    <td>{dataset.average[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ===== INDIVIDUAL GRAPH ===== */}
            <h4>📈 Individual Temperature Profile</h4>
            <LineChart width={800} height={400} data={runData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="elevation" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line dataKey="c1" stroke="#8884d8" name="Corner 1" />
              <Line dataKey="c2" stroke="#82ca9d" name="Corner 2" />
              <Line dataKey="c3" stroke="#ff7300" name="Corner 3" />
              <Line dataKey="c4" stroke="#000000" name="Corner 4" />
              <Line dataKey="avg" stroke="#ff0000" name="Average" strokeWidth={3} />
            </LineChart>
          </div>
        );
      })}

      {/* ================= COMPARISON ================= */}
      {selected.length > 0 && (
        <>
          <h3>📈 Run Comparison (Average)</h3>

          <LineChart width={900} height={500} data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="elevation" />
            <YAxis />
            <Tooltip />
            <Legend />

            {selected.map((id, i) => (
              <Line
                key={id}
                dataKey={`run_${id}`}
                name={`Run ${i + 1}`}
                stroke={`hsl(${i * 60}, 70%, 50%)`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </>
      )}
    </div>
  );
}