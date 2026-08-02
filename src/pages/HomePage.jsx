import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSosAlert, setShowSosAlert] = useState(false);

  const handleSelectMenu = (name, path) => {
    setActiveTab(name);
    if (onNavigate) onNavigate(path);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        showSosAlert={showSosAlert} 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          activeTab={activeTab} 
          onSelectMenu={handleSelectMenu} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <main style={{ flex: 1, padding: '24px' }}>
          {/* Konten Beranda kamu ada di sini */}
          <h1>Halaman Beranda</h1>
        </main>
      </div>
    </div>
  );
};