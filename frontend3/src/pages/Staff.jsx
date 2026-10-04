import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { api, authApi } from '../api';
import { useData, gate, useAct, useForm, Page, Card, Field, Table, Msg, Select, Tabs, Badge } from '../ui';
import { AttendanceMark } from './BatchShell';
import { batchLabel, blank, byId, DAYS, fullName, hhmm, money, MONTHS, nextId, nowTime, payable, toTime, today } from '../util';

const people = (list, idk) => list.map((p) => ({ v: p[idk], l: `${fullName(p)} (${p.email})` }));
const rnd = () => Math.random().toString(36).slice(2, 10);

/* ================= USERS ================= */
export function Users() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [role, setRole] = useState('student');
  const s = useData(['student', 'teacher', 'assistant']);
  const [f, , bind, reset] = useForm({ first_name: '', last_name: '', email: '', sex: '', dob: '', aadhar_id: '', pincode: '', credential: rnd(), salary: '' });
  const [m, run] = useAct();
  const [created, setCreated] = useState(null);
  const [q, setQ] = useState('');
  const g = gate(s); if (g) return g;
  const list = s.d[role].filter((p) => `${fullName(p)} ${p.email}`.toLowerCase().includes(q.toLowerCase()));

  const add = (e) => { e.preventDefault(); run(async () => {
    const r = await authApi.signup({ role, first_name: f.first_name, last_name: f.last_name, email: f.email, credential: f.credential, sex: f.sex, dob: f.dob, aadhar_id: f.aadhar_id, pincode: f.pincode });
    if (f.salary && role !== 'student') { const ent = await api.get(role, r.id); await api.update(role, r.id, { ...ent, salary: Number(f.salary) }); }
    setCreated({ email: f.email, pw: f.credential, role });
    reset(); await s.reload();
  }, `${role} registered`); };
  const del = (p) => { if (window.confirm(`Delete ${fullName(p)}'s account permanently?`)) run(async () => { await api.remove(role, p[`${role}_id`]); await s.reload(); }, 'Account deleted'); };

  return (
    <Page title={isAdmin ? 'Users & Accounts' : 'Register & Manage Users'} sub="Only staff can create accounts. Students and teachers cannot sign up themselves.">
      <Tabs tabs={[['student', 'Students'], ['teacher', 'Teachers'], ['assistant', 'Assistants']]} value={role} onChange={(r) => { setRole(r); setCreated(null); }} />
      <Card title={`Register new ${role}`}>
        <form className="stack" onSubmit={add}>
          <div className="grid3">
            <Field label="First name *"><input required {...bind('first_name')} /></Field>
            <Field label="Last name"><input {...bind('last_name')} /></Field>
            <Field label="Email *"><input type="email" required {...bind('email')} /></Field>
            <Field label="Sex"><Select placeholder="—" options={['Male', 'Female', 'Other'].map((x) => ({ v: x, l: x }))} {...bind('sex')} /></Field>
            <Field label="Date of birth"><input type="date" {...bind('dob')} /></Field>
            <Field label="Aadhar no."><input {...bind('aadhar_id')} /></Field>
            <Field label="Pincode (must exist)"><input {...bind('pincode')} /></Field>
            <Field label="Initial password *"><input required {...bind('credential')} /></Field>
            {role !== 'student' && <Field label="Monthly salary"><input type="number" min="0" {...bind('salary')} /></Field>}
          </div>
          <Msg m={m} />
          {created && <div className="msg ok">Created. Login: <b>{created.email}</b> / password <b>{created.pw}</b> ({created.role}). Please share these credentials with the user.</div>}
          <button className="btn">Register {role}</button>
        </form>
      </Card>
      <Card title={`All ${role}s (${s.d[role].length})`}>
        <input className="search" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Table rows={list} cols={[
          ['Name', fullName], ['Email', (p) => p.email], ['Sex', (p) => p.sex || '—'], ['DOB', (p) => p.dob || '—'], ['Aadhar', (p) => p.aadhar_id || '—'],
          ...(role !== 'student' ? [['Salary', (p) => (p.salary != null ? money(p.salary) : '—')]] : []),
          ...(isAdmin ? [['', (p) => <button className="btn danger small" onClick={() => del(p)}>Delete</button>]] : []),
        ]} />
      </Card>
    </Page>
  );
}

