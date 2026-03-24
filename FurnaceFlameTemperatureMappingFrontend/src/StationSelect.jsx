import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import img from "./assets/abhitech-logo.png";

const BASE_URL = "https://furnaceflametemperaturemappingbackend.onrender.com";

export default function StationSelect() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStations([
      { id: 1, name: "BSL" },
      { id: 2, name: "CSTPS" },
      { id: 3, name: "KPKD" },
      { id: 4, name: "KTPS" },
      { id: 5, name: "NTPS" },
      { id: 6, name: "PARAS TPS" },
      { id: 7, name: "PARALI TPS" },
      
    ]);
  }, []);

  const fetchUnits = (stationId) => {
    if (stationId === 1) {
      setUnits([
        { id: 1, name: "Unit 3" },
        { id: 2, name: "Unit 4" },
        { id: 3, name: "Unit 5" },
      ]);
    } 
    else if (stationId === 2) {
      setUnits([
        { id: 1, name: "Unit 3" },
        { id: 2, name: "Unit 4" },
        { id: 3, name: "Unit 5" },
        { id: 4, name: "Unit 6" },
        { id: 5, name: "Unit 7" },
        { id: 6, name: "Unit 8" },
        { id: 7, name: "Unit 9" },
        
      ]);
    } 
   else if (stationId === 3) {
      setUnits([
        { id: 1, name: "Unit 1" },
        { id: 2, name: "Unit 2" },
        { id: 3, name: "Unit 3" },
        { id: 4, name: "Unit 4" },
        { id: 5, name: "Unit 5" },
      ]);
    } 
   else if (stationId === 4) {
      setUnits([
        { id: 1, name: "Unit 6" },
        { id: 2, name: "Unit 8" },
        { id: 3, name: "Unit 9" },
        { id: 4, name: "Unit 10" },
      ]);
    } 
  else  if (stationId === 5) {
      setUnits([
        { id: 1, name: "Unit 3" },
        { id: 2, name: "Unit 4" },
        { id: 3, name: "Unit 5" },
      ]);
    } 
   else if (stationId === 6) {
      setUnits([
        { id: 1, name: "Unit 3" },
        { id: 2, name: "Unit 4" },
        
      ]);
    } 
   else  if (stationId === 7) {
      setUnits([
        { id: 1, name: "Unit 6" },
        { id: 2, name: "Unit 7" },
        { id: 3, name: "Unit 8" },
      ]);
    } 
    else {
      setUnits([]);
    }
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setSelectedUnit(null);
    fetchUnits(station.id);
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
  };

  const handleProceed = () => {
    if (selectedStation && selectedUnit) {
      localStorage.setItem("selectedStation", JSON.stringify(selectedStation));
      localStorage.setItem("selectedUnit", JSON.stringify(selectedUnit));
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="heat-bar" />
      <div className="grid-bg" />

      <div style={{ minHeight: "100vh", background: "#ededf5" }}>
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
          </div>
        </header>

        <div style={styles.mainContent}>
          <div style={styles.selectionContainer}>
            <div style={styles.selectionTitle}>SELECT STATION & UNIT</div>
            <div style={styles.selectionSubtitle}>
              Choose your station and unit to proceed with temperature mapping analysis.
            </div>

            <div style={styles.selectionSection}>
              <div style={styles.sectionLabel}>STATION</div>
              <div style={styles.buttonGrid}>
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationSelect(station)}
                    style={{
                      ...styles.selectionButton,
                      background: selectedStation?.id === station.id ? "#0000d9" : "#ffffff",
                      color: selectedStation?.id === station.id ? "#ffffff" : "#12121a",
                      borderColor: selectedStation?.id === station.id ? "#0000d9" : "#d1cfe0",
                    }}
                  >
                    {station.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedStation && (
              <div style={styles.selectionSection}>
                <div style={styles.sectionLabel}>UNIT — {selectedStation.name}</div>
                <div style={styles.buttonGrid}>
                  {units.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitSelect(unit)}
                      style={{
                        ...styles.selectionButton,
                        background: selectedUnit?.id === unit.id ? "#0000d9" : "#ffffff",
                        color: selectedUnit?.id === unit.id ? "#ffffff" : "#12121a",
                        borderColor: selectedUnit?.id === unit.id ? "#0000d9" : "#d1cfe0",
                      }}
                    >
                      {unit.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleProceed}
              disabled={!selectedStation || !selectedUnit}
              style={{
                ...styles.proceedButton,
                background: selectedStation && selectedUnit ? "#0000d9" : "#e0e0ef",
                color: selectedStation && selectedUnit ? "#ffffff" : "#85849a",
                cursor: selectedStation && selectedUnit ? "pointer" : "not-allowed",
              }}
            >
              PROCEED TO DASHBOARD
            </button>
          </div>
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
    justifyContent: "center",
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
  logoImage: {
    maxWidth: "70%",
    maxHeight: "70%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  },
  mainContent: {
    padding: "64px 40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 64px)",
  },
  selectionContainer: {
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
  },
  selectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "32px",
    letterSpacing: "0.1em",
    color: "#12121a",
    marginBottom: "8px",
  },
  selectionSubtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "#84879a",
    marginBottom: "48px",
    lineHeight: 1.5,
  },
  selectionSection: {
    marginBottom: "32px",
  },
  sectionLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.25em",
    color: "rgba(4, 0, 217, 0.55)",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  buttonGrid: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  selectionButton: {
    border: "1px solid #d1cfe0",
    background: "#ffffff",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.1em",
    padding: "12px 24px",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    minWidth: "120px",
  },
  proceedButton: {
    border: "none",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.15em",
    padding: "16px 32px",
    borderRadius: "6px",
    marginTop: "32px",
    transition: "all 0.2s ease",
  },
};