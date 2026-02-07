/**
 * Admin portal: list licenses, revoke; My Paths and My Links (localStorage). Protect with admin secret (X-Admin-Secret).
 */

import { useState, useEffect, useCallback } from 'react';
import { Shield, LogOut, RefreshCw, Trash2, FolderOpen, Link2, Copy, ExternalLink } from 'lucide-react';

const ADMIN_SECRET_KEY = 'apg_admin_secret';
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const ADMIN_SAVED_PATHS_KEY = 'apg_admin_saved_paths';
const ADMIN_SAVED_LINKS_KEY = 'apg_admin_saved_links';

type AdminTab = 'licenses' | 'paths' | 'links';

interface LicenseRow {
  id: string;
  key_last4: string;
  email: string;
  customer_name: string | null;
  status: string;
  activated_at: string | null;
  created_at: string;
  stripe_session_id: string | null;
}

export function AdminDashboard() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(ADMIN_SECRET_KEY) || '');
  const [inputSecret, setInputSecret] = useState('');
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>('licenses');

  const [savedPaths, setSavedPaths] = useState<{ id: string; label: string; path: string }[]>(() => {
    try {
      const j = localStorage.getItem(ADMIN_SAVED_PATHS_KEY);
      if (!j) return [];
      return JSON.parse(j);
    } catch {
      return [];
    }
  });
  const [pathsFormLabel, setPathsFormLabel] = useState('');
  const [pathsFormPath, setPathsFormPath] = useState('');

  const [savedLinks, setSavedLinks] = useState<{ id: string; label: string; url: string }[]>(() => {
    try {
      const j = localStorage.getItem(ADMIN_SAVED_LINKS_KEY);
      if (!j) return [];
      return JSON.parse(j);
    } catch {
      return [];
    }
  });
  const [linksFormLabel, setLinksFormLabel] = useState('');
  const [linksFormUrl, setLinksFormUrl] = useState('');

  const login = (s: string) => {
    if (!s.trim()) return;
    sessionStorage.setItem(ADMIN_SECRET_KEY, s.trim());
    setSecret(s.trim());
    setInputSecret('');
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SECRET_KEY);
    setSecret('');
    setLicenses([]);
  };

  const fetchLicenses = useCallback(async () => {
    if (!SUPABASE_URL || !secret) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-licenses-list`, {
        headers: { 'X-Admin-Secret': secret },
      });
      if (res.status === 401) {
        logout();
        setError('Invalid or expired secret.');
        return;
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLicenses(data.licenses || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load licenses');
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    if (secret && SUPABASE_URL) fetchLicenses();
  }, [secret, SUPABASE_URL, fetchLicenses]);

  const revoke = async (licenseId: string) => {
    if (!secret || !confirm('Revoke this license? The customer will no longer be able to activate.')) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-license-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Secret': secret },
        body: JSON.stringify({ action: 'revoke', license_id: licenseId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchLicenses();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    }
  };

  const addSavedPath = useCallback(() => {
    const label = pathsFormLabel.trim();
    const path = pathsFormPath.trim();
    if (!label || !path) return;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;
    const next = [...savedPaths, { id, label, path }];
    setSavedPaths(next);
    setPathsFormLabel('');
    setPathsFormPath('');
    try {
      localStorage.setItem(ADMIN_SAVED_PATHS_KEY, JSON.stringify(next));
    } catch {}
  }, [savedPaths, pathsFormLabel, pathsFormPath]);

  const removeSavedPath = useCallback((id: string) => {
    const next = savedPaths.filter((p) => p.id !== id);
    setSavedPaths(next);
    try {
      localStorage.setItem(ADMIN_SAVED_PATHS_KEY, JSON.stringify(next));
    } catch {}
  }, [savedPaths]);

  const addSavedLink = useCallback(() => {
    const label = linksFormLabel.trim();
    let url = linksFormUrl.trim();
    if (!label || !url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `l-${Date.now()}`;
    const next = [{ id, label, url }, ...savedLinks];
    setSavedLinks(next);
    setLinksFormLabel('');
    setLinksFormUrl('');
    try {
      localStorage.setItem(ADMIN_SAVED_LINKS_KEY, JSON.stringify(next));
    } catch {}
  }, [savedLinks, linksFormLabel, linksFormUrl]);

  const removeSavedLink = useCallback((id: string) => {
    const next = savedLinks.filter((l) => l.id !== id);
    setSavedLinks(next);
    try {
      localStorage.setItem(ADMIN_SAVED_LINKS_KEY, JSON.stringify(next));
    } catch {}
  }, [savedLinks]);

  if (!SUPABASE_URL) {
    return (
      <div className="min-h-screen bg-vault-dark flex items-center justify-center p-4">
        <div className="text-center text-text-secondary">
          <p>Set VITE_SUPABASE_URL in .env to use the admin portal.</p>
        </div>
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="min-h-screen bg-vault-dark flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card-bg border border-border-subtle rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent-gold" />
            <h1 className="text-lg font-semibold text-text-primary">Admin</h1>
          </div>
          <p className="text-sm text-text-muted mb-4">Enter the admin secret to continue.</p>
          <input
            type="password"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login(inputSecret)}
            placeholder="Admin secret"
            className="w-full px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            type="button"
            onClick={() => login(inputSecret)}
            className="mt-4 w-full py-2 px-4 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-dark text-text-primary">
      <header className="border-b border-border-subtle px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-gold" />
            <span className="font-semibold">License Admin</span>
          </div>
          <nav className="flex gap-1">
            {(['licenses', 'paths', 'links'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  tab === t
                    ? 'bg-accent-gold/20 text-accent-gold'
                    : 'text-text-muted hover:text-text-primary hover:bg-card-bg'
                }`}
              >
                {t === 'licenses' ? 'Licenses' : t === 'paths' ? 'My Paths' : 'My Links'}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLicenses()}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-card-bg-hover text-text-muted"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href="/"
            className="text-sm text-text-muted hover:text-accent-gold"
          >
            ← App
          </a>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-gold"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-accent-gold/10 border border-accent-gold/40 text-accent-gold text-sm">
            {error}
          </div>
        )}

        {tab === 'licenses' && (
          <>
            <h2 className="text-lg font-medium mb-4">Licenses</h2>
            {loading && licenses.length === 0 ? (
              <p className="text-text-muted">Loading…</p>
            ) : licenses.length === 0 ? (
              <p className="text-text-muted">No licenses yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card-bg border-b border-border-subtle">
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">License (last 4)</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Activated</th>
                      <th className="p-3 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((row) => (
                      <tr key={row.id} className="border-b border-border-subtle/50 hover:bg-card-bg/50">
                        <td className="p-3">{row.email}</td>
                        <td className="p-3 font-mono">****-****-****-{row.key_last4}</td>
                        <td className="p-3">
                          <span className={row.status === 'active' ? 'text-green-500' : 'text-red-400'}>{row.status}</span>
                        </td>
                        <td className="p-3 text-text-muted">{row.created_at ? new Date(row.created_at).toLocaleString() : '—'}</td>
                        <td className="p-3 text-text-muted">{row.activated_at ? new Date(row.activated_at).toLocaleString() : '—'}</td>
                        <td className="p-3">
                          {row.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => revoke(row.id)}
                              className="p-1.5 rounded text-accent-gold hover:bg-accent-gold/10"
                              title="Revoke"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'paths' && (
          <div className="bg-card-bg border border-border-subtle rounded-xl p-6 max-w-2xl">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-accent-gold" />
              My Paths
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Save file or folder paths (e.g. project folder, build output) for quick copy. Stored in this browser only.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Label (e.g. Project folder)"
                value={pathsFormLabel}
                onChange={(e) => setPathsFormLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSavedPath()}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
              />
              <input
                type="text"
                placeholder="Path"
                value={pathsFormPath}
                onChange={(e) => setPathsFormPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSavedPath()}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
              />
              <button
                type="button"
                onClick={addSavedPath}
                className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover"
              >
                Add
              </button>
            </div>
            {savedPaths.length === 0 ? (
              <p className="text-text-muted text-sm">No paths saved. Add one above.</p>
            ) : (
              <ul className="space-y-2">
                {savedPaths.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border-subtle bg-vault-dark"
                  >
                    <span className="font-medium text-accent-gold min-w-[100px]">{p.label}</span>
                    <span className="flex-1 min-w-0 truncate text-text-muted text-sm" title={p.path}>
                      {p.path}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(p.path)}
                      className="p-1.5 rounded text-text-muted hover:text-accent-gold hover:bg-accent-gold/10"
                      title="Copy path"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedPath(p.id)}
                      className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'links' && (
          <div className="bg-card-bg border border-border-subtle rounded-xl p-6 max-w-2xl">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent-gold" />
              My Links
            </h2>
            <p className="text-text-muted text-sm mb-4">
              Save links to Supabase, Host Armada, GitHub, Stripe, and other tools. Open in a new tab or copy URL. Stored in this browser only.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Label (e.g. Supabase)"
                value={linksFormLabel}
                onChange={(e) => setLinksFormLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSavedLink()}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://supabase.com/dashboard)"
                value={linksFormUrl}
                onChange={(e) => setLinksFormUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSavedLink()}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-vault-dark border border-border-subtle text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
              />
              <button
                type="button"
                onClick={addSavedLink}
                className="px-4 py-2 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover"
              >
                Add
              </button>
            </div>
            {savedLinks.length === 0 ? (
              <p className="text-text-muted text-sm">No links saved. Add one above (e.g. Supabase, Host Armada, GitHub).</p>
            ) : (
              <ul className="space-y-2">
                {savedLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border-subtle bg-vault-dark"
                  >
                    <span className="font-medium text-accent-gold min-w-[100px]">{link.label}</span>
                    <span className="flex-1 min-w-0 truncate text-text-muted text-sm" title={link.url}>
                      {link.url}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 inline-flex items-center gap-1"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(link.url)}
                      className="p-1.5 rounded text-text-muted hover:text-accent-gold hover:bg-accent-gold/10"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedLink(link.id)}
                      className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