/* ================= COURSES ================= */
export function Courses() {
  const s = useData(['course', 'courseModule']);
  const empty = { course_Name: '', category: '', description: '', price: '', no_of_modules: '', no_of_weeks: '', material: '' };
  const [f, setF, bind, reset] = useForm(empty);
  const [editing, setEditing] = useState(null);
  const [sel, setSel] = useState(null);
  const [mf, , mbind, mreset] = useForm({ title: '', desc: '' });
  const [q, setQ] = useState('');
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const courses = s.d.course.filter((c) => `${c.course_Name} ${c.category}`.toLowerCase().includes(q.toLowerCase()));
  const cats = [...new Set(s.d.course.map((c) => c.category))];
  const body = () => ({ course_Name: f.course_Name, category: f.category, description: blank(f.description), price: f.price === '' ? null : Number(f.price),
    no_of_modules: f.no_of_modules === '' ? null : Number(f.no_of_modules), no_of_weeks: f.no_of_weeks === '' ? null : Number(f.no_of_weeks), material: blank(f.material) });
  const save = (e) => { e.preventDefault(); run(async () => {
    if (editing) await api.update('course', editing, { course_id: editing, ...body() });
    else await api.create('course', { course_id: nextId(s.d.course, 'course_id'), ...body() });
    reset(); setEditing(null); await s.reload();
  }, editing ? 'Course updated' : 'Course created'); };
  const edit = (c) => { setEditing(c.course_id); setF({ course_Name: c.course_Name, category: c.category, description: c.description || '', price: c.price ?? '', no_of_modules: c.no_of_modules ?? '', no_of_weeks: c.no_of_weeks ?? '', material: c.material || '' }); window.scrollTo(0, 0); };
  const del = (c) => { if (window.confirm(`Delete course "${c.course_Name}"? Its batches will be deleted too.`)) run(async () => { await api.remove('course', c.course_id); await s.reload(); }, 'Course deleted'); };
  const mods = sel ? s.d.courseModule.filter((x) => x.course_id === sel).sort((a, b) => a.module_id - b.module_id) : [];
  const addMod = (e) => { e.preventDefault(); run(async () => {
    await api.create('courseModule', { module_id: nextId(s.d.courseModule, 'module_id', (x) => x.course_id === sel), course_id: sel, module_title: mf.title, module_description: blank(mf.desc) });
    mreset(); await s.reload();
  }, 'Module added'); };
  return (
    <Page title="Courses" sub="Create, update and search courses. Courses are grouped by category in the public catalog.">
      <Card title={editing ? 'Update course' : 'Create course'}>
        <form className="stack" onSubmit={save}>
          <div className="grid3">
            <Field label="Course name *"><input required {...bind('course_Name')} /></Field>
            <Field label="Category *"><input required list="cats" {...bind('category')} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field>
            <Field label="Price (₹)"><input type="number" min="0" step="0.01" {...bind('price')} /></Field>
            <Field label="No. of modules"><input type="number" min="0" {...bind('no_of_modules')} /></Field>
            <Field label="No. of weeks"><input type="number" min="0" {...bind('no_of_weeks')} /></Field>
            <Field label="Material"><input {...bind('material')} /></Field>
          </div>
          <Field label="Description"><textarea rows="2" {...bind('description')} /></Field>
          <Msg m={m} />
          <div className="row"><button className="btn">{editing ? 'Update course' : 'Create course'}</button>{editing && <button type="button" className="btn ghost" onClick={() => { reset(); setEditing(null); }}>Cancel</button>}</div>
        </form>
      </Card>
      <Card title="All courses">
        <input className="search" placeholder="Search by name or category…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Table rows={courses} cols={[
          ['Course', (c) => <b>{c.course_Name}</b>], ['Category', (c) => c.category], ['Price', (c) => money(c.price)], ['Modules', (c) => c.no_of_modules ?? '—'], ['Weeks', (c) => c.no_of_weeks ?? '—'],
          ['', (c) => <div className="row"><button className="btn small" onClick={() => setSel(c.course_id)}>Modules</button><button className="btn ghost small" onClick={() => edit(c)}>Edit</button><button className="btn danger small" onClick={() => del(c)}>Delete</button></div>],
        ]} />
      </Card>
      {sel && (
        <Card title={`Modules — ${byId(s.d.course, 'course_id', sel)?.course_Name}`}>
          <form className="row end" onSubmit={addMod}>
            <Field label="Module title"><input required {...mbind('title')} /></Field>
            <Field label="Description"><input {...mbind('desc')} /></Field>
            <button className="btn">Add module</button><button type="button" className="btn ghost" onClick={() => setSel(null)}>Close</button>
          </form>
          <Table rows={mods} empty="No modules yet." cols={[['#', (x) => x.module_id], ['Title', (x) => x.module_title], ['Description', (x) => x.module_description || '—'],
            ['', (x) => <button className="btn danger small" onClick={() => run(async () => { await api.remove('courseModule', [x.module_id, x.course_id]); await s.reload(); }, 'Module deleted')}>Delete</button>]]} />
        </Card>)}
    </Page>
  );
}

