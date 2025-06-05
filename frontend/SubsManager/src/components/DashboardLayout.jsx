import { useState } from "react";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 ml-64 min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-6">{children}</main>
    
      </div>
    </div>
  );
}