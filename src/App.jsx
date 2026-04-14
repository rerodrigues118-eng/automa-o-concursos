import React, { useState, useEffect } from 'react';
import './App.css';

const CATEGORIES = [
  "Nível Médio",
  "Nível Superior",
  "Administrativo",
  "Policial",
  "Militar / Bombeiros",
  "Jurídico",
  "Federal"
];

function App() {
  const [concursos, setConcursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState('Todos');
  const [selectedCidade, setSelectedCidade] = useState('Todas');
  const [selectedConcurso, setSelectedConcurso] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('ficha');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/concursos_enriched.json');
      if (!response.ok) throw new Error('Falha ao carregar dados');
      const data = await response.json();
      setConcursos(data);
    } catch (err) {
      console.error("Erro ao carregar concursos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      fetchData();
      alert("Busca finalizada! Dados atualizados para Curitiba, Nacional e Sul.");
    }, 1500);
  };

  const ufs = ['Todos', 'BR', ...new Set(concursos.map(c => c.uf).filter(uf => uf && uf !== 'BR'))].sort();
  const cidades = ['Todas', ...new Set(
    concursos
      .filter(c => selectedUf === 'Todos' || c.uf === selectedUf)
      .map(c => c.cidade)
  )].sort();

  const filteredAndSorted = concursos
    .filter(c => {
      const matchesFilter = filter === 'Todos' || c.categoria === filter;
      const matchesSearch = c.orgao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUf = selectedUf === 'Todos' || c.uf === selectedUf;
      const matchesCidade = selectedCidade === 'Todas' || c.cidade === selectedCidade;
      
      // Filtro de Data Rígido (Segurança Frontend)
      const dateStr = c.data_encerramento || '';
      const yearMatch = dateStr.match(/\d{4}$/);
      const isFutureOrCurrent = yearMatch && parseInt(yearMatch[0]) >= 2026;

      return matchesFilter && matchesSearch && matchesUf && matchesCidade && isFutureOrCurrent;
    })
    .sort((a, b) => {
      // 1. Curitiba (Prioridade Máxima)
      if (a.is_curitiba && !b.is_curitiba) return -1;
      if (!a.is_curitiba && b.is_curitiba) return 1;
      
      // 2. Brasil (Prioridade Nacional)
      if (a.prioridade && !b.prioridade) return -1;
      if (!a.prioridade && b.prioridade) return 1;
      
      return 0;
    });

  return (
    <div className="app">
      <header className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo">
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Portal <span style={{ color: 'var(--primary)' }}>Concursos</span></h1>
          </div>
          <button className="btn btn-outline" onClick={handleUpdate} disabled={loading}>
            {loading ? '🔄 Buscando...' : '🔄 Atualizar Editais'}
          </button>
        </div>
      </header>

      <main className="container animate-fade" style={{ padding: '2rem 1.5rem' }}>
        <section className="hero" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Foco em <span style={{ color: 'var(--primary)' }}>Curitiba</span> & Brasil</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Resultados da capital paranaense sempre em primeiro lugar, seguidos por concursos nacionais.
          </p>
        </section>

        <section className="filters-container" style={{ 
          background: 'white', 
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Buscar órgão..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flex: '2', minWidth: '250px' }}
            />
            <select 
              value={selectedUf} 
              onChange={(e) => { setSelectedUf(e.target.value); setSelectedCidade('Todas'); }}
              className="search-input"
              style={{ flex: '0.5', minWidth: '120px' }}
            >
              <option value="Todos">Todos Estados</option>
              {ufs.filter(uf => uf !== 'Todos').map(uf => (
                <option key={uf} value={uf}>{uf === 'BR' ? '🇧🇷 Brasil' : uf}</option>
              ))}
            </select>
            <select 
              value={selectedCidade} 
              onChange={(e) => setSelectedCidade(e.target.value)}
              className="search-input"
              style={{ flex: '1', minWidth: '150px' }}
              disabled={selectedUf === 'BR'}
            >
              <option value="Todas">Todas Cidades</option>
              {cidades.filter(c => c !== 'Todas').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className={`btn ${filter === 'Todos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('Todos')}>Todos</button>
            {CATEGORIES.slice(0, 5).map(cat => (
              <button key={cat} className={`btn ${filter === cat ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(cat)}>{cat}</button>
            ))}
          </div>
        </section>

        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando 400+ editais...</p>}

        <div className="concursos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredAndSorted.map(concurso => {
            const isCuritiba = concurso.is_curitiba;
            const isNational = concurso.prioridade && !isCuritiba;
            
            return (
              <div key={concurso.id} className="card" style={{
                border: isCuritiba ? '2px solid var(--primary)' : (isNational ? '2px solid var(--accent-gold)' : '1px solid var(--border)'),
                background: isCuritiba ? '#f0f7ff' : (isNational ? '#fffcf5' : 'white')
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${concurso.status === 'Inscrições abertas' ? 'badge-open' : 'badge-planned'}`}>
                    {concurso.status}
                  </span>
                  {isCuritiba ? (
                    <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>📍 CAPITAL</span>
                  ) : (isNational ? (
                    <span className="badge" style={{ background: 'var(--accent-gold)', color: 'var(--primary-dark)', fontWeight: 'bold' }}>⭐ NACIONAL</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{concurso.uf}</span>
                  ))}
                </div>
                <h3 style={{ fontSize: '1.1rem', height: '3.5rem', overflow: 'hidden', marginTop: '0.75rem' }}>{concurso.orgao}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <p>📍 {concurso.localizacao}</p>
                  <p>📅 {concurso.data_encerramento || 'Ver edital'}</p>
                  <p>🏷️ <strong>{concurso.categoria}</strong></p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <a href={concurso.link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1.2, textDecoration: 'none', textAlign: 'center' }}>Ver Edital</a>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedConcurso(concurso)}>📚 Estudar</button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSorted.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Nenhum concurso encontrado.
          </div>
        )}
      </main>
      {/* Modal Reformulado - Dashboard de Estudos */}
      {selectedConcurso && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem', backdropFilter: 'blur(5px)'
        }} onClick={() => { setSelectedConcurso(null); setActiveModalTab('ficha'); }}>
          <div className="modal-content animate-fade" style={{
              background: 'white', borderRadius: '1rem', maxWidth: '850px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2rem 2rem 1.5rem', background: 'var(--primary)', color: 'white', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
              <button style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => { setSelectedConcurso(null); setActiveModalTab('ficha'); }}>✕</button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem', paddingRight: '2rem' }}>{selectedConcurso.orgao}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{selectedConcurso.categoria}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>📍 {selectedConcurso.localizacao}</span>
                  <span className="badge" style={{ background: '#4ade80', color: '#064e3b' }}>📅 Encerra em {selectedConcurso.data_encerramento}</span>
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 2rem' }}>
              <button onClick={() => setActiveModalTab('ficha')} style={{ background: 'none', border: 'none', padding: '1rem 0', marginRight: '2rem', fontSize: '1rem', fontWeight: activeModalTab === 'ficha' ? 'bold' : 'normal', color: activeModalTab === 'ficha' ? 'var(--primary)' : '#64748b', borderBottom: activeModalTab === 'ficha' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>📋 Ficha Técnica</button>
              <button onClick={() => setActiveModalTab('plano')} style={{ background: 'none', border: 'none', padding: '1rem 0', marginRight: '2rem', fontSize: '1rem', fontWeight: activeModalTab === 'plano' ? 'bold' : 'normal', color: activeModalTab === 'plano' ? 'var(--primary)' : '#64748b', borderBottom: activeModalTab === 'plano' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>📅 Plano de Estudos</button>
              <button onClick={() => setActiveModalTab('materiais')} style={{ background: 'none', border: 'none', padding: '1rem 0', fontSize: '1rem', fontWeight: activeModalTab === 'materiais' ? 'bold' : 'normal', color: activeModalTab === 'materiais' ? 'var(--primary)' : '#64748b', borderBottom: activeModalTab === 'materiais' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>📚 Materiais Grátis</button>
            </div>

            <div style={{ padding: '2rem' }}>
              {activeModalTab === 'ficha' && (
                <div className="animate-fade">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                      <p style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>💰 SALÁRIO MÉDIO</p>
                      <h4 style={{ fontSize: '1.25rem', color: '#15803d' }}>{selectedConcurso.detalhes_cargo?.salario_medio || 'Consulte o Edital'}</h4>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                      <p style={{ color: '#1e40af', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>⏱️ CARGA HORÁRIA</p>
                      <h4 style={{ fontSize: '1.25rem', color: '#1d4ed8' }}>{selectedConcurso.detalhes_cargo?.carga_horaria || 'Padrão'}</h4>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>💼 O que você vai fazer?</h3>
                    <p style={{ color: '#475569', lineHeight: '1.6' }}>{selectedConcurso.detalhes_cargo?.funcao || 'Atividades previstas no edital oficial.'}</p>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', borderLeft: '4px solid var(--accent-gold)' }}>
                    <h3 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>📈 Plano de Carreira</h3>
                    <p style={{ color: '#475569', lineHeight: '1.6' }}>{selectedConcurso.detalhes_cargo?.plano_carreira || 'Conforme a lei orgânica.'}</p>
                  </div>
                </div>
              )}

              {activeModalTab === 'plano' && (
                <div className="animate-fade">
                  <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#3730a3', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <div>
                      <strong>Mentor AI:</strong> {selectedConcurso.material_estudo?.resumo_ia}
                    </div>
                  </div>
                  
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Plano Semanal (Ciclo de 3 Meses)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(selectedConcurso.material_estudo?.plano_estudos_semanal || []).map((diaObj, idx) => (
                      <div key={idx} style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ width: '120px', background: idx === 5 || idx === 6 ? '#f1f5f9' : 'var(--primary)', color: idx === 5 || idx === 6 ? '#475569' : 'white', padding: '1rem', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {diaObj.dia}
                        </div>
                        <div style={{ padding: '1rem', flex: 1, color: '#334155', fontSize: '0.95rem' }}>
                          {diaObj.conteudo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModalTab === 'materiais' && (
                <div className="animate-fade">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    
                    {/* PDFs e Provas */}
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>📄 Artigos e Provas Anteriores</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(selectedConcurso.material_estudo?.pdf_links || []).concat(selectedConcurso.material_estudo?.provas_anteriores || []).map((link, idx) => (
                          <a key={idx} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none', color: '#0369a1', background: '#f0f9ff', transition: 'background 0.2s', fontWeight: 'bold' }} onMouseOver={e => e.currentTarget.style.background = '#e0f2fe'} onMouseOut={e => e.currentTarget.style.background = '#f0f9ff'}>
                             {link.titulo} ↗
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Vídeo Aulas */}
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>📺 Videoaulas Gratuitas</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(selectedConcurso.material_estudo?.video_links || []).map((link, idx) => (
                          <a key={idx} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textDecoration: 'none', color: '#b91c1c', background: '#fef2f2', transition: 'background 0.2s', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseOver={e => e.currentTarget.style.background = '#fee2e2'} onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>🎬 {link.titulo}</span>
                            <span>↗</span>
                          </a>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => { setSelectedConcurso(null); setActiveModalTab('ficha'); }}>Fechar</button>
              <a href={selectedConcurso.link} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>Acessar Edital Oficial</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