/* ================= BATCHES ================= */
export function Batches() {
  const { user } = useAuth();
  const s = useData(['batch', 'course', 'teacher', 'schedule', 'enrollment']);
  const [f, , bind, reset] = useForm({ course_id: '', teacher_id: '', start_date: today(), start_time: '09:00', end_time: '10:00', venue: '' });
  const [days, setDays] = useState([]);
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const { d } = s;
  const add = (e) => { e.preventDefault(); run(async () => {
    const id = nextId(d.batch, 'batch_id');
    await api.create('batch', { batch_id: id, course_id: Number(f.course_id), teacher_id: f.teacher_id ? Number(f.teacher_id) : null, start_date: blank(f.start_date), start_time: toTime(f.start_time), end_time: toTime(f.end_time), venue: blank(f.venue), modules_Completed: 0 });
    await Promise.all(days.map((day) => api.create('schedule', { day, batch_id: id })));
    reset(); setDays([]); await s.reload();
  }, 'Batch created'); };
  const setTeacher = (b, v) => run(async () => { await api.update('batch', b.batch_id, { ...b, teacher_id: v ? Number(v) : null }); await s.reload(); }, 'Teacher updated');
  const del = (b) => { if (window.confirm('Delete this batch with all its enrollments, tests and attendance?')) run(async () => { await api.remove('batch', b.batch_id); await s.reload(); }, 'Batch deleted'); };
  return (
    <Page title="Batches" sub="Create a batch from an existing course and assign an existing teacher — just pick from the lists.">
      <Card title="Create batch">
        <form className="stack" onSubmit={add}>
          <div className="grid3">
            <Field label="Course *"><Select required options={d.course.map((c) => ({ v: c.course_id, l: `${c.course_Name} (${c.category})` }))} {...bind('course_id')} /></Field>
            <Field label="Teacher"><Select placeholder="Assign later" options={people(d.teacher, 'teacher_id')} {...bind('teacher_id')} /></Field>
            <Field label="Start date"><input type="date" {...bind('start_date')} /></Field>
            <Field label="Start time"><input type="time" {...bind('start_time')} /></Field>
            <Field label="End time"><input type="time" {...bind('end_time')} /></Field>
            <Field label="Venue"><input placeholder="e.g. Room 101" {...bind('venue')} /></Field>
          </div>
          <div className="chips">{DAYS.map((x) => <label key={x} className={days.includes(x) ? 'chip on' : 'chip'}><input type="checkbox" checked={days.includes(x)} onChange={() => setDays(days.includes(x) ? days.filter((y) => y !== x) : [...days, x])} />{x.slice(0, 3)}</label>)}</div>
          <Msg m={m} /><button className="btn">Create batch</button>
        </form>
      </Card>
      <Card title="All batches">
        <Table rows={[...d.batch].sort((a, b) => b.batch_id - a.batch_id)} cols={[
          ['Course', (b) => <b>{byId(d.course, 'course_id', b.course_id)?.course_Name}</b>],
          ['Teacher', (b) => <select value={b.teacher_id ?? ''} onChange={(e) => setTeacher(b, e.target.value)}><option value="">— none —</option>{d.teacher.map((t) => <option key={t.teacher_id} value={t.teacher_id}>{fullName(t)}</option>)}</select>],
          ['Starts', (b) => b.start_date || '—'], ['Time', (b) => `${hhmm(b.start_time)}–${hhmm(b.end_time)}`], ['Days', (b) => d.schedule.filter((x) => x.batch_id === b.batch_id).map((x) => x.day.slice(0, 3)).join(', ') || '—'],
          ['Venue', (b) => b.venue || '—'], ['Students', (b) => d.enrollment.filter((e) => e.batch_id === b.batch_id).length],
          ['', (b) => <div className="row"><Link className="btn small" to={`/${user.role}/batches/${b.batch_id}`}>Open</Link><button className="btn danger small" onClick={() => del(b)}>Delete</button></div>],
        ]} />
      </Card>
    </Page>
  );
}

