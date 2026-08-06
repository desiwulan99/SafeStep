import { useState } from "react";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import SafeRoutePage from "./pages/SafeRoutePage";
import LiveGuardianPage from "./pages/LiveGuardianPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (item) => {
    const key = item?.key || item;
    if (key === "report") {
      setCurrentPage("report");
    } else if (key === "safe-route") {
      setCurrentPage("safe-route");
    } else if (key === "live-guardian") {
      setCurrentPage("live-guardian");
    } else {
      setCurrentPage("home");
    }
  };

  if (currentPage === "report") {
    return <ReportPage userName="user" onNavigate={handleNavigate} />;
  }

  if (currentPage === "safe-route") {
    return <SafeRoutePage userName="user" onNavigate={handleNavigate} />;
  }

  if (currentPage === "live-guardian") {
    return <LiveGuardianPage userName="user" onNavigate={handleNavigate} />;
  }

  return <HomePage userName="user" onNavigate={handleNavigate} />;
}
