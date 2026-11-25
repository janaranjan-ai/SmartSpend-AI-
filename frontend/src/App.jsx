
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Wallet, LayoutDashboard, ArrowLeftRight, PiggyBank, Lightbulb,
  LogOut, Menu, X, Plus, Search, Download, TrendingUp, TrendingDown,
  CalendarDays, Sparkles, Trash2, Pencil, Eye, EyeOff, ArrowUpRight,
  ArrowDownRight, Target, ShieldCheck, CircleDollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from './api';

const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

const money = n => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(n || 0));

const today = () => new Date().toISOString().slice(0, 10);

const colors = ['#16a34a', '#84cc16', '#0f766e', '#65a30d', '#a3e635', '#64748b'];


function normalizeTransaction(t) {
  return { ...t, id: t._id || t.id };
}

function Brand() {
  return (
    <div className="brand">
      <img src="/logo.svg" alt="SmartSpend logo" />
      <span>SmartSpend <b>AI</b><small>YOUR MONEY, IN FOCUS</small></span>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_user'));
    } catch {
      return null;
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('ss_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ss_user');
    }
  }, [user]);


  // Every account loads its own transactions from the authenticated backend.
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setApiOnline(false);
      setDataError('');
      return;
    }

    let cancelled = false;

    async function loadTransactions() {
      setLoadingData(true);
      setDataError('');

      try {
        const [txRes, budgetRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/budgets')
        ]);

        if (cancelled) return;

        setTransactions(
          Array.isArray(txRes.data) ? txRes.data.map(normalizeTransaction) : []
        );
        setBudgets(Array.isArray(budgetRes.data) ? budgetRes.data : []);
        setApiOnline(true);
      } catch (err) {
        if (cancelled) return;

        setApiOnline(false);
        setDataError(
          err.response?.data?.message ||
          'Could not load your transactions. Check that the backend is running and sign in again.'
        );

        if (err.response?.status === 401) {
          localStorage.removeItem('ss_token');
          localStorage.removeItem('ss_user');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    transactions,
    setTransactions,
    budgets,
    setBudgets,
    apiOnline,
    setApiOnline,
    loadingData,
    dataError,
    setDataError
  }), [user, transactions, budgets, apiOnline, loadingData, dataError]);

  return (
    <Ctx.Provider value={value}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Auth mode="login" />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Auth mode="signup" />}
        />
        <Route
          path="/*"
          element={user ? <Shell /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Ctx.Provider>
  );
}

