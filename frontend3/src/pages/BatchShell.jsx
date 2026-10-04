import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';
import { useData, gate, useAct, useForm, Page, Card, Field, Table, Msg, Progress, Badge } from '../ui';
import { byId, fullName, hhmm, money, nextId, payable, today, blank } from '../util';

// One shell for student / teacher / assistant / admin: everything is scoped to ONE batch.
export function BatchShell({ role }) {
  const { batchId } = useParams();
  const bid = Number(batchId);
  const { user } = useAuth();
  const s = useData(['batch', 'course', 'teacher', 'enrollment', 'schedule', ...(role === 'student' ? [] : ['student'])]);
  const g = gate(s); if (g) return g;
  const { d } = s;
  const b = d.batch.find((x) => x.batch_id === bid);
  const deny = (t) => <Page title="Not available"><Msg m={{ t: 'err', text: t }} /><Link to={`/${role}/batches`}>← Back to batches</Link></Page>;
  if (!b) return deny('Batch not found.');
  const enrolls = d.enrollment.filter((e) => e.batch_id === bid);
  const me = enrolls.find((e) => e.student_id === user.id);
  if (role === 'student' && !me) return deny('You are not enrolled in this batch.');
  if (role === 'teacher' && b.teacher_id !== user.id) return deny('This batch is not assigned to you.');

  const course = byId(d.course, 'course_id', b.course_id);
  const ctx = {
    b, bid, course, role, uid: user.id, me, enrolls, canEdit: role !== 'student', reload: s.reload,
    teacher: byId(d.teacher, 'teacher_id', b.teacher_id),
    days: d.schedule.filter((x) => x.batch_id === bid).map((x) => x.day),
    students: enrolls.map((e) => ({ e, s: byId(d.student || [], 'student_id', e.student_id) })).filter((x) => x.s),
  };
  const tabs = role === 'student'
    ? [['overview', 'Overview'], ['modules', 'Modules'], ['tests', 'Tests'], ['attendance', 'Attendance'], ['fees', 'Fee Status'], ['certificate', 'Certificate'], ['notifications', 'Notifications']]
    : [['overview', 'Overview'], ['modules', 'Modules'], ['students', 'Students'], ['tests', 'Tests'], ['attendance', 'Attendance'], ['notifications', 'Notifications']];

  return (
    <Page title={course?.course_Name || 'Batch'} sub={`Batch started ${b.start_date || 'TBD'} · ${hhmm(b.start_time)} – ${hhmm(b.end_time)} · ${b.venue || 'Venue TBD'}`}
      actions={<Link className="btn ghost" to={`/${role}/batches`}>← All batches</Link>}>
      <div className="subnav">
        {tabs.map(([k, l]) => (
          <NavLink key={k} to={`/${role}/batches/${bid}/${k}`}>{l}{k === 'notifications' && role === 'student' && me.batch_Notification_Status !== true && <em className="dot">•</em>}</NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview ctx={ctx} />} />
        <Route path="modules" element={<Modules ctx={ctx} />} />
        <Route path="students" element={<StudentsTab ctx={ctx} />} />
        <Route path="tests" element={<Tests ctx={ctx} />} />
        <Route path="attendance" element={ctx.canEdit ? <AttendanceMark ctx={ctx} /> : <MyAttendance ctx={ctx} />} />
        <Route path="fees" element={<MyFees ctx={ctx} />} />
        <Route path="certificate" element={<Certificate ctx={ctx} />} />
        <Route path="notifications" element={<BatchNotifications ctx={ctx} />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </Page>
  );
}

/* ---------- Overview ---------- */
function Overview({ ctx }) {
  const { b, course, teacher, days, canEdit, reload } = ctx;
  const [n, setN] = useState(b.modules_Completed ?? 0);
  const [m, run] = useAct();
  const total = course?.no_of_modules || 0;
  return (
    <div className="grid2">
      <Card title="Batch details">
        <dl className="dl">
          <div><dt>Course</dt><dd>{course?.course_Name}</dd></div>
          <div><dt>Category</dt><dd>{course?.category}</dd></div>
          <div><dt>Teacher</dt><dd>{teacher ? fullName(teacher) : 'Not assigned yet'}</dd></div>
          <div><dt>Timing</dt><dd>{hhmm(b.start_time)} – {hhmm(b.end_time)}</dd></div>
          <div><dt>Days</dt><dd>{days.length ? days.join(', ') : '—'}</dd></div>
          <div><dt>Venue</dt><dd>{b.venue || '—'}</dd></div>
          <div><dt>Duration</dt><dd>{course?.no_of_weeks ?? '—'} weeks</dd></div>
        </dl>
        {course?.description && <p className="muted">{course.description}</p>}
      </Card>
      <Card title="Progress">
        <Progress done={b.modules_Completed || 0} total={total} />
        {canEdit && (
          <form className="row" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.update('batch', b.batch_id, { ...b, modules_Completed: Number(n) }); await reload(); }, 'Progress updated'); }}>
            <Field label="Modules completed"><input type="number" min="0" max={total || undefined} value={n} onChange={(e) => setN(e.target.value)} /></Field>
            <button className="btn">Update</button>
          </form>)}
        <Msg m={m} />
      </Card>
    </div>
  );
}

