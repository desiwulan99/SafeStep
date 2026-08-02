import React, { useState } from "react";
import { ReportForm } from "./features/anonymous-reporting/anonymous-reporting.jsx";
import { HomePage } from "./pages/HomePage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div>
      <div style={{ padding: "8px 16px", backgroundColor: "#1e293b", color: "#fff", display: "flex", gap: "12px", alignItems: "center", fontSize: "12px" }}>
        <span>Dev Nav:</span>
        <button 
          onClick={() => setCurrentPage("home")} 
          style={{ padding: "4px 8px", backgroundColor: currentPage === "home" ? "#6366f1" : "#334155", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Halaman Home
        </button>
        <button 
          onClick={() => setCurrentPage("report")} 
          style={{ padding: "4px 8px", backgroundColor: currentPage === "report" ? "#6366f1" : "#334155", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Halaman Reporting
        </button>
      </div>

      {currentPage === "home" && (
        <HomePage onNavigate={(route) => {
          if (route === "/report") setCurrentPage("report");
        }} />
      )}
      
      {currentPage === "report" && <ReportForm />}
    </div>
  );
}

export default App;