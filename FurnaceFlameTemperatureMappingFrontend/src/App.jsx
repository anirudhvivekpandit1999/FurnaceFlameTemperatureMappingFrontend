import { useState } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export default function App() {
  const [data, setData] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://furnaceflametemperaturemappingbackend.onrender.com/upload",
        formData
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check backend.");
    }
  };

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const buildLineData = () => {
    if (!data) return [];

    return data.elevation.map((el, i) => ({
      elevation: safeNumber(el),
      c1: safeNumber(data.corner1[i]),
      c2: safeNumber(data.corner2[i]),
      c3: safeNumber(data.corner3[i]),
      c4: safeNumber(data.corner4[i]),
      avg: safeNumber(data.average[i])
    }));
  };

  const buildDeviationData = () => {
    if (!data) return [];

    return data.elevation.map((el, i) => {
      const avg = safeNumber(data.average[i]);
      return {
        elevation: safeNumber(el),
        d1: safeNumber(data.corner1[i]) - avg,
        d2: safeNumber(data.corner2[i]) - avg,
        d3: safeNumber(data.corner3[i]) - avg,
        d4: safeNumber(data.corner4[i]) - avg
      };
    });
  };

  const lineData = buildLineData();
  const deviationData = buildDeviationData();

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Furnace Flame Temperature Mapping</h2>

      <input type="file" onChange={handleUpload} />

      {data && (
        <>
          <h3>📊 Temperature Table</h3>
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
              {data.elevation.map((_, i) => (
                <tr key={i}>
                  <td>{data.elevation[i]}</td>
                  <td>{data.corner1[i]}</td>
                  <td>{data.corner2[i]}</td>
                  <td>{data.corner3[i]}</td>
                  <td>{data.corner4[i]}</td>
                  <td>{data.average[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>📈 Comparative Temperature (Best View)</h3>
          <LineChart width={800} height={450} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="elevation" label={{ value: "Elevation (m)", position: "insideBottom" }} />
            <YAxis label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="c1" stroke="#8884d8" name="Corner 1" />
            <Line type="monotone" dataKey="c2" stroke="#82ca9d" name="Corner 2" />
            <Line type="monotone" dataKey="c3" stroke="#ff7300" name="Corner 3" />
            <Line type="monotone" dataKey="c4" stroke="#000000" name="Corner 4" />
            <Line type="monotone" dataKey="avg" stroke="#ff0000" name="Average" strokeWidth={3} />
          </LineChart>

          <h3>🎯 Scatter View (Raw Distribution)</h3>
          <ScatterChart width={700} height={450}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" dataKey="x" name="Temperature" />
            <YAxis type="number" dataKey="y" name="Elevation" />

            <Tooltip />
            <Legend />

            {["corner1", "corner2", "corner3", "corner4", "average"].map((key, idx) => (
              <Scatter
                key={key}
                name={key}
                data={data.elevation.map((el, i) => ({
                  x: safeNumber(data[key][i]),
                  y: safeNumber(el)
                }))}
              />
            ))}
          </ScatterChart>

          <h3>⚠️ Deviation from Average (Imbalance Detection)</h3>
          <LineChart width={800} height={450} data={deviationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="elevation" />
            <YAxis label={{ value: "Deviation (°C)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />

            <Line dataKey="d1" stroke="#8884d8" name="C1 Deviation" />
            <Line dataKey="d2" stroke="#82ca9d" name="C2 Deviation" />
            <Line dataKey="d3" stroke="#ff7300" name="C3 Deviation" />
            <Line dataKey="d4" stroke="#000000" name="C4 Deviation" />
          </LineChart>
        </>
      )}
    </div>
  );
}