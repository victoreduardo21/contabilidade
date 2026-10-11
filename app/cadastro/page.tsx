'use client';

/**
 * ============================================================================
 * MÓDULO DE CONTABILIDADE - TELA DE CAMINHONEIROS (SEM COLUNA PIX)
 * Localização no VS Code: app/caminhoneiros/page.tsx
 * Rota no Navegador: http://localhost:3003/caminhoneiros
 * Tecnologias: Next.js (App Router), React, TypeScript
 * Descrição: Exibe a lista completa de motoristas cadastrados sem exibição de PIX.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

interface Caminhoneiro {
  _id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  cidade?: string;
  uf?: string;
}

export default function CaminhoneirosContabilidadePage() {
  const [caminhoneiros, setCaminhoneiros] = useState<Caminhoneiro[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mensagemStatus, setMensagemStatus] = useState('');

  // Endereço da API backend Express
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Consulta os caminhoneiros reais gravados no MongoDB Atlas
   */
  const buscarCaminhoneiros = async () => {
    setCarregando(true);
    setMensagemStatus('');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/contabilidade/caminhoneiros`;

      const resposta = await fetch(endpoint);
      const textoResposta = await resposta.text();

      if (textoResposta.trim().startsWith('<')) {
        throw new Error(`A rota no backend (${endpoint}) devolveu uma página HTML.`);
      }

      const resultado = JSON.parse(textoResposta);

      if (resposta.ok && resultado.sucesso) {
        setCaminhoneiros(resultado.caminhoneiros || []);
      } else {
        throw new Error(resultado.mensagem || 'Erro ao carregar os caminhoneiros.');
      }
    } catch (erro: any) {
      console.error('❌ Erro na consulta de caminhoneiros:', erro);
      setMensagemStatus(`❌ ${erro.message || 'Erro de conexão com o servidor.'}`);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarCaminhoneiros();
  }, []);

  // Filtro de busca local por Nome ou CPF
  const caminhoneirosFiltrados = caminhoneiros.filter((c) => {
    const nomeMotorista = (c.nome || '').toLowerCase();
    const cpfMotorista = (c.cpf || '').toLowerCase();
    const busca = termoBusca.toLowerCase().trim();

    return nomeMotorista.includes(busca) || cpfMotorista.includes(busca);
  });

  return (
    <div style={estilos.containerGeral}>
      
      {/* CABEÇALHO CLEAN */}
      <header style={estilos.headerClean}>
        <div>
          <span style={estilos.badgeModulo}>CONTABILIDADE & CADASTROS</span>
          <h1 style={estilos.tituloHeader}>Base de Caminhoneiros</h1>
        </div>

        <button onClick={buscarCaminhoneiros} style={estilos.btnAtualizar}>
          🔄 Atualizar Dados
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={estilos.mainContent}>
        
        {mensagemStatus && (
          <div style={estilos.caixaAlerta}>
            {mensagemStatus}
          </div>
        )}

        <section style={estilos.cardBoxBranco}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🚚 Motoristas Cadastrados no Banco de Dados ({caminhoneirosFiltrados.length})
            </h2>

            <input
              type="text"
              placeholder="🔍 Buscar por nome ou CPF..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={estilos.inputPesquisa}
            />
          </div>

          {/* TABELA DE CAMINHONEIROS (SEM A COLUNA DO PIX) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={estilos.tabelaCustom}>
              <thead>
                <tr>
                  <th style={estilos.th}>Nome Completo</th>
                  <th style={estilos.th}>CPF</th>
                  <th style={estilos.th}>Data Nascimento</th>
                  <th style={estilos.th}>Telefone / Contacto</th>
                  <th style={estilos.th}>Cidade / UF</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', fontWeight: 'bold', color: '#64748b' }}>
                      ⏳ A carregar motoristas do MongoDB Atlas...
                    </td>
                  </tr>
                ) : caminhoneirosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Nenhum caminhoneiro encontrado na base de dados.
                    </td>
                  </tr>
                ) : (
                  caminhoneirosFiltrados.map((item, idx) => (
                    <tr key={item._id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={estilos.tdBold}>{item.nome}</td>
                      <td style={estilos.td}>{item.cpf}</td>
                      <td style={estilos.td}>{item.dataNascimento}</td>
                      <td style={estilos.td}>{item.telefone}</td>
                      <td style={estilos.td}>
                        {item.cidade ? `${item.cidade} / ${item.uf || ''}` : 'N/D'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </section>

      </main>
    </div>
  );
}

// Estilos Responsivos
const estilos: { [key: string]: React.CSSProperties } = {
  containerGeral: { minHeight: '100dvh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' },
  headerClean: { backgroundColor: '#ffffff', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  badgeModulo: { backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '12px' },
  tituloHeader: { color: '#0f172a', margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800' },
  btnAtualizar: { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' },
  mainContent: { padding: '1.5rem 1rem', maxWidth: '1300px', margin: '0 auto' },
  cardBoxBranco: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
  inputPesquisa: { padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', width: '280px', outline: 'none' },
  tabelaCustom: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' },
  th: { padding: '0.75rem 0.5rem', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '0.85rem 0.5rem', color: '#334155' },
  tdBold: { padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: '700' },
  caixaAlerta: { padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', marginBottom: '1rem', fontWeight: '700', textAlign: 'center' },
};