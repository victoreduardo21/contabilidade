'use client';

/**
 * ============================================================================
 * MÓDULO DE CONTABILIDADE - DASHBOARD DE CONSOLIDAÇÃO COM DADOS REAIS
 * Localização no VS Code: app/dashboard/page.tsx
 * Rota no Navegador: http://localhost:3003/dashboard
 * Tecnologias: Next.js (App Router), React, TypeScript, XLSX
 * Descrição: Consulta os fretes e minutas do banco de dados em tempo real
 *            e exibe a folha de consolidação do RPA da competência.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface MotoristaApurado {
  id?: string;
  cpf: string;
  nome: string;
  dataNascimento: string;
  telefone: string;
  quantidadeMinutas: number;
  rendimentoBruto: number;
  baseInss: number;
  inssSest: number;
  inssSenat: number;
  valorInss: number;
  baseIrrf: number;
  valorIrrf: number;
  valorLiquido: number;
}

export default function DashboardContabilidadePage() {
  const [competencia, setCompetencia] = useState('00/0000');
  const [carregando, setCarregando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [listaMotoristas, setListaMotoristas] = useState<MotoristaApurado[]>([]);
  const [motoristaModal, setMotoristaModal] = useState<MotoristaApurado | null>(null);

  // Endereço da API backend Express
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Puxa do backend os dados consolidados das minutas/fretes do mês selecionado
   */
  const carregarConsolidacaoReal = async () => {
    setCarregando(true);
    setMensagemStatus('');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/contabilidade/rpa/mensal?competencia=${competencia}`;

      const resposta = await fetch(endpoint);
      const textoResposta = await resposta.text();

      if (textoResposta.trim().startsWith('<')) {
        throw new Error(`A rota no backend (${endpoint}) devolveu uma página HTML.`);
      }

      const resultado = JSON.parse(textoResposta);

      if (resposta.ok && resultado.sucesso) {
        setListaMotoristas(resultado.motoristas || []);
      } else {
        throw new Error(resultado.mensagem || 'Erro ao carregar a consolidação mensal.');
      }
    } catch (erro: any) {
      console.error('❌ Erro na consolidação mensal:', erro);
      setMensagemStatus(`⚠️ ${erro.message || 'Não foi possível conectar ao servidor.'}`);
    } finally {
      setCarregando(false);
    }
  };

  // Carrega os dados reais do banco de dados sempre que a competência for alterada
  useEffect(() => {
    carregarConsolidacaoReal();
  }, [competencia]);

  /**
   * Baixa a planilha Excel (.xlsx) com todos os lançamentos reais da competência
   */
  const handleExportarExcel = () => {
    try {
      const dadosPlanilha = listaMotoristas.map((m) => ({
        'Competência': competencia,
        'Nome do Motorista': m.nome,
        'CPF': m.cpf,
        'Data Nascimento': m.dataNascimento,
        'Telefone / Contacto': m.telefone,
        'Nº Viagens': m.quantidadeMinutas,
        'Rendimento Bruto (R$)': m.rendimentoBruto,
        'Base INSS 20% (R$)': m.baseInss,
        'INSS SEST 1.5% (R$)': m.inssSest,
        'INSS SENAT 1% (R$)': m.inssSenat,
        'INSS Autônomo 11% (R$)': m.valorInss,
        'Base IRRF 10% (R$)': m.baseIrrf,
        'IRRF Progressivo (R$)': m.valorIrrf,
        'VALOR LÍQUIDO DO RPA (R$)': m.valorLiquido,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosPlanilha);

      XLSX.utils.book_append_sheet(wb, ws, `RPA_${competencia.replace('/', '_')}`);
      XLSX.writeFile(wb, `Relatorio_Contabilidade_RPA_${competencia.replace('/', '_')}.xlsx`);

      setMensagemStatus('🎉 Relatório Excel (.xlsx) transferido com sucesso!');
      setTimeout(() => setMensagemStatus(''), 4000);
    } catch (erro) {
      setMensagemStatus('❌ Erro ao gerar o ficheiro Excel.');
    }
  };

  return (
    <div style={estilos.containerGeralBranco}>
      
      {/* CABEÇALHO CLEAN */}
      <header style={estilos.headerClean}>
        <div>
          <span style={estilos.badgeModulo}>CONTABILIDADE & FINANCEIRO</span>
          <h1 style={estilos.tituloHeader}>Consolidação Mensal de RPA</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>COMPETÊNCIA:</label>
          <input
            type="text"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            style={estilos.inputCompetenciaClean}
          />
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main style={estilos.mainContent}>
        
        {mensagemStatus && (
          <div style={estilos.caixaStatus}>
            {mensagemStatus}
          </div>
        )}

        {/* CARTÃO BRANCO DE DEMONSTRATIVO */}
        <section style={estilos.cardBoxBranco}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🚚 Demonstrativo Analítico de Fretes e Impostos ({competencia})
            </h2>

            <button onClick={handleExportarExcel} style={estilos.botaoExcel}>
              📥 Baixar Relatório Excel (.xlsx)
            </button>
          </div>

          {/* TABELA COMPLETA INTEGRADA AO BANCO */}
          <div style={{ overflowX: 'auto' }}>
            <table style={estilos.tabelaCustom}>
              <thead>
                <tr>
                  <th style={estilos.th}>Motorista</th>
                  <th style={estilos.th}>CPF</th>
                  <th style={estilos.th}>Data Nasc.</th>
                  <th style={estilos.th}>Telefone</th>
                  <th style={estilos.th}>Rendimento Bruto</th>
                  <th style={estilos.th}>SEST (1.5%)</th>
                  <th style={estilos.th}>SENAT (1%)</th>
                  <th style={estilos.th}>INSS (11%)</th>
                  <th style={estilos.th}>IRRF</th>
                  <th style={estilos.thHighlight}>Valor Líquido RPA</th>
                  <th style={estilos.th}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', fontWeight: 'bold', color: '#64748b' }}>
                      ⏳ A carregar lançamentos de fretes do banco de dados...
                    </td>
                  </tr>
                ) : listaMotoristas.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      Nenhum frete ou minuta encontrada para a competência {competencia}.
                    </td>
                  </tr>
                ) : (
                  listaMotoristas.map((m, index) => (
                    <tr key={m.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={estilos.tdBold}>{m.nome}</td>
                      <td style={estilos.td}>{m.cpf}</td>
                      <td style={estilos.td}>{m.dataNascimento}</td>
                      <td style={estilos.td}>{m.telefone}</td>
                      <td style={{ ...estilos.td, color: '#0f172a', fontWeight: '800' }}>
                        R$ {m.rendimentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>R$ {m.inssSest.toFixed(2)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>R$ {m.inssSenat.toFixed(2)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>R$ {m.valorInss.toFixed(2)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>R$ {m.valorIrrf.toFixed(2)}</td>
                      <td style={estilos.tdLiquidoHighlight}>
                        R$ {m.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={estilos.td}>
                        <button onClick={() => setMotoristaModal(m)} style={estilos.botaoAcaoTable}>
                          ⚙️ Form. Governo
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL DO FORMULÁRIO DO GOVERNO */}
        {motoristaModal && (
          <div style={estilos.overlayModal}>
            <div style={estilos.conteudoModalGoverno}>
              
              <div style={estilos.headerGoverno}>
                <span style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>📋 Espelho do Recibo RPA</span>
                <button onClick={() => setMotoristaModal(null)} style={estilos.btnFecharGov}>✖</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={estilos.gridGov2}>
                  <div>
                    <label style={estilos.lblGov}>Competência:</label>
                    <input type="text" disabled value={competencia} style={estilos.inpGov} />
                  </div>
                  <div>
                    <label style={estilos.lblGov}>Descrição Serviço:</label>
                    <input type="text" disabled value="FRETE DE CARGAS" style={estilos.inpGov} />
                  </div>
                </div>

                <div>
                  <label style={estilos.lblGov}>Contribuinte:</label>
                  <input type="text" disabled value={`${motoristaModal.nome} - CPF: ${motoristaModal.cpf}`} style={estilos.inpGov} />
                </div>

                <div style={estilos.gridGov2}>
                  
                  {/* RETENÇÕES DE INSS */}
                  <div style={estilos.boxSecaoGov}>
                    <h4 style={estilos.tituloSecaoGov}>RETENÇÕES DE INSS</h4>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Rendimento Bruto:</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.rendimentoBruto.toFixed(2)}`} style={{ ...estilos.inpGov, fontWeight: '800' }} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Base INSS (20% Bruto):</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.baseInss.toFixed(2)}`} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>INSS SEST (1.5%):</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.inssSest.toFixed(2)}`} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>INSS SENAT (1.0%):</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.inssSenat.toFixed(2)}`} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Valor INSS Autônomo (11%):</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.valorInss.toFixed(2)}`} style={{ ...estilos.inpGov, color: '#991b1b' }} />
                    </div>
                  </div>

                  {/* IRRF & LÍQUIDO */}
                  <div style={estilos.boxSecaoGov}>
                    <h4 style={estilos.tituloSecaoGov}>IRRF & VALOR LÍQUIDO</h4>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Base IRRF (10% Bruto):</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.baseIrrf.toFixed(2)}`} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Nº Dependentes:</label>
                      <input type="text" disabled value="0" style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Valor IRRF Progressivo:</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.valorIrrf.toFixed(2)}`} style={{ ...estilos.inpGov, color: '#991b1b' }} />
                    </div>
                    <div style={{ ...estilos.linhaCampoGov, marginTop: '1rem', backgroundColor: '#f0fdf4', padding: '0.5rem', borderRadius: '8px' }}>
                      <label style={{ ...estilos.lblGov, color: '#166534', fontWeight: '800' }}>VALOR LÍQUIDO FINAL:</label>
                      <input type="text" disabled value={`R$ ${motoristaModal.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} style={{ ...estilos.inpGov, color: '#166534', fontWeight: '800', fontSize: '1rem' }} />
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setMotoristaModal(null)} style={estilos.btnCancelarGov}>
                    Fechar
                  </button>
                  <button onClick={() => { alert('RPA confirmado com sucesso!'); setMotoristaModal(null); }} style={estilos.btnGravarGov}>
                    💾 Confirmar RPA
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Estilos Responsivos
const estilos: { [key: string]: React.CSSProperties } = {
  containerGeralBranco: { minHeight: '100dvh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' },
  headerClean: { backgroundColor: '#ffffff', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  badgeModulo: { backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '12px' },
  tituloHeader: { color: '#0f172a', margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800' },
  inputCompetenciaClean: { padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', width: '90px', textAlign: 'center' },
  mainContent: { padding: '1.5rem 1rem', maxWidth: '1300px', margin: '0 auto' },
  cardBoxBranco: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
  tabelaCustom: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' },
  th: { padding: '0.75rem 0.5rem', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', borderBottom: '2px solid #e2e8f0' },
  thHighlight: { padding: '0.75rem 0.5rem', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.7rem', borderBottom: '2px solid #bbf7d0' },
  td: { padding: '0.85rem 0.5rem', color: '#334155' },
  tdBold: { padding: '0.85rem 0.5rem', color: '#0f172a', fontWeight: '700' },
  tdLiquidoHighlight: { padding: '0.85rem 0.5rem', color: '#166534', fontWeight: '800', backgroundColor: '#f0fdf4' },
  botaoAcaoTable: { backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' },
  botaoExcel: { backgroundColor: '#166534', color: '#ffffff', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(22, 101, 52, 0.2)' },
  overlayModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' },
  conteudoModalGoverno: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', width: '100%', maxWidth: '680px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1' },
  headerGoverno: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' },
  btnFecharGov: { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
  gridGov2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' },
  boxSecaoGov: { backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' },
  tituloSecaoGov: { margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase' },
  linhaCampoGov: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  lblGov: { fontSize: '0.75rem', fontWeight: '700', color: '#334155' },
  inpGov: { padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '700', fontSize: '0.85rem', width: '160px', textAlign: 'right' },
  btnCancelarGov: { flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', cursor: 'pointer' },
  btnGravarGov: { flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: '800', cursor: 'pointer' },
  caixaStatus: { padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', marginBottom: '1rem', textAlign: 'center', fontWeight: '700', fontSize: '0.875rem' },
};