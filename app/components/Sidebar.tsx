'use client';

/**
 * ============================================================================
 * COMPONENTE: BARRA DE NAVEGAÇÃO LATERAL (SIDEBAR CONTÁBIL)
 * Localização no VS Code: app/components/Sidebar.tsx
 * Tecnologias: Next.js (App Router), React, TypeScript
 * Descrição: Menu lateral responsivo para o módulo de contabilidade com suporte
 *            à nova tela de consulta de caminhoneiros.
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SidebarContabilidade() {
  const pathname = usePathname();
  const router = useRouter();

  // Estado para controlar a abertura do menu em dispositivos móveis (telemóveis)
  const [menuAbertoMobile, setMenuAbertoMobile] = useState(false);

  /**
   * Finaliza a sessão do contador e redireciona para a tela de login
   */
  const handleSair = () => {
    localStorage.removeItem('token_contabilidade');
    localStorage.removeItem('usuario_contabilidade');
    router.push('/');
  };

  // Se estivermos na tela de Login (/) ou Cadastro (/cadastro), não exibe a Sidebar
  if (pathname === '/' || pathname === '/cadastro') {
    return null;
  }

  return (
    <>
      {/* BOTÃO MÓVEL (Visível apenas quando necessário) */}
      <button
        onClick={() => setMenuAbertoMobile(!menuAbertoMobile)}
        style={estilos.botaoToggleMobile}
      >
        {menuAbertoMobile ? '✖ Fechar Menu' : '☰ Menu Contábil'}
      </button>

      {/* PAINEL LATERAL / SIDEBAR */}
      <aside
        style={{
          ...estilos.sidebarContainer,
          transform: menuAbertoMobile ? 'translateX(0)' : undefined,
        }}
      >
        {/* CABEÇALHO DA SIDEBAR */}
        <div style={estilos.cabecalhoSidebar}>
          <div style={estilos.badgeModulo}>MÓDULO CONTÁBIL</div>
          <h2 style={estilos.tituloEmpresa}>Contabilidade</h2>
          <p style={estilos.subtituloEmpresa}>Gestão de RPAs & Fretes</p>
        </div>

        {/* NAVEGAÇÃO DE LINKS */}
        <nav style={estilos.navContainer}>
          
          {/* LINK: DASHBOARD / FECHAMENTO DE RPA */}
          <Link
            href="/dashboard"
            onClick={() => setMenuAbertoMobile(false)}
            style={{
              ...estilos.linkItem,
              ...(pathname === '/dashboard' ? estilos.linkAtivo : {}),
            }}
          >
            📊 Fechamento de RPA
          </Link>

          {/* LINK: NOVO ITEM - CAMINHONEIROS */}
          <Link
            href="/caminhoneiros"
            onClick={() => setMenuAbertoMobile(false)}
            style={{
              ...estilos.linkItem,
              ...(pathname === '/caminhoneiros' ? estilos.linkAtivo : {}),
            }}
          >
            🚚 Caminhoneiros
          </Link>

          {/* LINK: TABELAS GOVERNAMENTAIS */}
          <Link
            href="/tabelas"
            onClick={() => setMenuAbertoMobile(false)}
            style={{
              ...estilos.linkItem,
              ...(pathname === '/tabelas' ? estilos.linkAtivo : {}),
            }}
          >
            📋 Tabelas IRRF / Governamentais
          </Link>

        </nav>

        {/* RODAPÉ DA SIDEBAR COM O BOTÃO DE LOGOFF */}
        <div style={estilos.rodapeSidebar}>
          <button onClick={handleSair} style={estilos.botaoSair}>
            🚪 Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
}

// Estilos Responsivos Inline
const estilos: { [key: string]: React.CSSProperties } = {
  sidebarContainer: {
    width: '260px',
    height: '100dvh',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem 1rem',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 900,
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease-in-out',
  },
  cabecalhoSidebar: {
    paddingBottom: '1.25rem',
    borderBottom: '1px solid #1e293b',
  },
  badgeModulo: {
    display: 'inline-block',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.25rem 0.6rem',
    borderRadius: '12px',
    marginBottom: '0.5rem',
  },
  tituloEmpresa: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtituloEmpresa: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1.5rem',
    flex: 1,
  },
  linkItem: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
  },
  linkAtivo: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
  },
  rodapeSidebar: {
    paddingTop: '1rem',
    borderTop: '1px solid #1e293b',
  },
  botaoSair: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ef4444',
    fontWeight: '800',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  botaoToggleMobile: {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    zIndex: 1000,
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '30px',
    fontWeight: '800',
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    cursor: 'pointer',
    display: 'none', // Oculto por padrão no computador para manter a tela limpa
  },
};