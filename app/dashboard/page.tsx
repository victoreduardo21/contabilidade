'use client';

/**
 * ============================================================================
 * MÓDULO DE CONTABILIDADE - DASHBOARD DE CONSOLIDAÇÃO DE RPA
 * Localização no VS Code: app/dashboard/page.tsx
 * Rota no Navegador: http://localhost:3003/dashboard
 * Tecnologias: Next.js (App Router), React, TypeScript, XLSX
 * Descrição: Exibe a folha de consolidação de RPA calculada a partir
 *            das minutas de frete pagas no mês/ano selecionado.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  // Inicialização padrão dos seletores de Mês e Ano
  const [mesSelecionado, setMesSelecionado] = useState<string>('10');
  const [anoSelecionado, setAnoSelecionado] = useState<string>('2026');

  const [carregando, setCarregando] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [listaMotoristas, setListaMotoristas] = useState<MotoristaApurado[]>([]);
  const [motoristaModal, setMotoristaModal] = useState<MotoristaApurado | null>(null);

  // Competência no formato "MM/AAAA"
  const competencia = `${mesSelecionado}/${anoSelecionado}`;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Opções para o select de mês
  const opcoesMeses = [
    { valor: '01', rotulo: '01 - Janeiro' },
    { valor: '02', rotulo: '02 - Fevereiro' },
    { valor: '03', rotulo: '03 - Março' },
    { valor: '04', rotulo: '04 - Abril' },
    { valor: '05', rotulo: '05 - Maio' },
    { valor: '06', rotulo: '06 - Junho' },
    { valor: '07', rotulo: '07 - Julho' },
    { valor: '08', rotulo: '08 - Agosto' },
    { valor: '09', rotulo: '09 - Setembro' },
    { valor: '10', rotulo: '10 - Outubro' },
    { valor: '11', rotulo: '11 - Novembro' },
    { valor: '12', rotulo: '12 - Dezembro' },
  ];

  // Opções para o select de ano
  const opcoesAnos = ['2024', '2025', '2026', '2027', '2028'];

  // Atualiza para o mês/ano atual do navegador na montagem do componente
  useEffect(() => {
    const dataHoje = new Date();
    const mStr = String(dataHoje.getMonth() + 1).padStart(2, '0');
    const aStr = String(dataHoje.getFullYear());
    
    setMesSelecionado(mStr);
    setAnoSelecionado(aStr);
  }, []);

  /**
   * Consulta os lançamentos consolidados no backend
   */
  const carregarConsolidacaoReal = useCallback(async () => {
    setCarregando(true);
    setMensagemStatus('');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/contabilidade/rpa/mensal?competencia=${encodeURIComponent(competencia)}`;

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
  }, [apiUrl, competencia]);

  // Recarrega os dados quando a competência é alterada
  useEffect(() => {
    carregarConsolidacaoReal();
  }, [carregarConsolidacaoReal]);

  /**
   * Gera e descarrega a planilha em Excel (.xlsx)
   */
  const handleExportarExcel = () => {
    try {
      const dadosPlanilha = listaMotoristas.map((m) => ({
        'Competência': competencia,
        'Nome do Motorista': m.nome,
        'CPF': m.cpf,
        'Data Nascimento': m.dataNascimento,
        'Telefone / Contato': m.telefone,
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

      setMensagemStatus('🎉 Relatório Excel (.xlsx) baixado com sucesso!');
      setTimeout(() => setMensagemStatus(''), 4000);
    } catch (erro) {
      setMensagemStatus('❌ Erro ao gerar o ficheiro Excel.');
    }
  };

  const formatarMoeda = (valor: number) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={estilos.containerGeralBranco}>
      
      {/* CABEÇALHO */}
      <header style={estilos.headerClean}>
        <div>
          <span style={estilos.badgeModulo}>CONTABILIDADE & FINANCEIRO</span>
          <h1 style={estilos.tituloHeader}>Consolidação Mensal de RPA</h1>
        </div>

        {/* SELEÇÃO DE COMPETÊNCIA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>
            COMPETÊNCIA:
          </label>

          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            style={estilos.selectCompetencia}
          >
            {opcoesMeses.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.rotulo}
              </option>
            ))}
          </select>

          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            style={estilos.selectCompetencia}
          >
            {opcoesAnos.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>

          <button
            onClick={carregarConsolidacaoReal}
            disabled={carregando}
            style={estilos.botaoAtualizarCompetencia}
          >
            {carregando ? '⏳' : '🔍 Atualizar'}
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={estilos.mainContent}>
        
        {mensagemStatus && (
          <div style={estilos.caixaStatus}>
            {mensagemStatus}
          </div>
        )}

        <section style={estilos.cardBoxBranco}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🚚 Demonstrativo Analítico de Fretes e Impostos ({competencia})
            </h2>

            <button onClick={handleExportarExcel} style={estilos.botaoExcel}>
              📥 Baixar Relatório Excel (.xlsx)
            </button>
          </div>

          {/* TABELA DE RESULTADOS */}
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
                      ⏳ A carregar lançamentos de fretes do banco de dados para {competencia}...
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
                        {formatarMoeda(m.rendimentoBruto)}
                      </td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>{formatarMoeda(m.inssSest)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>{formatarMoeda(m.inssSenat)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>{formatarMoeda(m.valorInss)}</td>
                      <td style={{ ...estilos.td, color: '#991b1b' }}>{formatarMoeda(m.valorIrrf)}</td>
                      <td style={estilos.tdLiquidoHighlight}>
                        {formatarMoeda(m.valorLiquido)}
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

        {/* MODAL DO ESPELHO DE RPA */}
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
                  
                  {/* DETALHAMENTO INSS */}
                  <div style={estilos.boxSecaoGov}>
                    <h4 style={estilos.tituloSecaoGov}>RETENÇÕES DE INSS</h4>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Rendimento Bruto:</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.rendimentoBruto)} style={{ ...estilos.inpGov, fontWeight: '800' }} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Base INSS (20% Bruto):</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.baseInss)} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>INSS SEST (1.5%):</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.inssSest)} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>INSS SENAT (1.0%):</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.inssSenat)} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Valor INSS Autônomo (11%):</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.valorInss)} style={{ ...estilos.inpGov, color: '#991b1b' }} />
                    </div>
                  </div>

                  {/* DETALHAMENTO IRRF */}
                  <div style={estilos.boxSecaoGov}>
                    <h4 style={estilos.tituloSecaoGov}>IRRF & VALOR LÍQUIDO</h4>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Base IRRF (10% Bruto):</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.baseIrrf)} style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Nº Dependentes:</label>
                      <input type="text" disabled value="0" style={estilos.inpGov} />
                    </div>
                    <div style={estilos.linhaCampoGov}>
                      <label style={estilos.lblGov}>Valor IRRF Progressivo:</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.valorIrrf)} style={{ ...estilos.inpGov, color: '#991b1b' }} />
                    </div>
                    <div style={{ ...estilos.linhaCampoGov, marginTop: '1rem', backgroundColor: '#f0fdf4', padding: '0.5rem', borderRadius: '8px' }}>
                      <label style={{ ...estilos.lblGov, color: '#166534', fontWeight: '800' }}>VALOR LÍQUIDO FINAL:</label>
                      <input type="text" disabled value={formatarMoeda(motoristaModal.valorLiquido)} style={{ ...estilos.inpGov, color: '#166534', fontWeight: '800', fontSize: '1rem' }} />
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

const estilos: { [key: string]: React.CSSProperties } = {
  containerGeralBranco: { minHeight: '100dvh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' },
  headerClean: { backgroundColor: '#ffffff', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  badgeModulo: { backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '12px' },
  tituloHeader: { color: '#0f172a', margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '800' },
  selectCompetencia: { padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '800', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' },
  botaoAtualizarCompetencia: { padding: '0.5rem 0.85rem', borderRadius: '8px', border: 'none', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' },
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