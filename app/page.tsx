'use client';

/**
 * ============================================================================
 * MÓDULO DE CONTABILIDADE - TELA DE LOGIN
 * Localização no VS Code: app/page.tsx
 * Rota no Navegador: http://localhost:3003/
 * Tecnologias: Next.js (App Router), React, TypeScript
 * Descrição: Formulário de autenticação conectado à rota /cadastro no rodapé.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginContabilidadePage() {
  const router = useRouter();

  // Estados dos campos de login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Endereço do Servidor Express
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Processa o login do utilizador da contabilidade
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setMensagemStatus('⚠️ Por favor, informe o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    setMensagemStatus('⏳ A autenticar no módulo financeiro...');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/contabilidade/login`;

      const resposta = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.mensagem || 'E-mail ou senha incorretos.');
      }

      // Guarda a sessão no localStorage
      localStorage.setItem('token_contabilidade', resultado.token || 'autenticado');
      localStorage.setItem('usuario_contabilidade', JSON.stringify(resultado.usuario));

      setMensagemStatus('🎉 Acesso autorizado! A redirecionar...');

      // Redireciona para o Painel/Dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);

    } catch (erro: any) {
      console.error('❌ Erro no login de contabilidade:', erro);

      if (erro.message === 'Failed to fetch') {
        setMensagemStatus(`❌ Não foi possível conectar ao servidor (${apiUrl}). Verifique se o backend está ativo.`);
      } else {
        setMensagemStatus(`❌ ${erro.message}`);
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={estilos.containerGeral}>
      <div style={estilos.cardElevado}>
        
        {/* CABEÇALHO */}
        <div style={estilos.cabecalho}>
          <div style={estilos.badgePortal}>MÓDULO CONTÁBIL & FINANCEIRO</div>
          <h1 style={estilos.tituloModal}>Portal da Contabilidade</h1>
          <p style={estilos.subtituloModal}>
            Aceda com as suas credenciais para gerir relatórios e faturas
          </p>
        </div>

        {/* ALERTA DE STATUS */}
        {mensagemStatus && (
          <div style={{
            ...estilos.caixaStatus,
            backgroundColor: mensagemStatus.includes('❌') ? '#fef2f2' : mensagemStatus.includes('🎉') ? '#f0fdf4' : '#eff6ff',
            color: mensagemStatus.includes('❌') ? '#991b1b' : mensagemStatus.includes('🎉') ? '#166534' : '#1e40af',
            borderColor: mensagemStatus.includes('❌') ? '#fecaca' : mensagemStatus.includes('🎉') ? '#bbf7d0' : '#bfdbfe',
          }}>
            {mensagemStatus}
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleLogin} style={{ marginTop: '1.25rem' }}>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={estilos.label}>E-mail de Acesso *</label>
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder="contador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={estilos.label}>Palavra-Passe (Senha) *</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <button type="submit" disabled={carregando} style={estilos.botaoPrincipal}>
            {carregando ? '⏳ A autenticar...' : 'Entrar na Contabilidade →'}
          </button>

        </form>

        {/* RODAPÉ COM O LINK CORRETO: /cadastro */}
        <div style={estilos.rodapeCard}>
          <span style={{ color: '#64748b' }}>Ainda não tem acesso contábil? </span>
          <Link href="./../cadastro" style={estilos.linkCadastro}>
            Criar Conta Contábil
          </Link>
        </div>

      </div>
    </div>
  );
}

// Estilos Inline Responsivos
const estilos: { [key: string]: React.CSSProperties } = {
  containerGeral: {
    minHeight: '100dvh',
    width: '100vw',
    backgroundColor: '#0f172a',
    backgroundImage: 'radial-gradient(circle at 50% 0%, #0f766e 0%, #0f172a 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 0.75rem',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  cardElevado: {
    backgroundColor: '#ffffff',
    padding: '2rem 1.25rem',
    borderRadius: '20px',
    maxWidth: '420px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
  },
  cabecalho: { textAlign: 'center' },
  badgePortal: {
    display: 'inline-block',
    backgroundColor: '#f0fdf4',
    color: '#0d9488',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    marginBottom: '0.75rem',
  },
  tituloModal: { margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' },
  subtituloModal: { margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' },
  caixaStatus: { padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', marginTop: '1rem', textAlign: 'center', border: '1px solid' },
  label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' },
  inputSofisticado: {
    width: '100%',
    minHeight: '48px',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
  },
  botaoPrincipal: {
    width: '100%',
    minHeight: '52px',
    marginTop: '0.5rem',
    padding: '0.9rem',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)',
  },
  rodapeCard: {
    textAlign: 'center',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    fontSize: '0.875rem',
  },
  linkCadastro: {
    color: '#0d9488',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '0.35rem',
    padding: '0.25rem 0',
  },
};