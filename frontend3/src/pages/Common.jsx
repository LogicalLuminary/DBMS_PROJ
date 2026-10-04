import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth';
import { api } from '../api';
import { useData, gate, useAct, useForm, Page, Card, Field, Table, Msg, Tabs, Badge } from '../ui';
import { blank, fullName, nextId, today, nowTime, byId } from '../util';

/* ---------------- PROFILE ---------------- */
export function Profile() {
  const { user, refresh } = useAuth();
  const p = user.profile;
  const [f, set, bind] = useForm({ house_no: p.house_no || '', street: p.street || '', pincode: p.pincode || '' });
  const [m, run] = useAct();
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw, bindPw, resetPw] = useForm({ old: '', n1: '', n2: '' });
  const [pm, runPw, setPm] = useAct();

  const saveInfo = (e) => { e.preventDefault(); run(async () => {
    await api.update(user.role, user.id, { ...p, house_no: blank(f.house_no), street: blank(f.street), pincode: blank(f.pincode) });
    await refresh();
  }, 'Profile updated'); };

  const changePw = (e) => { e.preventDefault();
    if (pw.old !== p.credential) return setPm({ t: 'err', text: 'Old password is incorrect.' });
    if (pw.n1.length < 4) return setPm({ t: 'err', text: 'New password must be at least 4 characters.' });
    if (pw.n1 !== pw.n2) return setPm({ t: 'err', text: 'New passwords do not match.' });
    runPw(async () => { await api.update(user.role, user.id, { ...p, credential: pw.n1 }); await refresh(); resetPw(); setShowPw(false); }, 'Password changed successfully');
  };

  const fixed = [['Name', fullName(p)], ['Email', p.email], ['Sex', p.sex], ['Date of birth', p.dob], ['Aadhar', p.aadhar_id], ['Joining date', p.joining_date], ['Salary', p.salary != null ? '₹' + p.salary : null]];
  return (
    <Page title="My Profile" sub="Name, Aadhar and other identity details can only be changed by the institute.">
      <div className="grid2">
        <Card title="Identity (read-only)">
          <dl className="dl">{fixed.filter((x) => x[1]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </Card>
        <Card title="Edit address">
          <form className="stack" onSubmit={saveInfo}>
            <Field label="House no."><input {...bind('house_no')} /></Field>
            <Field label="Street"><input {...bind('street')} /></Field>
            <Field label="Pincode (must exist in the system)"><input {...bind('pincode')} /></Field>
            <Msg m={m} /><button className="btn">Save changes</button>
          </form>
          <hr />
          {!showPw ? <button className="btn ghost" onClick={() => { setShowPw(true); setPm(null); }}>Change password</button> : (
            <form className="stack" onSubmit={changePw}>
              <Field label="Old password"><input type="password" required {...bindPw('old')} /></Field>
              <Field label="New password"><input type="password" required {...bindPw('n1')} /></Field>
              <Field label="Confirm new password"><input type="password" required {...bindPw('n2')} /></Field>
              <div className="row"><button className="btn">Update password</button><button type="button" className="btn ghost" onClick={() => setShowPw(false)}>Cancel</button></div>
            </form>)}
          <Msg m={pm} />
        </Card>
      </div>
    </Page>
  );
}

/* ---------------- COMPLAINTS ---------------- */
const CMP = {
  student: { res: 'studentComplaints', idk: 'student_id', title: 'title' },
  teacher: { res: 'teacherComplaints', idk: 'teacher_id', title: 'title' },
  assistant: { res: 'assistantComplaints', idk: 'assistant_id', title: 'complaint_Title' },
};

function OwnComplaints({ role, uid, canAdd, showWho, people }) {
  const c = CMP[role];
  const s = useData([c.res]);
  const [f, , bind, reset] = useForm({ title: '', desc: '' });
  const [m, run] = useAct();
  const g = gate(s); if (g) return g;
  const all = s.d[c.res];
  const rows = (uid ? all.filter((x) => x[c.idk] === uid) : all).sort((a, b) => `${b.complaint_date}${b.complaint_time}`.localeCompare(`${a.complaint_date}${a.complaint_time}`));
  const add = (e) => { e.preventDefault(); run(async () => {
    await api.create(c.res, { complaint_id: nextId(all, 'complaint_id', (x) => x[c.idk] === uid), [c.idk]: uid, [c.title]: f.title, complaint_description: f.desc, complaint_date: today(), complaint_time: nowTime() });
    reset(); await s.reload();
  }, 'Complaint submitted'); };
  return (
    <>
      {canAdd && (
        <Card title="New complaint">
          <form className="stack" onSubmit={add}>
            <Field label="Title"><input required {...bind('title')} /></Field>
            <Field label="Description"><textarea rows="3" {...bind('desc')} /></Field>
            <Msg m={m} /><button className="btn">Submit complaint</button>
          </form>
        </Card>)}
      <Card title={showWho ? `${role} complaints` : 'My complaints'}>
        <Table rows={rows} empty="No complaints." cols={[
          ['Date', (r) => `${r.complaint_date} ${String(r.complaint_time).slice(0, 5)}`],
          ...(showWho ? [[ 'From', (r) => fullName(byId(people || [], `${role}_id`, r[c.idk])) || `#${r[c.idk]}` ]] : []),
          ['Title', (r) => r[c.title]], ['Description', (r) => r.complaint_description],
        ]} />
      </Card>
    </>
  );
}

export function Complaints() {
  const { user } = useAuth();
  const [tab, setTab] = useState('student');
  const people = useData(['student', 'teacher', 'assistant']);
  if (user.role !== 'admin') {
    return <Page title="Complaints" sub="Complaints you have raised with the institute."><OwnComplaints role={user.role} uid={user.id} canAdd /></Page>;
  }
  const g = gate(people); if (g) return g;
  return (
    <Page title="All Complaints" sub="Admins can view complaints but cannot add them.">
      <Tabs tabs={[['student', 'Students'], ['teacher', 'Teachers'], ['assistant', 'Assistants']]} value={tab} onChange={setTab} />
      <OwnComplaints key={tab} role={tab} showWho people={people.d[tab]} />
    </Page>
  );
}

/* ---------------- GLOBAL NOTIFICATIONS ---------------- */
export function GlobalNotifications() {
  const { user, lastSeen, markSeen } = useAuth();
  const s = useData(['globalnotification']);
  const seenAtOpen = useRef(lastSeen);
  const [f, , bind, reset] = useForm({ title: '', desc: '' });
  const [m, run] = useAct();
  const list = s.d.globalnotification;

  useEffect(() => {
    if (list?.length) markSeen(Math.max(...list.map((n) => n.notification_id))).catch(() => {});
    // eslint-disable-next-line
  }, [list]);

  const g = gate(s); if (g) return g;
  const rows = [...list].sort((a, b) => b.notification_id - a.notification_id);
  const add = (e) => { e.preventDefault(); run(async () => {
    await api.create('globalnotification', { notification_id: nextId(list, 'notification_id'), assistant_id: user.id, notification_date: today(), notification_time: nowTime(), notification_title: f.title, description: f.desc });
    reset(); await s.reload();
  }, 'Notification published'); };
  return (
    <Page title="Global Notifications" sub="Announcements from the institute. They cannot be deleted once published.">
      {user.role === 'assistant' && (
        <Card title="Publish a notification">
          <form className="stack" onSubmit={add}>
            <Field label="Title"><input required {...bind('title')} /></Field>
            <Field label="Description"><textarea rows="3" required {...bind('desc')} /></Field>
            <Msg m={m} /><button className="btn">Publish</button>
          </form>
        </Card>)}
      {rows.length === 0 && <p className="muted">No notifications yet.</p>}
      {rows.map((n) => (
        <Card key={n.notification_id} className="notice">
          <h3>{n.notification_title} {(seenAtOpen.current === null || n.notification_id > seenAtOpen.current) && user.role !== 'admin' && <Badge t="new">NEW</Badge>}</h3>
          <p>{n.description}</p>
          <small className="muted">{n.notification_date} {String(n.notification_time).slice(0, 5)}</small>
        </Card>))}
    </Page>
  );
}