/* ---------- Modules ---------- */
function Modules({ ctx }) {
  const s = useData(['courseModule']);
  const g = gate(s); if (g) return g;
  const mods = s.d.courseModule.filter((x) => x.course_id === ctx.b.course_id).sort((a, b) => a.module_id - b.module_id);
  return (
    <Card title="Course modules">
      <Table rows={mods} empty="No modules have been added to this course yet." cols={[
        ['#', (r) => r.module_id], ['Module', (r) => r.module_title], ['Details', (r) => r.module_description],
        ['Status', (r, i) => (i < (ctx.b.modules_Completed || 0) ? <Badge t="ok">Completed</Badge> : <Badge>Pending</Badge>)],
      ]} />
    </Card>
  );
}

/* ---------- Students (teacher / staff) ---------- */
const StudentsTab = ({ ctx }) => (
  <Card title={`Enrolled students (${ctx.students.length})`}>
    <Table rows={ctx.students} empty="No students enrolled yet." cols={[
      ['Name', ({ s }) => fullName(s)], ['Email', ({ s }) => s.email], ['Enrolled on', ({ e }) => e.enrollment_date],
      ['Discount', ({ e }) => `${e.discount ?? 0}%`], ['Certificate', ({ e }) => e.certificate || '—'],
    ]} />
  </Card>
);

/* ---------- Tests ---------- */
function Tests({ ctx }) {
  const { bid, canEdit, uid } = ctx;
  const s = useData(['test', 'takes']);
  const [f, , bind, reset] = useForm({ title: '', date: today(), q: '', a: '' });
  const [m, run] = useAct();
  const [open, setOpen] = useState(null);
  const g = gate(s); if (g) return g;
  const tests = s.d.test.filter((t) => t.batch_id === bid).sort((a, b) => a.test_id - b.test_id);
  const add = (e) => { e.preventDefault(); run(async () => {
    await api.create('test', { test_id: nextId(s.d.test, 'test_id', (t) => t.batch_id === bid), batch_id: bid, test_title: f.title, date: blank(f.date), question_paper_Link: blank(f.q), answerkey_Link: blank(f.a) });
    reset(); await s.reload();
  }, 'Test created'); };
  const score = (tid) => s.d.takes.find((t) => t.student_id === uid && t.batch_id === bid && t.test_id === tid)?.score;
  const link = (u) => (u ? <a href={u} target="_blank" rel="noreferrer">Open</a> : '—');
  return (
    <>
      {canEdit && (
        <Card title="Create a test">
          <form className="stack" onSubmit={add}>
            <div className="grid2">
              <Field label="Title"><input required {...bind('title')} /></Field>
              <Field label="Date"><input type="date" {...bind('date')} /></Field>
              <Field label="Question paper link"><input type="url" placeholder="https://" {...bind('q')} /></Field>
              <Field label="Answer key link"><input type="url" placeholder="https://" {...bind('a')} /></Field>
            </div>
            <Msg m={m} /><button className="btn">Create test</button>
          </form>
        </Card>)}
      <Card title="Tests">
        <Table rows={tests} empty="No tests scheduled for this batch." cols={[
          ['Title', (t) => t.test_title], ['Date', (t) => t.date || '—'], ['Question paper', (t) => link(t.question_paper_Link)], ['Answer key', (t) => link(t.answerkey_Link)],
          canEdit ? ['Scores', (t) => <button className="btn small" onClick={() => setOpen(open === t.test_id ? null : t.test_id)}>{open === t.test_id ? 'Close' : 'Enter / view'}</button>]
                  : ['My score', (t) => (score(t.test_id) ?? <span className="muted">Not graded</span>)],
        ]} />
      </Card>
      {canEdit && open && <ScoreSheet ctx={ctx} test={tests.find((t) => t.test_id === open)} takes={s.d.takes} reload={s.reload} />}
    </>
  );
}

