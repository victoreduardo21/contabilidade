import React from 'react';
import SidebarContabilidade from './components/Sidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex' }}>
          {/* BARRA LATERAL */}
          <SidebarContabilidade />

          {/* ÁREA DE CONTEÚDO PRINCIPAL (COM MARGEM À ESQUERDA PARA A SIDEBAR) */}
          <div style={{ flex: 1, marginLeft: '260px', minHeight: '100dvh' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}