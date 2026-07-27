import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { ReportForm } from "../features/anonymous-reporting/components/ReportForm";

export const ReportingPage = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "1rem" }}>
        <ReportForm />
      </div>
    </div>
  );
};