/* ================= ENROLLMENTS / CERTIFICATES ================= */
export function Enrollments({ mode }) {
  const s = useData(['enrollment', 'student', 'batch', 'course']);
  const [f, , bind, reset] = useForm({ student_id: '', batch_id: '', discount: '0' });
  const [certs, setCerts] = useState({});
  const [q, setQ] = useState('');
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const { d } = s;
  const bl = (id) => { const b = byId(d.batch, 'batch_id', id); return b ? batchLabel(b, d.course) : `Batch #${id}`; };
  const rows = d.enrollment.filter((e) => `${fullName(byId(d.student, 'student_id', e.student_id))} ${bl(e.batch_id)}`.toLowerCase().includes(q.toLowerCase()));
  const add = (e) => { e.preventDefault();
    if (d.enrollment.some((x) => x.student_id === Number(f.student_id) && x.batch_id === Number(f.batch_id))) return run(async () => { throw new Error('This student is already enrolled in that batch.'); });
    run(async () => {
      await api.create('enrollment', { student_id: Number(f.student_id), batch_id: Number(f.batch_id), batch_Notification_Status: null, enrollment_date: today(), feedback: null, certificate: null, discount: Number(f.discount || 0) });
      reset(); await s.reload();
    }, 'Student enrolled'); };
  const saveCert = (en) => run(async () => { await api.update('enrollment', [en.student_id, en.batch_id], { ...en, certificate: blank(certs[`${en.student_id}-${en.batch_id}`] ?? en.certificate) }); await s.reload(); }, 'Certificate saved');
  const unenroll = (en) => { if (window.confirm('Remove this enrollment?')) run(async () => { await api.remove('enrollment', [en.student_id, en.batch_id]); await s.reload(); }, 'Enrollment removed'); };
  const common = [['Student', (e) => fullName(byId(d.student, 'student_id', e.student_id))], ['Batch', (e) => bl(e.batch_id)]];
  return (
    <Page title={mode === 'enroll' ? 'Enrollments' : 'Certificates'} sub={mode === 'enroll' ? 'Enroll an existing student into an existing batch.' : 'Add certification details for completed enrollments (a certificate link or number).'}>
      {mode === 'enroll' && (
        <Card title="New enrollment">
          <form className="stack" onSubmit={add}>
            <div className="grid3">
              <Field label="Student *"><Select required options={people(d.student, 'student_id')} {...bind('student_id')} /></Field>
              <Field label="Batch *"><Select required options={d.batch.map((b) => ({ v: b.batch_id, l: batchLabel(b, d.course) }))} {...bind('batch_id')} /></Field>
              <Field label="Discount (%)"><input type="number" min="0" max="100" step="0.01" {...bind('discount')} /></Field>
            </div>
            <button className="btn">Enroll student</button>
          </form>
        </Card>)}
      <Msg m={m} />
      <Card title={mode === 'enroll' ? 'All enrollments' : 'Enrollment certificates'}>
        <input className="search" placeholder="Search by student or course…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Table rows={rows} cols={mode === 'enroll'
          ? [...common, ['Enrolled on', (e) => e.enrollment_date], ['Discount', (e) => `${e.discount ?? 0}%`], ['', (e) => <button className="btn danger small" onClick={() => unenroll(e)}>Remove</button>]]
          : [...common, ['Certificate', (e) => <input value={certs[`${e.student_id}-${e.batch_id}`] ?? e.certificate ?? ''} placeholder="Link or number" onChange={(ev) => setCerts({ ...certs, [`${e.student_id}-${e.batch_id}`]: ev.target.value })} />], ['', (e) => <button className="btn small" onClick={() => saveCert(e)}>Save</button>]]} />
      </Card>
    </Page>
  );
}

