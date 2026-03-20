import { useState } from "react";
import axios from "axios";
import {
  ScatterChart,
  Scatter,
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
      const res = await axios.post("https://furnaceflametemperaturemappingbackend.onrender.com/upload", formData);
      console.log("API DATA:", res.data);
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

  const buildScatter = (key) => {
    if (!data) return [];

    return data.elevation
      .map((el, i) => ({
        x: safeNumber(data[key][i]),   
        y: safeNumber(el)              
      }))
      .filter(d => d.x !== null && d.y !== null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Furnace Flame Temperature Mapping</h2>

      <input type="file" onChange={handleUpload} />

      {data && (
        <>
          <h3>Flame Temperature Table</h3>
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

          <h3>Flame Temperature Graph</h3>
          <ScatterChart width={700} height={450}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="x"
              name="Temperature"
              label={{ value: "Temperature (°C)", position: "insideBottom" }}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="Elevation"
              label={{ value: "Elevation (m)", angle: -90, position: "insideLeft" }}
            />

            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />

            <Scatter name="Corner 1" data={buildScatter("corner1")} fill="#8884d8" />
            <Scatter name="Corner 2" data={buildScatter("corner2")} fill="#82ca9d" />
            <Scatter name="Corner 3" data={buildScatter("corner3")} fill="#ff7300" />
            <Scatter name="Corner 4" data={buildScatter("corner4")} fill="#000000" />
            <Scatter name="Average" data={buildScatter("average")} fill="#ff0000" />
          </ScatterChart>
        </>
      )}
    </div>
  );
}