function ScoreSheet({ ctx, test, takes, reload }) {
  const init = () => Object.fromEntries(ctx.students.map(({ e }) => [e.student_id, takes.find((t) => t.student_id === e.student_id && t.batch_id === ctx.bid && t.test_id === test.test_id)?.score ?? '']));
  const [sc, setSc] = useState(init);
  const [m, run] = useAct();
  useEffect(() => setSc(init()), [test.test_id]); // eslint-disable-line
  const save = () => run(async () => {
    await Promise.all(ctx.students.filter(({ e }) => sc[e.student_id] !== '').map(({ e }) =>
      api.create('takes', { student_id: e.student_id, batch_id: ctx.bid, test_id: test.test_id, score: Number(sc[e.student_id]) })));
    await reload();
  }, 'Scores saved');
  return (
    <Card title={`Scores — ${test.test_title}`}>
      <Table rows={ctx.students} empty="No students enrolled." cols={[
        ['Student', ({ s }) => fullName(s)],
        ['Score', ({ e }) => <input className="narrow-in" type="number" step="0.01" value={sc[e.student_id] ?? ''} onChange={(ev) => setSc({ ...sc, [e.student_id]: ev.target.value })} />],
      ]} />
      <Msg m={m} />{ctx.students.length > 0 && <button className="btn" onClick={save}>Save scores</button>}
    </Card>
  );
}

/* ---------- Attendance ---------- */
function MyAttendance({ ctx }) {
  const s = useData(['studentAttendance']);
  const g = gate(s); if (g) return g;
  const rows = s.d.studentAttendance.filter((a) => a.student_id === ctx.uid && a.batch_id === ctx.bid).sort((a, b) => b.date.localeCompare(a.date));
  const present = rows.filter((r) => r.status === 1).length;
  return (
    <Card title="My attendance">
      <p><b>{present}</b> present out of <b>{rows.length}</b> classes {rows.length > 0 && <Badge t={present / rows.length >= 0.75 ? 'ok' : 'warn'}>{Math.round((present / rows.length) * 100)}%</Badge>}</p>
      <Table rows={rows} empty="No attendance has been marked yet." cols={[['Date', (r) => r.date], ['Status', (r) => (r.status === 1 ? <Badge t="ok">Present</Badge> : <Badge t="warn">Absent</Badge>)]]} />
    </Card>
  );
}

export function AttendanceMark({ ctx }) {
  const s = useData(['studentAttendance']);
  const [date, setDate] = useState(today());
  const [st, setSt] = useState({});
  const [m, run] = useAct();
  const all = s.d.studentAttendance;
  useEffect(() => {
    if (s.loading) return;
    const o = {};
    ctx.students.forEach(({ e }) => { const r = all.find((a) => a.date === date && a.student_id === e.student_id && a.batch_id === ctx.bid); o[e.student_id] = r ? r.status : 1; });
    setSt(o);
    // eslint-disable-next-line
  }, [s.loading, date, all?.length, ctx.students.length]);
  const g = gate(s); if (g) return g;
  const save = () => run(async () => {
    await Promise.all(ctx.students.map(({ e }) => api.create('studentAttendance', { date, student_id: e.student_id, batch_id: ctx.bid, status: st[e.student_id] ?? 1 })));
    await s.reload();
  }, `Attendance saved for ${date}`);
  const hist = {};
  all.filter((a) => a.batch_id === ctx.bid).forEach((a) => { hist[a.date] = hist[a.date] || { p: 0, t: 0 }; hist[a.date].t++; if (a.status === 1) hist[a.date].p++; });
  return (
    <>
      <Card title="Mark attendance">
        <Field label="Date"><input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} /></Field>
        <Table rows={ctx.students} empty="No students enrolled in this batch." cols={[
          ['Student', ({ s }) => fullName(s)],
          ['Status', ({ e }) => (
            <div className="seg">
              <button className={st[e.student_id] === 1 ? 'on ok' : ''} onClick={() => setSt({ ...st, [e.student_id]: 1 })}>Present</button>
              <button className={st[e.student_id] === 0 ? 'on bad' : ''} onClick={() => setSt({ ...st, [e.student_id]: 0 })}>Absent</button>
            </div>)],
        ]} />
        <Msg m={m} />{ctx.students.length > 0 && <button className="btn" onClick={save}>Save attendance</button>}
      </Card>
      <Card title="History">
        <Table rows={Object.entries(hist).sort((a, b) => b[0].localeCompare(a[0]))} empty="Nothing marked yet." cols={[['Date', ([d]) => d], ['Present', ([, v]) => `${v.p} / ${v.t}`]]} />
      </Card>
    </>
  );
}