/* ================= FEES ================= */
export function Fees() {
  const s = useData(['feePayment', 'feeDetails', 'student', 'enrollment', 'batch', 'course']);
  const [f, , bind, reset] = useForm({ student_id: '', batch_id: '', amount: '', mode: 'Cash', desc: '' });
  const [q, setQ] = useState('');
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const { d } = s;
  const sid = Number(f.student_id);
  const enr = d.enrollment.filter((e) => e.student_id === sid);
  const cur = enr.find((e) => e.batch_id === Number(f.batch_id));
  const curBatch = cur && byId(d.batch, 'batch_id', cur.batch_id);
  const due = cur ? payable(byId(d.course, 'course_id', curBatch?.course_id), cur) : 0;
  const paid = cur ? d.feePayment.filter((p) => p.student_id === sid && p.batch_id === cur.batch_id).reduce((t, p) => t + Number(p.amount), 0) : 0;
  const add = (e) => { e.preventDefault(); run(async () => {
    const rid = nextId(d.feePayment, 'receipt_id');
    await api.create('feePayment', { receipt_id: rid, student_id: sid, batch_id: Number(f.batch_id), amount: Number(f.amount), payment_date: today(), payment_time: nowTime(), mode_of_payment: f.mode });
    if (f.desc.trim()) await api.create('feeDetails', { receipt_id: rid, description: f.desc.trim() });
    reset(); await s.reload();
  }, 'Fee entry recorded'); };
  const rows = [...d.feePayment].sort((a, b) => b.receipt_id - a.receipt_id).filter((p) => fullName(byId(d.student, 'student_id', p.student_id)).toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title="Fees" sub="Fees are collected physically — add an entry here. The receipt number becomes the student's reference number.">
      <Card title="Record a fee payment">
        <form className="stack" onSubmit={add}>
          <div className="grid3">
            <Field label="Student *"><Select required options={people(d.student, 'student_id')} value={f.student_id} onChange={bind('student_id').onChange} /></Field>
            <Field label="Batch *"><Select required options={enr.map((e) => ({ v: e.batch_id, l: batchLabel(byId(d.batch, 'batch_id', e.batch_id) || { course_id: 0 }, d.course) }))} {...bind('batch_id')} /></Field>
            <Field label="Amount (₹) *"><input type="number" min="1" step="0.01" required {...bind('amount')} /></Field>
            <Field label="Mode *"><Select options={['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'].map((x) => ({ v: x, l: x }))} {...bind('mode')} /></Field>
            <Field label="Note (optional)"><input {...bind('desc')} placeholder="e.g. 1st installment" /></Field>
          </div>
          {cur && <p className="muted">Payable {money(due)} · Paid {money(paid)} · <b>Remaining {money(Math.max(0, due - paid))}</b></p>}
          <Msg m={m} /><button className="btn">Add fee entry</button>
        </form>
      </Card>
      <Card title="Fee entries">
        <input className="search" placeholder="Search by student…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Table rows={rows} cols={[
          ['Reference', (p) => <b>#{p.receipt_id}</b>], ['Student', (p) => fullName(byId(d.student, 'student_id', p.student_id))],
          ['Batch', (p) => { const b = byId(d.batch, 'batch_id', p.batch_id); return b ? batchLabel(b, d.course) : p.batch_id; }],
          ['Amount', (p) => money(p.amount)], ['Mode', (p) => p.mode_of_payment], ['Date', (p) => p.payment_date],
          ['Note', (p) => d.feeDetails.filter((x) => x.receipt_id === p.receipt_id).map((x) => x.description).join('; ') || '—'],
        ]} />
      </Card>
    </Page>
  );
}

