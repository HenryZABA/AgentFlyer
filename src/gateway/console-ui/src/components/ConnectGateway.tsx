import { useState } from 'react';
import { setGatewayConnection, rpc } from '../hooks/useRpc.js';

interface Props {
  onConnected: () => void;
}

export function ConnectGateway({ onConnected }: Props) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect() {
    const trimmedUrl = url.trim().replace(/\/+$/, '');
    if (!trimmedUrl) {
      setError('Please enter a gateway URL');
      return;
    }
    setTesting(true);
    setError('');
    // Persist first so rpc() picks it up
    setGatewayConnection(trimmedUrl, token.trim());
    try {
      await rpc<unknown>('status');
      onConnected();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#07090f', fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AF</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-100">AgentFlyer Console</h1>
          <p className="text-sm text-slate-500 mt-1">Connect to your AgentFlyer gateway</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Gateway URL</label>
            <input
              type="url"
              placeholder="http://127.0.0.1:4321"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Token <span className="text-slate-600">(optional)</span></label>
            <input
              type="password"
              placeholder="Gateway auth token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-2.5 text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={testing}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60"
            style={{
              background: testing
                ? 'rgba(99,102,241,0.4)'
                : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              border: '1px solid rgba(99,102,241,0.4)',
            }}
          >
            {testing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Testing connection...
              </span>
            ) : (
              'Connect'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Make sure your AgentFlyer gateway is running and accessible.
        </p>
      </div>
    </div>
  );
}
