// src/components/BetaBadge.jsx
import React from "react";

function BetaVersion() {
  return (
    <div style={{
      position: "fixed",
      top: "10px",
      right: "15px",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      background: "#f5f5f5",
      padding: "10px 10px",
      borderRadius: "20px",
      boxShadow: "0 0 5px rgba(0,0,0,0.2)",
      fontSize: "13px",
      fontWeight: "600"
    }}>
      <span
        style={{
          width: "20px",
          height: "20px",
          background: "#00cc44",
          borderRadius: "50%",
          marginRight: "6px",
          boxShadow: "0 0 4px #00cc44"
        }}
      ></span>
      Beta Version
    </div>
  );
}


export default BetaVersion;