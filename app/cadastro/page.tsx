'use client';

/**
 * ============================================================================
 * MÓDULO DE CONTABILIDADE - TELA DE CADASTRO DE USUÁRIO CONTÁBIL
 * Localização no VS Code: app/cadastro/page.tsx
 * Rota no Navegador: http://localhost:3003/cadastro
 * Tecnologias: Next.js (App Router), React, TypeScript
 * Descrição: Formulário para criação de novas contas de acesso ao módulo contábil.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CadastroContabilidadePage() {
  const router = useRouter();

  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Endereço da API backend Express
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Processa o registro do novo usuário no backend
   */
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha) {
      setMensagemStatus('⚠️ Preencha todos os campos obrigatórios (*).');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemStatus('⚠️ As senhas digitadas não coincidem!');
      return;
    }

    setCarregando(true);
    setMensagemStatus('⏳ A criar seu acesso contábil...');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/contabilidade/registro`;

      const resposta = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          cpfCnpj: cpfCnpj.trim(),
          senha,
        }),
      });

      const textoResposta = await resposta.text();

      if (textoResposta.trim().startsWith('<')) {
        throw new Error('A rota no servidor backend devolveu uma página HTML.');
      }

      const resultado = JSON.parse(textoResposta);

      if (!resposta.ok || !resultado.sucesso) {
        throw new Error(resultado.mensagem || 'Erro ao realizar o cadastro.');
      }

      setMensagemStatus('🎉 Cadastro realizado com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (erro: any) {
      console.error('❌ Erro no cadastro:', erro);
      setMensagemStatus(`❌ ${erro.message || 'Erro ao conectar ao servidor.'}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={estilos.containerGeral}>
      
      {/* RESET DE MARGENS GLOBAIS */}
      <style jsx global>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          background-color: #0f172a !important;
        }
      `}</style>

      <div style={estilos.cardElevado}>
        
        {/* CABEÇALHO */}
        <div style={estilos.cabecalho}>
          <div style={estilos.badgePortal}>MÓDULO CONTÁBIL & FINANCEIRO</div>
          <h1 style={estilos.tituloModal}>Criar Conta Contábil</h1>
          <p style={estilos.subtituloModal}>
            Preencha os dados abaixo para cadastrar seu usuário no sistema
          </p>
        </div>

        {/* ALERTA DE STATUS */}
        {mensagemStatus && (
          <div style={{
            ...estilos.caixaStatus,
            backgroundColor: mensagemStatus.includes('❌') || mensagemStatus.includes('⚠️') ? '#fef2f2' : mensagemStatus.includes('🎉') ? '#f0fdf4' : '#eff6ff',
            color: mensagemStatus.includes('❌') || mensagemStatus.includes('⚠️') ? '#991b1b' : mensagemStatus.includes('🎉') ? '#166534' : '#1e40af',
            borderColor: mensagemStatus.includes('❌') || mensagemStatus.includes('⚠️') ? '#fecaca' : mensagemStatus.includes('🎉') ? '#bbf7d0' : '#bfdbfe',
          }}>
            {mensagemStatus}
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleCadastro} style={{ marginTop: '1.25rem' }}>
          
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={estilos.label}>Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Eduardo Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={estilos.label}>E-mail de Acesso *</label>
            <input
              type="email"
              required
              inputMode="email"
              placeholder="contador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={estilos.label}>CPF ou CNPJ (Opcional)</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={estilos.label}>Senha *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={estilos.label}>Confirmar Senha *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={estilos.inputSofisticado}
            />
          </div>

          <button type="submit" disabled={carregando} style={estilos.botaoPrincipal}>
            {carregando ? '⏳ A Cadastrar...' : 'Concluir Cadastro →'}
          </button>

        </form>

        {/* RODAPÉ LINK PARA VOLTAR AO LOGIN */}
        <div style={estilos.rodapeCard}>
          <span style={{ color: '#64748b' }}>Já possui uma conta? </span>
          <Link href="/" style={estilos.linkLogin}>
            Fazer Login
          </Link>
        </div>

      </div>
    </div>
  );
}

// Estilos Responsivos
const estilos: { [key: string]: React.CSSProperties } = {
  containerGeral: {
    minHeight: '100dvh',
    width: '100%',
    backgroundColor: '#0f172a',
    backgroundImage: 'radial-gradient(circle at 50% 0%, #0f766e 0%, #0f172a 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 1rem',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    overflowY: 'auto',
  },
  cardElevado: {
    backgroundColor: '#ffffff',
    padding: '2rem 1.5rem',
    borderRadius: '20px',
    maxWidth: '440px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    margin: 'auto',
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
    minHeight: '44px',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '0.95rem',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
  },
  botaoPrincipal: {
    width: '100%',
    minHeight: '50px',
    marginTop: '0.5rem',
    padding: '0.85rem',
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
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    fontSize: '0.875rem',
  },
  linkLogin: {
    color: '#0d9488',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '0.35rem',
  },
};