/* ================= SALARIES (teacher + assistant) ================= */
export function Salaries() {
  const [role, setRole] = useState('teacher');
  return (
    <Page title="Salaries" sub="Salaries are paid physically — add an entry here. The receipt number is the reference shown to the teacher.">
      <Tabs tabs={[['teacher', 'Teachers'], ['assistant', 'Assistants']]} value={role} onChange={setRole} />
      <SalaryPanel key={role} role={role} />
    </Page>
  );
}
function SalaryPanel({ role }) {
  const rec = role === 'teacher' ? 'teacherSalary' : 'assistantSalary';
  const det = role === 'teacher' ? 'teacherSalaryDetails' : 'assistantSalaryDetails';
  const idk = `${role}_id`;
  const s = useData([rec, det, role]);
  const now = new Date();
  const [f, setF, bind, reset] = useForm({ pid: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()), amount: '', desc: '' });
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const { d } = s;
  const pick = (e) => { const p = byId(d[role], idk, Number(e.target.value)); setF({ ...f, pid: e.target.value, amount: p?.salary ?? '' }); };
  const add = (e) => { e.preventDefault(); run(async () => {
    if (d[rec].some((r) => r[idk] === Number(f.pid) && r.month === Number(f.month) && r.year === Number(f.year))) throw new Error('A salary entry already exists for this person and month.');
    const rid = nextId(d[rec], 'receipt_id');
    await api.create(rec, { receipt_id: rid, [idk]: Number(f.pid), amount: Number(f.amount), salary_payment_date: today(), month: Number(f.month), year: Number(f.year) });
    if (f.desc.trim()) await api.create(det, { receipt_id: rid, description: f.desc.trim() });
    reset(); await s.reload();
  }, 'Salary entry recorded'); };
  return (
    <>
      <Card title={`Record ${role} salary`}>
        <form className="stack" onSubmit={add}>
          <div className="grid3">
            <Field label={`${role} *`}><Select required options={people(d[role], idk)} value={f.pid} onChange={pick} /></Field>
            <Field label="Month *"><Select options={MONTHS.map((x, i) => ({ v: i + 1, l: x }))} {...bind('month')} /></Field>
            <Field label="Year *"><input type="number" required {...bind('year')} /></Field>
            <Field label="Amount (₹) *"><input type="number" min="0" step="0.01" required {...bind('amount')} /></Field>
            <Field label="Note (optional)"><input {...bind('desc')} /></Field>
          </div>
          <Msg m={m} /><button className="btn">Add salary entry</button>
        </form>
      </Card>
      <Card title="Salary entries">
        <Table rows={[...d[rec]].sort((a, b) => b.receipt_id - a.receipt_id)} cols={[
          ['Reference', (r) => <b>#{r.receipt_id}</b>], [role, (r) => fullName(byId(d[role], idk, r[idk]))], ['Month', (r) => `${MONTHS[r.month - 1]} ${r.year}`], ['Amount', (r) => money(r.amount)], ['Paid on', (r) => r.salary_payment_date],
          ['Note', (r) => d[det].filter((x) => x.receipt_id === r.receipt_id).map((x) => x.description).join('; ') || '—'],
        ]} />
      </Card>
    </>
  );
}

