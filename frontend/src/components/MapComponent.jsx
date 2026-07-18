import React, { useState, useEffect } from "react";
// 📍 OpenStreetMap tile configuration components injection (No circular import!)
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker missing asset dynamic paths crash context templates
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapComponent() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchCoordinates = () => {
      // 🌐 Connects to Member 2's system host address
      fetch("http://192.168.137.1:8000/complaints")
        .then((res) => {
          if (!res.ok) throw new Error("Backend connection offline");
          return res.json();
        })
        .then((data) => {
          setMarkers(data || []);
        })
        .catch((err) => console.error("Error loading map coordinates array loop:", err));
    };

    fetchCoordinates();
    const interval = setInterval(fetchCoordinates, 10000); // 10 second refresh loop
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "450px", width: "100%", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <MapContainer 
        center={[17.3850, 78.4867]} // Hyderabad standard viewport center
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker, index) => {
          // Parse string metrics safely layout boundary checking elements
          const lat = parseFloat(marker.latitude);
          const lng = parseFloat(marker.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={marker.id || index} position={[lat, lng]}>
              <Popup>
                <strong>Civic Issue Reported</strong>
                <br />
                {marker.message || marker.description || "No description text details provided."}
                <br />
                <span style={{ fontSize: "11px", color: "#666" }}>
                  Status: {marker.status || "Pending"}
                </span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapComponent;