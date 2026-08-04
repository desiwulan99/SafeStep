import { useState } from "react";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (item) => {
    if (item?.key === "report") {
      setCurrentPage("report");
    } else if (item?.key === "home") {
      setCurrentPage("home");
    }
  };

  if (currentPage === "report") {
    return <ReportPage userName="user" onNavigate={handleNavigate} />;
  }

  return <HomePage userName="user" onNavigate={handleNavigate} />;
}