/* ================= ATTENDANCE (students by batch / teachers / assistants) ================= */
export function Attendance() {
  const [tab, setTab] = useState('student');
  return (
    <Page title="Attendance" sub="Mark attendance for any student in any batch, and for teachers and assistants.">
      <Tabs tabs={[['student', 'Students'], ['teacher', 'Teachers'], ['assistant', 'Assistants']]} value={tab} onChange={setTab} />
      {tab === 'student' ? <StudentAttendanceStaff /> : <StaffAttendance key={tab} role={tab} />}
    </Page>
  );
}
function StudentAttendanceStaff() {
  const s = useData(['batch', 'course', 'enrollment', 'student']);
  const [bid, setBid] = useState('');
  const g = gate(s); if (g) return g;
  const { d } = s;
  const students = d.enrollment.filter((e) => e.batch_id === Number(bid)).map((e) => ({ e, s: byId(d.student, 'student_id', e.student_id) })).filter((x) => x.s);
  return (
    <>
      <Card><Field label="Select batch"><Select options={d.batch.map((b) => ({ v: b.batch_id, l: batchLabel(b, d.course) }))} value={bid} onChange={(e) => setBid(e.target.value)} /></Field></Card>
      {bid && <AttendanceMark key={bid} ctx={{ bid: Number(bid), students }} />}
    </>
  );
}

const STATES = [[1, 'Present', 'ok'], [0.5, 'Half day', 'half'], [0, 'Absent', 'bad']];
function StaffAttendance({ role }) {
  const res = role === 'teacher' ? 'teacherAttendance' : 'assistantAttendance';
  const idk = `${role}_id`;
  const s = useData([res, role]);
  const [date, setDate] = useState(today());
  const [st, setSt] = useState({});
  const [m, run] = useAct();
  useEffect(() => {
    if (s.loading) return;
    const o = {};
    s.d[role].forEach((p) => { const r = s.d[res].find((a) => a.date === date && a[idk] === p[idk]); o[p[idk]] = r ? Number(r.status) : 1; });
    setSt(o);
    // eslint-disable-next-line
  }, [s.loading, date, s.d[res]?.length]);
  const g = gate(s); if (g) return g;
  const save = () => run(async () => { await Promise.all(s.d[role].map((p) => api.create(res, { date, [idk]: p[idk], status: st[p[idk]] ?? 1 }))); await s.reload(); }, `Attendance saved for ${date}`);
  return (
    <Card title={`Mark ${role} attendance`}>
      <Field label="Date"><input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} /></Field>
      <Table rows={s.d[role]} empty={`No ${role}s found.`} cols={[
        ['Name', fullName],
        ['Status', (p) => <div className="seg">{STATES.map(([v, l, c]) => <button key={v} className={st[p[idk]] === v ? `on ${c}` : ''} onClick={() => setSt({ ...st, [p[idk]]: v })}>{l}</button>)}</div>],
      ]} />
      <Msg m={m} />{s.d[role].length > 0 && <button className="btn" onClick={save}>Save attendance</button>}
    </Card>
  );
}

/* ================= ASSISTANT: OWN SALARY + ATTENDANCE ================= */
export function MyRecords() {
  const { user } = useAuth();
  const s = useData(['assistantSalary', 'assistantAttendance']);
  const g = gate(s); if (g) return g;
  const sal = s.d.assistantSalary.filter((r) => r.assistant_id === user.id).sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month));
  const att = s.d.assistantAttendance.filter((r) => r.assistant_id === user.id).sort((a, b) => b.date.localeCompare(a.date));
  const label = (v) => (Number(v) === 1 ? <Badge t="ok">Present</Badge> : Number(v) === 0.5 ? <Badge t="warn">Half day</Badge> : <Badge t="bad">Absent</Badge>);
  return (
    <Page title="My Salary & Attendance" sub="Your own records. Entries are added through Salaries and Attendance.">
      <div className="grid2">
        <Card title="Salary"><Table rows={sal} empty="No salary entries yet." cols={[['Month', (r) => `${MONTHS[r.month - 1]} ${r.year}`], ['Amount', (r) => money(r.amount)], ['Reference', (r) => <b>#{r.receipt_id}</b>], ['Paid on', (r) => r.salary_payment_date]]} /></Card>
        <Card title="Attendance"><Table rows={att} empty="No attendance marked yet." cols={[['Date', (r) => r.date], ['Status', (r) => label(r.status)]]} /></Card>
      </div>
    </Page>
  );
}