function Auth({ mode }) {
  const { setUser } = useApp();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signup = mode === 'signup';

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { data } = await api.post(
        `/auth/${signup ? 'register' : 'login'}`,
        signup ? { name, email, password } : { email, password }
      );

      if (!data.token || !data.user) {
        throw new Error('The server returned an invalid login response.');
      }

      localStorage.setItem('ss_token', data.token);
      localStorage.removeItem('ss_tx');
      setUser(data.user);
      nav('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to the backend. Start your backend and try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow one" />
      <div className="auth-glow two" />

      <div className="auth-left">
        <Brand />
        <div className="auth-message">
          <span className="eyebrow"><Sparkles size={15} /> FINANCIAL CLARITY STARTS HERE</span>
          <h1>Make every<br />rupee <em>count.</em></h1>
          <p>A calmer way to understand your spending, build better habits and move closer to your goals.</p>
          <div className="trust"><ShieldCheck size={17} /> Your financial data stays yours</div>
        </div>
        <div className="auth-foot">© 2026 SmartSpend AI · Track smarter. Spend better. Save more.</div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="mobile-brand"><Brand /></div>

          <div className="auth-heading">
            <span className="eyebrow">{signup ? 'GET STARTED' : 'WELCOME BACK'}</span>
            <h2>{signup ? 'Create your account' : 'Good to see you again'}</h2>
            <p>{signup ? 'Start building a healthier relationship with money.' : 'Sign in to pick up where you left off.'}</p>
          </div>

          <form onSubmit={submit}>
            {signup && (
              <label>
                Full name
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </label>
            )}

            <label>
              Email address
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>

            <label>
              Password
              <div className="password-wrap">
                <input
                  required
                  minLength={6}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
                <button type="button" className="icon-btn" onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error && <div className="error">{error}</div>}

            {!signup && (
              <div className="form-row">
                <label className="check"><input type="checkbox" /> Remember me</label>
                <span className="muted tiny">Secure sign in</span>
              </div>
            )}

            <button className="btn primary full" disabled={busy}>
              {busy ? 'Please wait...' : signup ? 'Create account' : 'Sign in'}
              <ArrowUpRight size={17} />
            </button>
          </form>

          <div className="auth-switch">
            {signup ? 'Already have an account?' : 'New to SmartSpend?'}
            {' '}
            <a href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</a>
          </div>

          <div className="demo-note">
            Sign in with the backend to access your private transactions.
          </div>
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const [open, setOpen] = useState(false);
  const { user, setUser, dataError, loadingData } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    ['Overview', '/', LayoutDashboard],
    ['Transactions', '/transactions', ArrowLeftRight],
    ['Budgets', '/budgets', PiggyBank],
    ['Insights', '/insights', Lightbulb]
  ];

  function logout() {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
    nav('/login');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'show' : ''}`}>
        <Brand />
        <button className="mobile-close" onClick={() => setOpen(false)}><X /></button>
        <div className="side-label">WORKSPACE</div>

        <nav>
          {links.map(([label, path, Icon]) => (
            <NavLink
              end={path === '/'}
              to={path}
              key={path}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
              {path === '/' && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={17} /></div>
            <b>Small steps, big goals.</b>
            <p>Keep an eye on your money and make progress every day.</p>
          </div>

          <div className="profile">
            <div className="avatar">{(user?.name || 'S').slice(0, 1).toUpperCase()}</div>
            <div className="profile-info">
              <b>{user?.name || 'SmartSpender'}</b>
              <small>{user?.email || 'Your account'}</small>
            </div>
            <button className="icon-btn" title="Log out" onClick={logout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu icon-btn" onClick={() => setOpen(true)}><Menu /></button>
          <div className="crumb">
            Workspace <span>/</span>
            <b>{links.find(x => x[1] === loc.pathname)?.[0] || 'Overview'}</b>
          </div>
          <div className="top-actions">
            <span className="date-chip">
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div className="top-avatar">{(user?.name || 'S').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="content">
          {loadingData && <div className="error">Loading your transactions...</div>}
          {dataError && <div className="error">{dataError}</div>}

          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="insights" element={<Insights />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function PageTitle({ eyebrow, title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Stats() {
  const { transactions } = useApp();

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="stats-grid">
      <Stat title="Total balance" value={money(income - expense)} note="Income minus expenses" icon={Wallet} tone="green" />
      <Stat title="Total income" value={money(income)} note="Money coming in" icon={TrendingUp} tone="mint" />
      <Stat title="Total expenses" value={money(expense)} note="Money going out" icon={TrendingDown} tone="orange" />
      <Stat title="Net savings" value={money(income - expense)} note="Available after spending" icon={PiggyBank} tone="lime" />
    </div>
  );
}

function Stat({ title, value, note, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function chartData() {
  const now = new Date();

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expenses: 0
    };
  });
}

function Dashboard() {
  const { transactions } = useApp();
  const data = chartData();

  transactions.forEach(t => {
    const d = new Date(t.date + 'T00:00:00');
    const item = data.find(x =>
      x.month === d.toLocaleDateString('en-IN', { month: 'short' })
    );

    if (item) {
      item[t.type === 'income' ? 'income' : 'expenses'] += Number(t.amount);
    }
  });

  const cats = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
    });

  const pie = Object.entries(cats).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageTitle
        eyebrow="YOUR FINANCIAL OVERVIEW"
        title="Good things are growing."
        sub="Here's what's happening with your money."
        action={
          <a className="btn primary" href="/transactions">
            <Plus size={17} /> Add transaction
          </a>
        }
      />

      <Stats />

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Cash flow</h3>
              <p>Income vs expenses · last 6 months</p>
            </div>
            <span className="pill">
              <span className="legend-dot green-dot" /> Income
              <span className="legend-dot orange-dot" /> Expenses
            </span>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1ed" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b978e', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={v => money(v)} />
                <Area type="monotone" dataKey="income" stroke="#16a34a" fill="url(#inc)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="transparent" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel category-panel">
          <div className="panel-head">
            <div>
              <h3>Spending by category</h3>
              <p>Where your money goes</p>
            </div>
          </div>

          {pie.length ? (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={83} paddingAngle={4}>
                      {pie.map((p, i) => (
                        <Cell key={p.name} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="category-legend">
                {pie.slice(0, 5).map((p, i) => (
                  <div key={p.name}>
                    <span><i style={{ background: colors[i % colors.length] }} />{p.name}</span>
                    <b>{money(p.value)}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty text="Add an expense to see your category breakdown." />
          )}
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h3>Recent transactions</h3>
            <p>Your latest money movements</p>
          </div>
          <a className="text-link" href="/transactions">View all <ArrowUpRight size={15} /></a>
        </div>

        <TransactionTable
          rows={[...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)}
        />
      </section>
    </>
  );
}

function Empty({ text }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Wallet size={22} /></div>
      <p>{text}</p>
    </div>
  );
}

function TransactionTable({ rows, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TRANSACTION</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th>AMOUNT</th>
            {onEdit && <th></th>}
          </tr>
        </thead>

        <tbody>
          {rows.map(t => (
            <tr key={t.id || t._id}>
              <td>
                <div className="transaction-name">
                  <span className={`tx-icon ${t.type}`}>
                    {t.type === 'income' ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  <span>
                    <b>{t.title}</b>
                    <small>{t.note || t.type}</small>
                  </span>
                </div>
              </td>
              <td><span className="category-tag">{t.category}</span></td>
              <td className="muted">
                {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td className={t.type === 'income' ? 'amount-in' : 'amount-out'}>
                {t.type === 'income' ? '+' : '−'}{money(t.amount)}
              </td>

              {onEdit && (
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => onEdit(t)}>
                      <Pencil size={15} />
                    </button>
                    <button className="icon-btn danger" onClick={() => onDelete(t.id || t._id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && <Empty text="No transactions yet. Add your first transaction to get started." />}
    </div>
  );
}

function Transactions() {
  const { transactions, setTransactions, setDataError } = useApp();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = transactions.filter(t =>
    (type === 'all' || t.type === type) &&
    `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase())
  );

  async function save(item) {
    setBusy(true);
    setDataError('');

    try {
      if (editing) {
        const id = editing.id || editing._id;
        const { data } = await api.put(`/transactions/${id}`, item);
        const updated = normalizeTransaction(data);

        setTransactions(old =>
          old.map(t => (t.id || t._id) === id ? updated : t)
        );
      } else {
        const { data } = await api.post('/transactions', item);
        setTransactions(old => [normalizeTransaction(data), ...old]);
      }

      setModal(false);
      setEditing(null);
    } catch (err) {
      setDataError(
        err.response?.data?.message ||
        'Could not save the transaction. Please check your connection.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function del(id) {
    if (!confirm('Delete this transaction?')) return;

    setDataError('');

    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(old => old.filter(t => (t.id || t._id) !== id));
    } catch (err) {
      setDataError(err.response?.data?.message || 'Could not delete transaction.');
    }
  }

  function exportCSV() {
    const csv = [
      'Title,Type,Category,Amount,Date,Note',
      ...filtered.map(t =>
        [t.title, t.type, t.category, t.amount, t.date, t.note]
          .map(v => `"${String(v ?? '').replaceAll('"', '""')}"`)
          .join(',')
      )
    ].join('\n');

    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.href = url;
    a.download = 'smartspend-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageTitle
        eyebrow="MONEY MOVEMENT"
        title="Transactions"
        sub="Every rupee has a story. Keep track of yours."
        action={
          <button className="btn primary" onClick={() => {
            setEditing(null);
            setModal(true);
          }}>
            <Plus size={17} /> Add transaction
          </button>
        }
      />

      <section className="panel">
        <div className="toolbar">
          <div className="searchbox">
            <Search size={17} />
            <input
              placeholder="Search transactions..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <button className="btn secondary" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        <TransactionTable
          rows={filtered}
          onEdit={t => {
            setEditing(t);
            setModal(true);
          }}
          onDelete={del}
        />
      </section>

      {modal && (
        <TransactionModal
          initial={editing}
          busy={busy}
          onClose={() => {
            setModal(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </>
  );
}

function TransactionModal({ initial, onClose, onSave, busy }) {
  const [form, setForm] = useState(initial || {
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: today(),
    note: ''
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        onSubmit={e => {
          e.preventDefault();
          onSave({
            title: form.title,
            amount: Number(form.amount),
            type: form.type,
            category: form.category,
            date: form.date,
            note: form.note || ''
          });
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">MONEY MOVEMENT</span>
            <h2>{initial ? 'Edit transaction' : 'Add transaction'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><X /></button>
        </div>

        <label>
          Type
          <select value={form.type} onChange={e => update('type', e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Description
          <input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Grocery shopping" />
        </label>

        <div className="two-fields">
          <label>
            Amount (₹)
            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => update('amount', e.target.value)} />
          </label>
          <label>
            Date
            <input required type="date" value={form.date} onChange={e => update('date', e.target.value)} />
          </label>
        </div>

        <label>
          Category
          <select value={form.category} onChange={e => update('category', e.target.value)}>
            {(form.type === 'income'
              ? ['Salary', 'Freelance', 'Business', 'Investment', 'Other']
              : ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Health', 'Entertainment', 'Travel', 'Other']
            ).map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label>
          Note (optional)
          <input value={form.note || ''} onChange={e => update('note', e.target.value)} placeholder="Add a little detail" />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Budgets() {
  const { budgets, setBudgets, transactions, setDataError } = useApp();

  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [busy, setBusy] = useState(false);

  const spent = cat => transactions
    .filter(t =>
      t.type === 'expense' &&
      t.category === cat &&
      t.date.slice(0, 7) === today().slice(0, 7)
    )
    .reduce((s, t) => s + Number(t.amount), 0);

  async function add(e) {
    e.preventDefault();

    if (!limit || Number(limit) < 1) return;

    setBusy(true);
    setDataError('');

    try {
      const { data } = await api.post('/budgets', {
        category,
        limit: Number(limit)
      });

      setBudgets(old => [
        ...old.filter(b => b.category !== data.category),
        data
      ]);

      setLimit('');
    } catch (err) {
      setDataError(
        err.response?.data?.message || 'Could not save budget.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeBudget(id) {
    if (!confirm('Delete this budget?')) return;

    setDataError('');

    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(old => old.filter(b => b._id !== id));
    } catch (err) {
      setDataError(
        err.response?.data?.message || 'Could not delete budget.'
      );
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="PLAN WITH PURPOSE"
        title="Your budgets"
        sub="Give your spending a plan, not a restriction."
      />

      <div className="budget-summary">
        <div>
          <span className="eyebrow">TOTAL MONTHLY BUDGET</span>
          <h2>{money(budgets.reduce((s, b) => s + Number(b.limit), 0))}</h2>
        </div>
        <div>
          <span className="eyebrow">TOTAL SPENT THIS MONTH</span>
          <h2>{money(budgets.reduce((s, b) => s + spent(b.category), 0))}</h2>
        </div>
      </div>

      <div className="budget-grid">
        {budgets.map((b, i) => {
          const amount = spent(b.category);
          const pct = b.limit > 0 ? Math.min(100, amount / b.limit * 100) : 0;

          return (
            <div className="panel budget-card" key={b._id}>
              <div className="budget-head">
                <div
                  className="budget-symbol"
                  style={{
                    background: `${colors[i % colors.length]}18`,
                    color: colors[i % colors.length]
                  }}
                >
                  <Target />
                </div>
                <button
                  className="icon-btn danger"
                  onClick={() => removeBudget(b._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3>{b.category}</h3>
              <div className="budget-amount">
                <b>{money(amount)}</b>
                <span>of {money(b.limit)}</span>
              </div>
              <div className="progress">
                <i
                  style={{
                    width: `${pct}%`,
                    background: pct > 90 ? '#ef4444' : colors[i % colors.length]
                  }}
                />
              </div>
              <div className="budget-foot">
                <span>{Math.round(pct)}% used</span>
                <span>{money(Math.max(0, b.limit - amount))} left</span>
              </div>
            </div>
          );
        })}
      </div>

      <section className="panel add-budget">
        <div>
          <h3>Set a category budget</h3>
          <p>Choose a monthly spending limit.</p>
        </div>

        <form onSubmit={add}>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {[
              'Food', 'Transport', 'Shopping', 'Bills', 'Education',
              'Health', 'Entertainment', 'Travel', 'Other'
            ].map(x => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Limit in ₹"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            required
          />

          <button className="btn primary" disabled={busy}>
            <Plus size={16} /> {busy ? 'Saving...' : 'Set budget'}
          </button>
        </form>
      </section>
    </>
  );
}

function Insights() {
  const { transactions, budgets } = useApp();

  const expenses = transactions.filter(t => t.type === 'expense');

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const total = expenses.reduce((s, t) => s + Number(t.amount), 0);

  const groups = {};
  expenses.forEach(t => {
    groups[t.category] = (groups[t.category] || 0) + Number(t.amount);
  });

  const top = Object.entries(groups).sort((a, b) => b[1] - a[1])[0];
  const saving = income - total;

  const observations = [
    {
      icon: CircleDollarSign,
      title: 'Your savings snapshot',
      text: saving >= 0
        ? `You have ${money(saving)} left after the income and expenses currently recorded.`
        : `Your recorded expenses are ${money(Math.abs(saving))} higher than your income. Review upcoming spending.`
    },
    top ? {
      icon: TrendingUp,
      title: `${top[0]} is your top expense`,
      text: `${top[0]} accounts for ${total ? Math.round(top[1] / total * 100) : 0}% of your recorded expenses (${money(top[1])}). Consider setting a category limit.`
    } : null,
    ...budgets.map(b => {
      const s = expenses
        .filter(t => t.category === b.category)
        .reduce((a, t) => a + Number(t.amount), 0);

      return {
        icon: PiggyBank,
        title: `${b.category} budget check`,
        text: s > b.limit
          ? `You are ${money(s - b.limit)} over your ${money(b.limit)} budget.`
          : `You have ${money(b.limit - s)} remaining from your ${money(b.limit)} budget.`
      };
    })
  ].filter(Boolean);

  return (
    <>
      <PageTitle
        eyebrow="MAKE YOUR MONEY WORK"
        title="Financial insights"
        sub="Simple observations from the transactions you record."
      />

      <div className="insight-highlight">
        <div className="insight-spark"><Sparkles size={23} /></div>
        <div>
          <span>YOUR CURRENT SAVINGS POSITION</span>
          <h2>{money(saving)}</h2>
          <p>
            {saving >= 0
              ? 'You are currently spending less than your recorded income. Keep it up.'
              : 'Your recorded expenses are above your income. A closer look at categories may help.'}
          </p>
        </div>
      </div>

      <div className="section-heading">
        <h3>What your numbers are telling you</h3>
        <span className="pill">Based on your data</span>
      </div>

      <div className="insight-list">
        {observations.map((o, i) => (
          <div className="panel insight-item" key={i}>
            <div className="insight-icon"><o.icon size={20} /></div>
            <div>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="disclaimer">
        These are basic, rule-based observations based on manually entered transactions.
        They are for general budgeting awareness, not investment or financial advice.
      </p>
    </>
  );
}

export default App;
