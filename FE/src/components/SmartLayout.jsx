import React from 'react';
import SmartNavbar from './SmartNavbar';
import Footer from './Footer';
import '../styles/SmartDashboard.css';

export default function SmartLayout({ children, showNavbar = true, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <SmartNavbar />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}