/* ---------- Fees (student) ---------- */
function MyFees({ ctx }) {
  const s = useData(['feePayment', 'feeDetails']);
  const g = gate(s); if (g) return g;
  const pays = s.d.feePayment.filter((p) => p.student_id === ctx.uid && p.batch_id === ctx.bid).sort((a, b) => b.receipt_id - a.receipt_id);
  const due = payable(ctx.course, ctx.me);
  const paid = pays.reduce((t, p) => t + Number(p.amount || 0), 0);
  const left = Math.max(0, due - paid);
  return (
    <>
      <Card title="Fee status">
        <div className="stats">
          <div><small>Course fee</small><b>{money(ctx.course?.price)}</b></div>
          <div><small>Discount</small><b>{ctx.me.discount ?? 0}%</b></div>
          <div><small>Payable</small><b>{money(due)}</b></div>
          <div><small>Paid</small><b>{money(paid)}</b></div>
          <div><small>Remaining</small><b>{money(left)}</b></div>
        </div>
        <Badge t={left <= 0.001 ? 'ok' : 'warn'}>{left <= 0.001 ? 'Fully paid' : 'Payment pending'}</Badge>
      </Card>
      <Card title="Payments">
        <Table rows={pays} empty="No payments recorded yet." cols={[
          ['Reference no.', (p) => <b>#{p.receipt_id}</b>], ['Date', (p) => `${p.payment_date} ${String(p.payment_time).slice(0, 5)}`], ['Amount', (p) => money(p.amount)], ['Mode', (p) => p.mode_of_payment],
          ['Note', (p) => s.d.feeDetails.filter((x) => x.receipt_id === p.receipt_id).map((x) => x.description).join('; ') || '—'],
        ]} />
      </Card>
    </>
  );
}

/* ---------- Certificate + feedback (student) ---------- */
function Certificate({ ctx }) {
  const [fb, setFb] = useState(ctx.me.feedback || '');
  const [m, run] = useAct();
  const cert = ctx.me.certificate;
  return (
    <div className="grid2">
      <Card title="Certificate">
        {cert ? <p>🏆 Certificate issued: {/^https?:/.test(cert) ? <a href={cert} target="_blank" rel="noreferrer">View certificate</a> : <b>{cert}</b>}</p>
              : <p className="muted">Your certificate has not been issued yet. It is added by the institute after course completion.</p>}
      </Card>
      <Card title="Your feedback">
        <textarea rows="4" value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Share your experience with this batch" />
        <Msg m={m} /><button className="btn" onClick={() => run(async () => { await api.update('enrollment', [ctx.me.student_id, ctx.bid], { ...ctx.me, feedback: fb }); await ctx.reload(); }, 'Feedback saved')}>Save feedback</button>
      </Card>
    </div>
  );
}

/* ---------- Batch notifications ---------- */
function BatchNotifications({ ctx }) {
  const { bid, canEdit, me, enrolls } = ctx;
  const s = useData(['batchNotification']);
  const [f, , bind, reset] = useForm({ title: '', desc: '' });
  const [m, run] = useAct();
  const list = s.d.batchNotification;
  const mine = list ? list.filter((n) => n.batch_id === bid) : [];

  // null/false = nothing seen yet; mark as seen when a student opens the tab
  useEffect(() => {
    if (ctx.role === 'student' && mine.length && me.batch_Notification_Status !== true) {
      api.update('enrollment', [me.student_id, bid], { ...me, batch_Notification_Status: true }).then(ctx.reload).catch(() => {});
    }
    // eslint-disable-next-line
  }, [mine.length]);

  const g = gate(s); if (g) return g;
  const add = (e) => { e.preventDefault(); run(async () => {
    await api.create('batchNotification', { notification_id: nextId(list, 'notification_id', (n) => n.batch_id === bid), batch_id: bid, title: f.title, description: f.desc });
    // flag every enrolled student as having an unseen notification
    await Promise.all(enrolls.map((en) => api.update('enrollment', [en.student_id, bid], { ...en, batch_Notification_Status: false })));
    reset(); await s.reload(); await ctx.reload();
  }, 'Notification posted'); };
  const rows = [...mine].sort((a, b) => b.notification_id - a.notification_id);
  return (
    <>
      {canEdit && (
        <Card title="Post a batch notification">
          <p className="muted small">Notifications cannot be deleted once posted.</p>
          <form className="stack" onSubmit={add}>
            <Field label="Title"><input required {...bind('title')} /></Field>
            <Field label="Description"><textarea rows="3" {...bind('desc')} /></Field>
            <Msg m={m} /><button className="btn">Post</button>
          </form>
        </Card>)}
      {rows.length === 0 && <p className="muted">No notifications for this batch yet.</p>}
      {rows.map((n) => <Card key={n.notification_id} className="notice"><h3>{n.title}</h3><p>{n.description || ''}</p></Card>)}
    </>
  );
}
