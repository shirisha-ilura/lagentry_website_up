import React, { useEffect, useMemo, useState } from 'react';
import './Connections.css';

type IntegrationApp = {
  app_id: string;
  app_name: string;
  description: string;
  logo_url: string;
  categories: string[];
  auth_type: string | null;
};

type SearchResponse = {
  success: boolean;
  apps?: IntegrationApp[];
  error?: string;
};

type ConnectedIntegration = {
  app_id: string;
  status: 'connected' | 'disconnected' | 'pending';
};

const ConnectionsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [apps, setApps] = useState<IntegrationApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, ConnectedIntegration>>({});
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);

  // TODO: Replace with real agent context once auth / multi-agent is wired
  const agentId = useMemo(() => {
    return 'default-agent';
  }, []);

  // Debounce search input to avoid calling backend on every keystroke
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Load initial popular apps + respond to search changes
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadApps() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (debouncedQuery) {
          params.set('query', debouncedQuery);
        }

        const response = await fetch(`/api/integrations-search${params.toString() ? `?${params.toString()}` : ''}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Request failed with status ${response.status}`);
        }

        const data: SearchResponse = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to load integrations');
        }

        if (!cancelled) {
          setApps(data.apps || []);
        }
      } catch (err: any) {
        if (cancelled || err?.name === 'AbortError') return;
        console.error('Error loading integrations:', err);
        setError(err.message || 'Failed to load integrations');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApps();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  // Fetch connected apps for this agent (if/when backend is available)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadConnected() {
      try {
        const params = new URLSearchParams({ agentId });
        const response = await fetch(`/api/integrations/connected?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) return;

        const json = await response.json();
        if (!json?.success || !Array.isArray(json.integrations)) return;

        if (!cancelled) {
          const map: Record<string, ConnectedIntegration> = {};
          for (const row of json.integrations) {
            if (row.app_id) {
              map[row.app_id] = {
                app_id: row.app_id,
                status: row.status === 'connected' ? 'connected' : 'disconnected',
              };
            }
          }
          setConnected(map);
        }
      } catch (err: any) {
        if (cancelled || err?.name === 'AbortError') return;
        console.warn('Failed to load connected integrations', err);
      }
    }

    loadConnected();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [agentId]);

  const handleConnectClick = async (app: IntegrationApp) => {
    if (!agentId) return;

    setConnectingAppId(app.app_id);
    setError(null);

    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          appId: app.app_id,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Connect failed with status ${response.status}`);
      }

      const json = await response.json();

      // If backend returns a redirect URL for OAuth, navigate there
      if (json.redirectUrl) {
        window.location.href = json.redirectUrl;
        return;
      }

      // For non-OAuth / instant connections, optimistically mark as connected
      if (json.success) {
        setConnected((prev) => ({
          ...prev,
          [app.app_id]: {
            app_id: app.app_id,
            status: 'connected',
          },
        }));
      }
    } catch (err: any) {
      console.error('Error connecting integration:', err);
      setError(err.message || 'Failed to start connection');
    } finally {
      setConnectingAppId(null);
    }
  };

  const isSearching = debouncedQuery.length > 0;
  const isEmpty = !loading && apps.length === 0;

  return (
    <div className="connections-page">
      <div className="connections-container">
        <div className="connections-header">
          <h1 className="connections-title">Connect Your Tools</h1>
          <p className="connections-subtitle">
            Search and connect apps powered by Composio. Bring your CRM, support desk, email, and internal tools into a single AI employee workspace.
          </p>
        </div>

        <div className="connections-search-bar">
          <div className="connections-search-input-wrapper">
            <div className="connections-search-input-inner">
              <span className="connections-search-icon" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps like Slack, HubSpot, Gmail…"
                className="connections-search-input"
              />
            </div>
          </div>
          <div className="connections-hint">
            Type to search Composio&apos;s app marketplace. We&apos;ll show only the most relevant matches — no long scroll.
          </div>
        </div>

        {loading && (
          <div className="connections-skeleton-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="connection-skeleton-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="skeleton-row circle" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-row md" style={{ width: '60%' }} />
                    <div className="skeleton-row sm" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="skeleton-row sm" style={{ width: '92%' }} />
                <div className="skeleton-row sm" style={{ width: '72%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <div className="skeleton-row sm" style={{ width: '40%' }} />
                  <div className="skeleton-row sm" style={{ width: '28%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !isEmpty && (
          <div className="connections-grid">
            {apps.map((app) => {
              const connection = connected[app.app_id];
              const isConnected = connection?.status === 'connected';
              const isConnecting = connectingAppId === app.app_id;

              const categories = Array.isArray(app.categories) ? app.categories : [];
              const primaryCategory = categories[0];

              const firstLetter =
                app.app_name?.trim().charAt(0).toUpperCase() || '?';

              return (
                <div key={app.app_id} className="connection-card">
                  <div className="connection-card-header">
                    <div className="connection-logo-wrapper">
                      {app.logo_url ? (
                        <img
                          src={app.logo_url}
                          alt={`${app.app_name} logo`}
                          className="connection-logo"
                          loading="lazy"
                        />
                      ) : (
                        <div className="connection-fallback-logo">
                          {firstLetter}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="connection-title-row">
                        <div className="connection-app-name">
                          {app.app_name}
                        </div>
                        <div
                          className={
                            'connection-status-pill ' +
                            (isConnected ? 'connected' : 'not-connected')
                          }
                        >
                          <span className="connection-status-dot" />
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </div>
                      </div>
                      <p className="connection-description">
                        {app.description || 'Connect this app to sync data and power your AI employees.'}
                      </p>
                    </div>
                  </div>

                  <div className="connection-meta-row">
                    <div className="connection-categories">
                      {primaryCategory && (
                        <span className="connection-category-pill">
                          {primaryCategory}
                        </span>
                      )}
                    </div>
                    {app.auth_type && (
                      <span className="connection-auth-type">
                        {app.auth_type.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="connection-card-footer">
                    <button
                      type="button"
                      className={
                        'connection-connect-button ' +
                        (isConnected ? 'connected' : '')
                      }
                      onClick={() => handleConnectClick(app)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <span className="connection-loading-dot" />
                          <span>Connecting…</span>
                        </>
                      ) : isConnected ? (
                        <>
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isEmpty && (
          <div className="connections-empty-state">
            <div className="connections-empty-title">
              No results found{isSearching ? ` for “${debouncedQuery}”` : ''}.
            </div>
            <div className="connections-empty-subtitle">
              Try a different keyword — for example: <strong>Slack</strong>,{' '}
              <strong>HubSpot</strong>, <strong>Gmail</strong>, or{' '}
              <strong>Zendesk</strong>.
            </div>
          </div>
        )}

        {error && <div className="connections-error">{error}</div>}
      </div>
    </div>
  );
};

export default ConnectionsPage;

