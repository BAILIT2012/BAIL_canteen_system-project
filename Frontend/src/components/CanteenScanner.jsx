import React from "react";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";


function CanteenScanner(){

     useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

      //new add code line 
   scanner.render(
  (decodedText) => {
    console.log("Scanned:", decodedText);

    let code = null;

    try {
      // Try to parse as URL
      const url = new URL(decodedText);
      code = url.searchParams.get("code");

      // If code missing in query param, try last path segment
      if (!code) {
        const parts = url.pathname.split("/").filter(Boolean);
        code = parts[parts.length - 1] || null;
      }
    } catch (e) {
      // If NOT a URL → maybe plain code (like "EMP001")
      code = decodedText.trim();
    }

    if (code) {
      console.log("Extracted Code:", code);
     window.location.href = `https://192.168.5.20:5175/canteen?code=${code}`;

    } else {
      alert("Invalid QR format");
    }
  },

  (error) => {
    console.warn(error);
  }
);

    return () => scanner.clear();
  }, []);
   

    return(
        <div>
            <h1>Qr Code Scanner</h1>
            <div id="qr-reader"></div>
        </div>
         
    );
}

export default CanteenScanner;