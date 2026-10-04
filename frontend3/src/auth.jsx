import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, authApi } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id, role, email, profile}
  const [lastSeen, setLastSeen] = useState(null); // global notification last-seen id (null = nothing seen)
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(async (s) => {
    const profile = await api.get(s.role, s.id);
    let seen = profile.lastSeen_Global_Notification_id ?? null;
    if (s.role === 'assistant') {
      try {
        const rows = await api.list('assistantLastSeen');
        seen = rows.find((r) => r.assistant_id === s.id)?.lastSeen_Global_Notification_id ?? null;
      } catch { seen = null; }
    }
    if (s.role === 'admin') seen = null;
    setLastSeen(seen);
    setUser({ id: s.id, role: s.role, email: s.email, profile });
  }, []);

  useEffect(() => {
    (async () => {
      try { await loadProfile(await authApi.me()); } catch { setUser(null); }
      setReady(true);
    })();
  }, [loadProfile]);

  const login = async (role, email, credential) => {
    const r = await authApi.login({ role, email, credential });
    await loadProfile({ id: r.id, role: r.role, email });
    return r.role;
  };
  const logout = async () => { try { await authApi.logout(); } catch { /* ignore */ } setUser(null); setLastSeen(null); };
  const refresh = () => loadProfile(user);

  // Mark global notifications up to maxId as seen
  const markSeen = async (maxId) => {
    if (!user || user.role === 'admin' || !maxId || (lastSeen !== null && maxId <= lastSeen)) return;
    if (user.role === 'assistant') {
      await api.create('assistantLastSeen', { assistant_id: user.id, lastSeen_Global_Notification_id: maxId });
    } else {
      const p = { ...user.profile, lastSeen_Global_Notification_id: maxId };
      await api.update(user.role, user.id, p);
      setUser({ ...user, profile: p });
    }
    setLastSeen(maxId);
  };

  return <Ctx.Provider value={{ user, ready, login, logout, refresh, lastSeen, markSeen }}>{children}</Ctx.Provider>;
}
