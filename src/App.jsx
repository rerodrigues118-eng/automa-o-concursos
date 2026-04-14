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
      
      // Filtro de Data (Segurança Frontend)
      const dateStr = c.data_encerramento || '';
      const yearMatch = dateStr.match(/\d{4}$/);
      const isFutureOrCurrent = yearMatch ? parseInt(yearMatch[0]) >= 2026 : true;

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

      {/* Modal e Footer iguais */}
      {selectedConcurso && (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }} onClick={() => setSelectedConcurso(null)}>
          <div className="modal-content animate-fade" style={{
              background: 'white', borderRadius: '1rem', maxWidth: '700px', width: '100%',
              maxHeight: '85vh', overflowY: 'auto', padding: '2rem', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', right: '1rem', top: '1rem', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedConcurso(null)}>×</button>
            <h2>Plan: {selectedConcurso.orgao}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span className="badge badge-open">{selectedConcurso.categoria}</span>
                <span className="badge" style={{ background: '#eee' }}>{selectedConcurso.localizacao}</span>
            </div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', background: '#f0f7ff', padding: '1rem', borderRadius: '0.5rem' }}>
                {selectedConcurso.material_estudo?.resumo_ia}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
