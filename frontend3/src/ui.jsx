import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

// Load several resources at once: const {d,loading,error,reload} = useData(['batch','course'])
export function useData(names) {
  const key = names.join(',');
  const [d, setD] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try {
      const r = await Promise.all(key.split(',').map((n) => api.list(n)));
      setD(Object.fromEntries(key.split(',').map((n, i) => [n, r[i] || []])));
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [key]);
  useEffect(() => { setLoading(true); load(); }, [load]);
  return { d, loading, error, reload: load };
}
export const gate = (s) => (s.loading ? <Loading /> : s.error ? <Msg m={{ t: 'err', text: s.error }} /> : null);

export const Loading = () => <div className="muted pad">Loading…</div>;
export const Msg = ({ m }) => (m ? <div className={`msg ${m.t}`}>{m.text}</div> : null);

// run async action and show success/error
export function useAct() {
  const [m, setM] = useState(null);
  const run = async (fn, ok = 'Saved successfully') => {
    setM(null);
    try { const r = await fn(); setM({ t: 'ok', text: ok }); return r ?? true; }
    catch (e) { setM({ t: 'err', text: e.message }); return false; }
  };
  return [m, run, setM];
}

export function useForm(init) {
  const [f, setF] = useState(init);
  const bind = (k) => ({ value: f[k] ?? '', onChange: (e) => { const v = e.target.value; setF((p) => ({ ...p, [k]: v })); } });
  return [f, setF, bind, () => setF(init)];
}

export const Page = ({ title, sub, actions, children }) => (
  <div className="page">
    <div className="page-h"><div><h2>{title}</h2>{sub && <p className="muted">{sub}</p>}</div><div>{actions}</div></div>
    {children}
  </div>
);
export const Card = ({ title, children, className = '' }) => (
  <div className={`card ${className}`}>{title && <h3>{title}</h3>}{children}</div>
);
export const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;

export const Table = ({ cols, rows, empty = 'No records yet.' }) =>
  rows.length ? (
    <div className="tw"><table>
      <thead><tr>{cols.map((c, i) => <th key={i}>{c[0]}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{cols.map((c, j) => <td key={j}>{c[1](r, i)}</td>)}</tr>)}</tbody>
    </table></div>
  ) : <p className="muted">{empty}</p>;

export const Select = ({ options, placeholder = 'Select…', ...p }) => (
  <select {...p}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="tabs">{tabs.map(([k, l]) => <button key={k} type="button" className={value === k ? 'active' : ''} onClick={() => onChange(k)}>{l}</button>)}</div>
);

export const Progress = ({ done, total }) => {
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return <div><div className="bar"><div style={{ width: pct + '%' }} /></div><small className="muted">{done || 0} / {total || 0} modules ({pct}%)</small></div>;
};
export const Badge = ({ children, t = '' }) => <span className={`badge ${t}`}>{children}</span>;
export const Avatar = ({ text, size = 36 }) => <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{text}</div>;
