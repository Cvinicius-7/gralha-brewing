import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  Package,
  ShoppingBag,
  MessageSquare,
  Activity,
  Plus,
  Minus,
  Check,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  LogOut,
  Users,
} from 'lucide-react';

export default function AdminDashboard({ onBackToStore }) {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('gralha_admin_token') || '';
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [activeTab, setActiveTab] = useState('stock');
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      ordersCount: 0,
      revenueTotal: 0,
      subscribersCount: 0,
      messagesCount: 0,
      auditEventsCount: 0,
    },
    products: [],
    orders: [],
    messages: [],
    subscribers: [],
    auditLogs: [],
  });

  // Edição local de estoque e lote por produto
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingProductId, setSavingProductId] = useState(null);
  const [savedProductId, setSavedProductId] = useState(null);
  const [stockError, setStockError] = useState(null);

  const fetchOverview = useCallback(async (adminToken) => {
    if (!adminToken) return;
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/overview', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken.trim()}`,
          'X-Gralha-Client': 'admin-console-v1',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha na autenticação administrativa.');
      }

      sessionStorage.setItem('gralha_admin_token', adminToken.trim());
      setAuthenticated(true);
      setDashboardData({
        metrics: data.metrics || {},
        products: Array.isArray(data.products) ? data.products : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        messages: Array.isArray(data.messages) ? data.messages : [],
        subscribers: Array.isArray(data.subscribers) ? data.subscribers : [],
        auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
      });

      const drafts = {};
      for (const p of data.products || []) {
        drafts[p.id] = {
          stock: p.stock,
          batch: p.batch || '',
        };
      }
      setStockDrafts(drafts);
    } catch (err) {
      setAuthenticated(false);
      sessionStorage.removeItem('gralha_admin_token');
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('gralha_admin_token');
    if (saved) {
      fetchOverview(saved);
    }
  }, [fetchOverview]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    fetchOverview(token);
  };

  // Auto-preenchimento seguro exclusivo para loopback local (127.0.0.1)
  const handleLoadLocalDevToken = async () => {
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/dev-token');
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(
          data.error || 'Auto-preenchimento disponível apenas em localhost.'
        );
      }
      setToken(data.token);
      fetchOverview(data.token);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gralha_admin_token');
    setAuthenticated(false);
    setToken('');
  };

  const handleAdjustStockDraft = (productId, delta) => {
    setStockDrafts((prev) => {
      const current = prev[productId] || { stock: 0, batch: '' };
      const nextStock = Math.max(0, Math.min(9999, Number(current.stock) + delta));
      return {
        ...prev,
        [productId]: {
          ...current,
          stock: nextStock,
        },
      };
    });
  };

  const handleSaveProductStock = async (productId) => {
    const draft = stockDrafts[productId];
    if (!draft) return;

    setSavingProductId(productId);
    setStockError(null);

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          productId,
          stock: Number(draft.stock),
          batch: draft.batch,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar estoque.');
      }

      setSavedProductId(productId);
      setTimeout(() => {
        setSavedProductId((prev) => (prev === productId ? null : prev));
      }, 1500);

      // Atualiza os dados e logs
      fetchOverview(token);
    } catch (err) {
      setStockError(err.message);
    } finally {
      setSavingProductId(null);
    }
  };

  const handleUpdateMessageStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchOverview(token);
      }
    } catch {
      // Silencioso em caso de erro de rede temporário
    }
  };

  if (!authenticated) {
    return (
      <section className="min-h-[82vh] bg-[#111315] text-[#F4F1EA] py-20 px-6 lg:px-12 flex items-center justify-center">
        <div className="w-full max-w-xl border border-[#F4F1EA]/15 bg-[#132C3C]/25 p-8 sm:p-12 shadow-[0_28px_70px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#F4F1EA]/12">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#D88128]" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D88128]">
                Acesso Restrito • Mestre Cervejeiro
              </span>
            </div>
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 text-xs text-[#C8C3B8] hover:text-[#D88128] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Site</span>
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#F4F1EA] leading-tight mb-3">
            Console Operacional &amp; Auditoria AppSec.
          </h1>
          <p className="text-sm text-[#C8C3B8] font-light leading-relaxed mb-8">
            Autenticação protegida por comparação em tempo constante (
            <span className="font-mono text-xs text-[#F4F1EA]">
              crypto.timingSafeEqual
            </span>
            ). Insira a chave{' '}
            <span className="font-mono text-xs text-[#D88128]">
              ADMIN_API_TOKEN
            </span>{' '}
            gerada em <span className="font-mono text-xs">backend/.env.local</span>.
          </p>

          {authError && (
            <div className="mb-6 p-4 border border-red-500/40 bg-red-950/30 flex items-start gap-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-token-input"
                className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8C3B8] mb-2"
              >
                Chave Criptográfica Administrativa (Bearer Token)
              </label>
              <input
                id="admin-token-input"
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ex: d29568addd7bf967c44b9b54..."
                className="w-full bg-[#111315] border border-[#F4F1EA]/25 px-4 py-3.5 font-mono text-xs text-[#F4F1EA] placeholder-[#8E969F]/60 focus:outline-none focus:border-[#D88128] transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleLoadLocalDevToken}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-[#F4F1EA]/20 text-xs text-[#C8C3B8] hover:border-[#D88128] hover:text-[#F4F1EA] transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#D88128]" />
                <span>Autenticar Localhost (127.0.0.1)</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-craft-b-dark justify-center"
              >
                <span>{loading ? 'Verificando...' : 'Desbloquear Painel'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  const { metrics, products, orders, messages, subscribers, auditLogs } =
    dashboardData;

  return (
    <div className="min-h-screen bg-[#111315] text-[#F4F1EA] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        {/* TOP HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#F4F1EA]/12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3">
              <span className="w-8 h-px bg-[#D88128]" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D88128]">
                Painel do Mestre Cervejeiro • SQLite WAL + AES-256-GCM
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#F4F1EA] tracking-tight">
              Gestão de Lotes, Pedidos &amp; Segurança.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fetchOverview(token)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#F4F1EA]/20 text-xs uppercase tracking-[0.16em] text-[#F4F1EA] hover:border-[#D88128] transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#D88128] ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              <span>Atualizar</span>
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#F4F1EA]/20 text-xs uppercase tracking-[0.16em] text-[#C8C3B8] hover:text-[#F4F1EA] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar à Loja</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-xs uppercase tracking-[0.16em] text-red-300 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>

        {/* METRICS STRIP (Architectural 4-Column Hairline Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#F4F1EA]/12 bg-[#132C3C]/15 divide-y sm:divide-y-0 sm:divide-x divide-[#F4F1EA]/12">
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E969F] uppercase tracking-[0.18em]">
              <span>Pedidos Criptografados</span>
              <ShoppingBag className="w-4 h-4 text-[#D88128]" />
            </div>
            <p className="font-serif text-3xl text-[#F4F1EA]">
              {metrics.ordersCount || 0}
            </p>
            <p className="font-mono text-xs text-[#749B6C]">
              Receita Confirmada: R${' '}
              {Number(metrics.revenueTotal || 0)
                .toFixed(2)
                .replace('.', ',')}
            </p>
          </div>

          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E969F] uppercase tracking-[0.18em]">
              <span>Estoque Câmara Fria</span>
              <Package className="w-4 h-4 text-[#D88128]" />
            </div>
            <p className="font-serif text-3xl text-[#F4F1EA]">
              {products.reduce((acc, p) => acc + (p.stock || 0), 0)} un.
            </p>
            <p className="font-mono text-xs text-[#C8C3B8]">
              {products.length} rótulos &amp; kits ativos a 2°C
            </p>
          </div>

          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E969F] uppercase tracking-[0.18em]">
              <span>Clube do Tanque &amp; Leads</span>
              <Users className="w-4 h-4 text-[#D88128]" />
            </div>
            <p className="font-serif text-3xl text-[#F4F1EA]">
              {(metrics.subscribersCount || 0) + (metrics.messagesCount || 0)}
            </p>
            <p className="font-mono text-xs text-[#C8C3B8]">
              {metrics.subscribersCount || 0} newsletter •{' '}
              {metrics.messagesCount || 0} mensagens
            </p>
          </div>

          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8E969F] uppercase tracking-[0.18em]">
              <span>Eventos AppSec / LGPD</span>
              <Activity className="w-4 h-4 text-[#749B6C]" />
            </div>
            <p className="font-serif text-3xl text-[#F4F1EA]">
              {metrics.auditEventsCount || 0}
            </p>
            <p className="font-mono text-xs text-[#749B6C]">
              Integridade GCM &amp; Blind Index Ativos
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-6 border-b border-[#F4F1EA]/12">
          {[
            {
              id: 'stock',
              label: `1. Câmara Fria & Lotes (${products.length})`,
            },
            {
              id: 'orders',
              label: `2. Pedidos Recebidos (${orders.length})`,
            },
            {
              id: 'leads',
              label: `3. Mensagens & Clube do Tanque (${
                messages.length + subscribers.length
              })`,
            },
            {
              id: 'audit',
              label: `4. Trilha de Auditoria AppSec (${auditLogs.length})`,
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-mono text-xs uppercase tracking-[0.18em] border-b-2 transition-colors ${
                  active
                    ? 'border-[#D88128] text-[#F4F1EA]'
                    : 'border-transparent text-[#8E969F] hover:text-[#F4F1EA]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CONTROLE DE ESTOQUE & LOTES */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {stockError && (
              <div className="p-4 border border-red-500/40 bg-red-950/30 text-xs text-red-200">
                {stockError}
              </div>
            )}

            <div className="overflow-x-auto border border-[#F4F1EA]/12">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F4F1EA]/12 bg-[#132C3C]/30 font-mono text-[11px] uppercase tracking-[0.16em] text-[#C8C3B8]">
                    <th className="py-4 px-5">Rótulo / Kit</th>
                    <th className="py-4 px-5">Estilo &amp; Volume</th>
                    <th className="py-4 px-5">Preço Server-Side</th>
                    <th className="py-4 px-5">Código do Lote</th>
                    <th className="py-4 px-5">Estoque Disponível</th>
                    <th className="py-4 px-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1EA]/10 text-sm">
                  {products.map((prod) => {
                    const draft = stockDrafts[prod.id] || {
                      stock: prod.stock,
                      batch: prod.batch || '',
                    };
                    const isSaving = savingProductId === prod.id;
                    const isSaved = savedProductId === prod.id;

                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-[#F4F1EA]/[0.02] transition-colors"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              loading="lazy"
                              className="w-11 h-11 object-cover border border-[#F4F1EA]/15 bg-[#111315]"
                            />
                            <div>
                              <span className="font-serif text-base text-[#F4F1EA] block">
                                {prod.name}
                              </span>
                              <span className="font-mono text-[11px] text-[#8E969F]">
                                ID: {prod.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-xs text-[#C8C3B8]">
                          <span className="block">{prod.style}</span>
                          <span className="text-[#8E969F]">{prod.volume}</span>
                        </td>

                        <td className="py-4 px-5 font-mono text-xs text-[#D88128]">
                          R$ {Number(prod.price).toFixed(2).replace('.', ',')}
                        </td>

                        <td className="py-4 px-5">
                          <input
                            type="text"
                            maxLength={40}
                            value={draft.batch}
                            onChange={(e) =>
                              setStockDrafts((prev) => ({
                                ...prev,
                                [prod.id]: {
                                  ...draft,
                                  batch: e.target.value,
                                },
                              }))
                            }
                            className="w-40 bg-[#111315] border border-[#F4F1EA]/20 px-3 py-1.5 font-mono text-xs text-[#F4F1EA] focus:outline-none focus:border-[#D88128]"
                          />
                        </td>

                        <td className="py-4 px-5">
                          <div className="inline-flex items-center border border-[#F4F1EA]/20 bg-[#111315]">
                            <button
                              type="button"
                              onClick={() => handleAdjustStockDraft(prod.id, -1)}
                              className="px-2.5 py-1.5 text-[#C8C3B8] hover:text-[#D88128]"
                              aria-label="Diminuir estoque"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={9999}
                              value={draft.stock}
                              onChange={(e) =>
                                setStockDrafts((prev) => ({
                                  ...prev,
                                  [prod.id]: {
                                    ...draft,
                                    stock: Math.max(
                                      0,
                                      parseInt(e.target.value || '0', 10)
                                    ),
                                  },
                                }))
                              }
                              className="w-16 text-center bg-transparent font-mono text-xs text-[#F4F1EA] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdjustStockDraft(prod.id, 1)}
                              className="px-2.5 py-1.5 text-[#C8C3B8] hover:text-[#D88128]"
                              aria-label="Aumentar estoque"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveProductStock(prod.id)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] border transition-colors ${
                              isSaved
                                ? 'border-[#749B6C] bg-[#5A7D53] text-[#F4F1EA]'
                                : 'border-[#D88128]/60 bg-[#132C3C]/40 text-[#F4F1EA] hover:bg-[#D88128] hover:text-[#111315]'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Salvo</span>
                              </>
                            ) : (
                              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PEDIDOS RECEBIDOS (PII DESCRIPTOGRAFADO EM MEMÓRIA) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 border border-[#F4F1EA]/12 text-center text-sm text-[#8E969F]">
                Nenhum pedido registrado ainda. Faça um pedido de teste pelo Catálogo para visualizar a descriptografia AES-256-GCM em tempo real.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 border border-[#F4F1EA]/12 bg-[#132C3C]/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs px-2.5 py-1 bg-[#D88128]/20 border border-[#D88128]/50 text-[#D88128]">
                        #{order.protocol}
                      </span>
                      <span className="font-serif text-xl text-[#F4F1EA]">
                        {order.customerName}
                      </span>
                      <span className="font-mono text-xs text-[#C8C3B8]">
                        • {order.customerPhone}
                      </span>
                      <span className="font-mono text-[11px] text-[#749B6C] uppercase">
                        [{order.status}]
                      </span>
                    </div>

                    <p className="text-xs text-[#8E969F] font-mono">
                      Entrega: {order.deliveryMethod} ({order.cepMasked}) • Pagamento:{' '}
                      {order.paymentMethod.toUpperCase()}{' '}
                      {order.cardMasked ? `(${order.cardMasked})` : ''} • Data:{' '}
                      {order.createdAt}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {(order.items || []).map((it, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 bg-[#111315] border border-[#F4F1EA]/10 text-[#C8C3B8]"
                        >
                          {it.qty}x {it.product_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:text-right shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#F4F1EA]/10">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#8E969F] block">
                      Total Verificado no Servidor
                    </span>
                    <span className="font-serif text-2xl text-[#D88128]">
                      R$ {Number(order.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: LEADS COMERCIAIS & CLUBE DO TANQUE */}
        {activeTab === 'leads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Mensagens do Formulário de Contato (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-serif text-2xl text-[#F4F1EA] pb-3 border-b border-[#F4F1EA]/12">
                Mensagens Comerciais &amp; Eventos ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <p className="text-xs text-[#8E969F] py-6">
                  Nenhuma mensagem enviada pelo formulário da Home ainda.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-5 border border-[#F4F1EA]/12 bg-[#132C3C]/15 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] text-[#D88128] uppercase tracking-[0.16em] block">
                          {msg.protocol} • {msg.subject}
                        </span>
                        <h3 className="font-serif text-lg text-[#F4F1EA]">
                          {msg.name}{' '}
                          <span className="font-mono text-xs text-[#C8C3B8]">
                            ({msg.phone})
                          </span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 border ${
                            msg.status === 'ANSWERED'
                              ? 'border-[#749B6C] text-[#749B6C]'
                              : 'border-[#D88128]/50 text-[#D88128]'
                          }`}
                        >
                          {msg.status}
                        </span>
                        {msg.status !== 'ANSWERED' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateMessageStatus(msg.id, 'ANSWERED')
                            }
                            className="text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-1 border border-[#F4F1EA]/20 hover:border-[#749B6C] text-[#C8C3B8] hover:text-[#F4F1EA]"
                          >
                            Marcar Respondido
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#C8C3B8] leading-relaxed bg-[#111315]/70 p-3.5 border border-[#F4F1EA]/10">
                      {msg.message}
                    </p>
                    <span className="block font-mono text-[10px] text-[#8E969F]">
                      Recebido em: {msg.createdAt} (PII criptografado em repouso com AES-256-GCM)
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Inscritos no Clube do Tanque / Newsletter (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-serif text-2xl text-[#F4F1EA] pb-3 border-b border-[#F4F1EA]/12">
                Clube do Tanque • Newsletter ({subscribers.length})
              </h2>

              {subscribers.length === 0 ? (
                <p className="text-xs text-[#8E969F] py-6">
                  Nenhum e-mail inscrito ainda no rodapé.
                </p>
              ) : (
                <div className="divide-y divide-[#F4F1EA]/10 border border-[#F4F1EA]/12 bg-[#132C3C]/15">
                  {subscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-mono text-[#F4F1EA] block">
                          {sub.email}
                        </span>
                        <span className="font-mono text-[10px] text-[#8E969F]">
                          Origem: {sub.source}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8E969F]">
                        {sub.createdAt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TRILHA DE AUDITORIA APPSEC & LGPD */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto border border-[#F4F1EA]/12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4F1EA]/12 bg-[#132C3C]/30 font-mono text-[11px] uppercase tracking-[0.16em] text-[#C8C3B8]">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Severidade</th>
                  <th className="py-3.5 px-4">Evento</th>
                  <th className="py-3.5 px-4">Blind Hash IP (HMAC)</th>
                  <th className="py-3.5 px-4">Detalhes</th>
                  <th className="py-3.5 px-4 text-right">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EA]/10 font-mono text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F1EA]/[0.02]">
                    <td className="py-3 px-4 text-[#8E969F]">#{log.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] border ${
                          log.severity === 'CRITICAL'
                            ? 'border-red-500/50 bg-red-950/40 text-red-300'
                            : log.severity === 'WARN'
                            ? 'border-[#D88128]/50 bg-[#D88128]/15 text-[#D88128]'
                            : 'border-[#749B6C]/50 bg-[#749B6C]/15 text-[#749B6C]'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#F4F1EA]">
                      {log.event_type}
                    </td>
                    <td className="py-3 px-4 text-[#8E969F]">
                      {String(log.ip_hash || '').slice(0, 16)}…
                    </td>
                    <td className="py-3 px-4 text-[#C8C3B8] max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-[#8E969F]">
                      {log.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
