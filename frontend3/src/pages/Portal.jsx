import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useData, gate, Page, Card, Table, Progress, Badge, Field } from '../ui';
import { byId, hhmm, money, MONTHS, fullName } from '../util';

function BatchCard({ role, b, course, teacher, extra }) {
  return (
    <Link to={`/${role}/batches/${b.batch_id}`} className="card batch">
      <h3>{course?.course_Name || 'Course'} {extra}</h3>
      <p className="muted">{course?.category}</p>
      <p>🕒 {hhmm(b.start_time)} – {hhmm(b.end_time)} &nbsp; 📍 {b.venue || 'TBD'}</p>
      {teacher && <p>👨‍🏫 {fullName(teacher)}</p>}
      <Progress done={b.modules_Completed || 0} total={course?.no_of_modules || 0} />
    </Link>
  );
}

export function StudentBatches() {
  const { user } = useAuth();
  const s = useData(['enrollment', 'batch', 'course', 'teacher']);
  const g = gate(s); if (g) return g;
  const mine = s.d.enrollment.filter((e) => e.student_id === user.id);
  return (
    <Page title="My Batches" sub="Click a batch to see its timings, modules, tests, attendance, fees, certificate and notifications.">
      {mine.length === 0 && <p className="muted">You are not enrolled in any batch yet. Please contact the institute assistant.</p>}
      <div className="grid3">
        {mine.map((e) => {
          const b = byId(s.d.batch, 'batch_id', e.batch_id); if (!b) return null;
          return <BatchCard key={e.batch_id} role="student" b={b} course={byId(s.d.course, 'course_id', b.course_id)} teacher={byId(s.d.teacher, 'teacher_id', b.teacher_id)}
            extra={e.batch_Notification_Status !== true && <Badge t="new">New</Badge>} />;
        })}
      </div>
    </Page>
  );
}

export function TeacherBatches() {
  const { user } = useAuth();
  const s = useData(['batch', 'course', 'enrollment']);
  const g = gate(s); if (g) return g;
  const mine = s.d.batch.filter((b) => b.teacher_id === user.id);
  return (
    <Page title="My Batches" sub="Batches assigned to you.">
      {mine.length === 0 && <p className="muted">No batches have been assigned to you yet.</p>}
      <div className="grid3">
        {mine.map((b) => <BatchCard key={b.batch_id} role="teacher" b={b} course={byId(s.d.course, 'course_id', b.course_id)}
          extra={<Badge>{s.d.enrollment.filter((e) => e.batch_id === b.batch_id).length} students</Badge>} />)}
      </div>
    </Page>
  );
}

export function TeacherSalary() {
  const { user } = useAuth();
  const s = useData(['teacherSalary']);
  const [year, setYear] = useState(new Date().getFullYear());
  const g = gate(s); if (g) return g;
  const recs = s.d.teacherSalary.filter((r) => r.teacher_id === user.id && r.year === Number(year));
  const years = [...new Set([new Date().getFullYear(), ...s.d.teacherSalary.filter((r) => r.teacher_id === user.id).map((r) => r.year)])].sort((a, b) => b - a);
  return (
    <Page title="Salary Status" sub="Month-wise salary received. The reference number identifies the payment.">
      <Field label="Year"><select value={year} onChange={(e) => setYear(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select></Field>
      <Card>
        <Table rows={MONTHS.map((m, i) => ({ m, i: i + 1, r: recs.find((x) => x.month === i + 1) }))} cols={[
          ['Month', (x) => x.m],
          ['Status', (x) => (x.r ? <Badge t="ok">Paid</Badge> : <Badge t="warn">Not paid</Badge>)],
          ['Amount', (x) => (x.r ? money(x.r.amount) : '—')],
          ['Paid on', (x) => x.r?.salary_payment_date || '—'],
          ['Reference no.', (x) => (x.r ? <b>#{x.r.receipt_id}</b> : '—')],
        ]} />
      </Card>
    </Page>
  );
}
