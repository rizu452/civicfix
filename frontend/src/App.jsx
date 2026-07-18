import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const fetchBrowserCoordinates = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: "17.3850", longitude: "78.4867" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
      () => resolve({ latitude: "17.3850", longitude: "78.4867" })
    );
  });
};

function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [complaints, setComplaints] = useState([]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false); // AI Loading Trigger State
  const [loading, setLoading] = useState(true);

  const refreshDashboardData = () => {
    fetch("http://127.0.0.1:8000/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshDashboardData();
    const runtimeSyncInterval = setInterval(refreshDashboardData, 8000);
    return () => clearInterval(runtimeSyncInterval);
  }, []);

  // 🤖 AUTOMATIC AI IMAGE TRIGGER EVENT FUNCTION HANDLER
  const handleFileChangeAndAnalyze = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAiAnalyzing(true);
    setDescription("AI is scanning image arrays for civic anomalies...");

    const uploadFormData = new FormData();
    uploadFormData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze-image", {
        method: "POST",
        body: uploadFormData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // 🎯 MAGIC STEP: Description automatically populated by backend AI processor!
        setDescription(data.detected_description);
      } else {
        setDescription("AI Failed to extract structural issue parameters context.");
      }
    } catch (err) {
      console.error("AI scanning pipeline timeout error exception:", err);
      setDescription("Error reaching AI detection node server.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const position = await fetchBrowserCoordinates();
    const formPayload = new FormData();
    formPayload.append("description", description);
    formPayload.append("latitude", position.latitude);
    formPayload.append("longitude", position.longitude);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/report", {
        method: "POST",
        body: formPayload,
      });
      if (res.ok) {
        alert("Success! AI Generated Issue recorded in memory cache node.");
        setDescription("");
        setFile(null);
        refreshDashboardData();
        setActiveTab("Complaints");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status.toLowerCase() === "pending").length;
  const resolved = total - pending;

  const styles = {
    btnPrimary: { backgroundColor: "#2563eb", color: "white", padding: "12px 24px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    btnSecondary: { backgroundColor: "#10b981", color: "white", padding: "12px 24px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }
  };

  return (
    <div style={{ fontFamily: "sans-serif", margin: 0, padding: 0, backgroundColor: "#ffffff", minHeight: "100vh" }}>
      
      {/* HEADER NAV MATCH */}
      <nav style={{ backgroundColor: "#2563eb", padding: "15px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
        <h2 style={{ margin: 0, fontWeight: "bold", cursor: "pointer" }} onClick={() => setActiveTab("Home")}>CivicFix AI</h2>
        <ul style={{ display: "flex", gap: "30px", listStyle: "none", margin: 0, padding: 0, fontSize: "16px" }}>
          {["Home", "Report", "Complaints", "Dashboard"].map((tab) => (
            <li key={tab} style={{ cursor: "pointer", borderBottom: activeTab === tab ? "2px solid white" : "none", paddingBottom: "2px", fontWeight: activeTab === tab ? "bold" : "normal" }} onClick={() => setActiveTab(tab)}>
              {tab}
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ padding: "40px 20px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* VIEW 1: HOME PAGE VIEW */}
        {activeTab === "Home" && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <h1 style={{ color: "#1e40af", fontSize: "42px", margin: "0 0 10px 0" }}>CivicFix AI</h1>
            <h3 style={{ color: "#1f2937", fontSize: "22px", fontWeight: "600", margin: "0 0 15px 0" }}>AI Powered Complaint Management</h3>
            <p style={{ color: "#4b5563", fontSize: "16px", margin: "0 0 40px 0" }}>Upload a photo of a civic issue and let AI identify it.</p>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#4b5563", fontWeight: "bold", fontSize: "16px", marginBottom: "40px" }}>
              <div>📷 Upload Image</div>
              <div>↓</div>
              <div>🤖 AI Detects Issue</div>
              <div>↓</div>
              <div>💾 Save Complaint</div>
              <div>↓</div>
              <div>📋 Track Status</div>
            </div>

            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
              <button style={styles.btnPrimary} onClick={() => setActiveTab("Report")}>Report Complaint</button>
              <button style={styles.btnSecondary} onClick={() => setActiveTab("Complaints")}>View Complaints</button>
            </div>
          </div>
        )}

        {/* VIEW 2: FORM SUBMISSION INTERFACE WITH DYNAMIC AUTO-FILL AI PIPELINE */}
        {activeTab === "Report" && (
          <div style={{ maxWidth: "500px", margin: "0 auto", background: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ textAlign: "center", color: "#111827", margin: "0 0 5px 0" }}>Report a Civic Issue</h2>
            <p style={{ textAlign: "center", color: "#4b5563", margin: "0 0 25px 0", fontWeight: "bold" }}>Upload Issue Photo:</p>
            
            <form onSubmit={handleIssueSubmit}>
              <div style={{ textAlign: "center", marginBottom: "25px" }}>
                {/* 🎯 CHANGED EVENT: Triggers auto-description generator hook on selection */}
                <input type="file" accept="image/*" onChange={handleFileChangeAndAnalyze} style={{ display: "inline-block", border: "1px solid #ccc", padding: "6px", borderRadius: "4px" }} />
              </div>
              
              <label style={{ display: "block", color: "#374151", fontWeight: "bold", marginBottom: "8px", textAlign: "center" }}>
                Description: {aiAnalyzing && <span style={{ color: "#2563eb", fontSize: "12px" }}> (🤖 AI Processing...)</span>}
              </label>
              
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="AI will auto-populate context upon image attachment..." style={{ width: "100%", height: "100px", padding: "10px", boxSizing: "border-box", marginBottom: "20px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
              
              <button type="submit" disabled={submitting || aiAnalyzing} style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                {submitting ? "Synchronizing Records..." : "Submit to CivicFix AI"}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: COMPLAINTS MAP LAYER */}
        {activeTab === "Complaints" && (
          <div>
            <h3 style={{ textAlign: "center", color: "#111827" }}>Active Geolocation Mapping Incidents</h3>
            <div style={{ background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "500px" }}>
              <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: "100%", width: "100%", borderRadius: "6px" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {complaints.map((m, index) => {
                  const lat = parseFloat(m.latitude);
                  const lng = parseFloat(m.longitude);
                  if (isNaN(lat) || isNaN(lng)) return null;
                  return (
                    <Marker key={m.id || index} position={[lat, lng]}>
                      <Popup>
                        <strong>Issue Context:</strong> <br /> {m.description} <br />
                        <span style={{ fontSize: "12px", color: m.status === "Pending" ? "#e6a23c" : "#67c23a", fontWeight: "bold" }}>Status: {m.status}</span>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* VIEW 4: PERFORMANCE DASHBOARD STATS */}
        {activeTab === "Dashboard" && (
          <div>
            <h3 style={{ textAlign: "center", color: "#111827", marginBottom: "25px" }}>Statistical Performance Metrics Dashboard</h3>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
              {[{ l: "Total Registered", c: total, color: "#2563eb" }, { l: "Pending Operational Verification", c: pending, color: "#d97706" }, { l: "Resolved Infrastructure Actions", c: resolved, color: "#059669" }].map((item, i) => (
                <div key={i} style={{ background: "white", padding: "20px 50px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <span style={{ fontSize: "14px", color: "#4b5563", fontWeight: "bold" }}>{item.l}</span>
                  <h2 style={{ margin: "10px 0 0 0", color: item.color, fontSize: "32px" }}>{loading ? "..." : item.c}</h2>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;