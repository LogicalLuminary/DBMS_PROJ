import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useData, gate, Card, Field, Msg } from '../ui';
import { money } from '../util';

export function Home() {
  const s = useData(['course']);
  const cats = s.loading ? [] : [...new Set(s.d.course.map((c) => c.category))].slice(0, 3);
  return (
    <>
      <section className="hero">
        <h1>Learn. Grow. Succeed.</h1>
        <p>Structured batches, expert teachers and complete progress tracking — all in one place.</p>
        <div><Link className="btn" to="/catalog">Explore Courses</Link> <Link className="btn ghost light" to="/login">Login</Link></div>
      </section>
      <section className="wrap">
        <h2>Why EduPortal?</h2>
        <div className="grid3">
          <Card title="📚 Batch based learning">Every enrollment lives inside a batch with its own schedule, tests and notices.</Card>
          <Card title="📈 Track progress">Attendance, test scores and module progress are always visible.</Card>
          <Card title="🧾 Transparent fees">Fee receipts and reference numbers are available to every student.</Card>
        </div>
        {cats.length > 0 && (<><h2>Popular categories</h2>
          <div className="grid3">{cats.map((c) => <Link key={c} to={`/catalog?cat=${encodeURIComponent(c)}`} className="card cat"><h3>{c}</h3><p className="muted">View courses →</p></Link>)}</div></>)}
      </section>
    </>
  );
}

export const About = () => (
  <section className="wrap">
    <h1>About Us</h1>
    <p>EduPortal is a coaching institute management platform. Admissions, enrollments and fee/salary entries are handled by our assistants at the institute, so students and teachers can focus on learning and teaching.</p>
    <div className="grid3">
      <Card title="Our mission">Make quality education organised and accessible.</Card>
      <Card title="Our team">Experienced teachers, supportive assistants and a dedicated admin team.</Card>
      <Card title="Get admitted">Visit the institute — an assistant will register you and your login details will be e-mailed to you.</Card>
    </div>
  </section>
);

export function Catalog() {
  const s = useData(['course']);
  const params = new URLSearchParams(window.location.search);
  const [cat, setCat] = useState(params.get('cat') || '');
  const g = gate(s); if (g) return <section className="wrap">{g}</section>;
  const cats = [...new Set(s.d.course.map((c) => c.category))];
  const shown = s.d.course.filter((c) => c.category === cat);
  return (
    <section className="wrap">
      <h1>Course Catalog</h1>
      <p className="muted">Pick a category to see its courses.</p>
      <div className="grid3">
        {cats.map((c) => (
          <button key={c} className={`card cat ${cat === c ? 'sel' : ''}`} onClick={() => setCat(c)}>
            <h3>{c}</h3><p className="muted">{s.d.course.filter((x) => x.category === c).length} course(s)</p>
          </button>
        ))}
      </div>
      {cats.length === 0 && <p className="muted">No courses published yet.</p>}
      {cat && (<><h2>{cat}</h2>
        <div className="grid3">{shown.map((c) => (
          <Card key={c.course_id} title={c.course_Name}>
            <p>{c.description || 'No description available.'}</p>
            <p className="muted">{c.no_of_modules ?? '—'} modules · {c.no_of_weeks ?? '—'} weeks</p>
            <p><b>{money(c.price)}</b></p>
            {c.material && <p className="muted">Material: {c.material}</p>}
          </Card>))}</div></>)}
    </section>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={`/${user.role}`} replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { const r = await login(role, email.trim(), pw); nav(`/${r}`); }
    catch (x) { setErr({ t: 'err', text: x.message }); }
    setBusy(false);
  };
  return (
    <section className="wrap narrow">
      <Card title="Login">
        <div className="tabs">{['student', 'teacher', 'assistant', 'admin'].map((r) => <button type="button" key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>{r}</button>)}</div>
        <form onSubmit={submit} className="stack">
          <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Password"><input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          <Msg m={err} />
          <button className="btn" disabled={busy}>{busy ? 'Signing in…' : `Login as ${role}`}</button>
        </form>
        <p className="muted small">Sign-up is not available. Accounts are created by an institute assistant.</p>
      </Card>
    </section>
  );
}
