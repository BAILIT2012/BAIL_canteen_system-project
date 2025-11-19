import React from "react";

function Maintenance() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f5f5",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        🚧 Site Under Maintenance
      </h1>
      <p style={{ fontSize: "18px", maxWidth: "500px" }}>
        We’re working on improvements.  
        Please check back in a while.
      </p>
    </div>
  );
}

export default Maintenance;
