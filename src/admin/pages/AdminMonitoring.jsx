import { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from '../../utils/adminApi';
import './AdminMonitoring.css';

function AdminMonitoring() {
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                setLoading(true);
                const data = await adminApi.getSystemHealth();
                setHealthData(data);
            } catch (err) {
                console.error("Failed to fetch system health:", err);
                setError("Failed to load system health data.");
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        // Set up polling every 60 seconds
        const interval = setInterval(fetchHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !healthData) {
        return (
            <div className="admin-monitoring loading">
                <div className="loading-spinner"></div>
                <p>Loading system health...</p>
            </div>
        );
    }

    if (error && !healthData) {
        return (
            <div className="admin-monitoring error">
                <p>{error}</p>
            </div>
        );
    }

    // Default empty structures if API returns partial data
    const apiPerformance = healthData?.apiPerformance || [];
    const errorsByType = healthData?.errorsByType || [];
    const recentErrors = healthData?.recentErrors || [];
    const systemMetrics = healthData?.metrics || {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0
    };
    const isHealthy = healthData?.status === 'healthy';

    return (
        <div className="admin-monitoring">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>System Monitoring</h1>
                    <p>Real-time system health and performance metrics</p>
                </div>
                <div className={`status-badge ${isHealthy ? 'status-healthy' : 'status-warning'}`}>
                    {isHealthy ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    {healthData?.message || 'System Status Unknown'}
                </div>
            </div>

            {/* System Health Cards */}
            <div className="health-grid">
                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Server size={24} />
                        </div>
                        <span className={`health-status ${healthData?.services?.api?.status || 'unknown'}`}>
                            {healthData?.services?.api?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3>API Server</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Uptime</span>
                            <span className="stat-value">{healthData?.services?.api?.uptime || 'N/A'}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Avg Response</span>
                            <span className="stat-value">{healthData?.services?.api?.avgResponse || '0'}ms</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Database size={24} />
                        </div>
                        <span className={`health-status ${healthData?.services?.database?.status || 'unknown'}`}>
                            {healthData?.services?.database?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3>Database</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Connections</span>
                            <span className="stat-value">{healthData?.services?.database?.connections || 0}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Query Time</span>
                            <span className="stat-value">{healthData?.services?.database?.avgQueryTime || 0}ms</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Zap size={24} />
                        </div>
                        <span className={`health-status ${healthData?.services?.cache?.status || 'unknown'}`}>
                            {healthData?.services?.cache?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3>Cache Server</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Hit Rate</span>
                            <span className="stat-value">{healthData?.services?.cache?.hitRate || 0}%</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Memory</span>
                            <span className="stat-value">{healthData?.services?.cache?.memory || '0B'}</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Activity size={24} />
                        </div>
                        <span className={`health-status ${healthData?.services?.jobs?.status || 'unknown'}`}>
                            {healthData?.services?.jobs?.status || 'Unknown'}
                        </span>
                    </div>
                    <h3>Background Jobs</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Queue Size</span>
                            <span className="stat-value">{healthData?.services?.jobs?.queueSize || 0}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Processing</span>
                            <span className="stat-value">{healthData?.services?.jobs?.processing || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Resources */}
            <div className="resources-section">
                <h2>System Resources</h2>
                <div className="resources-grid">
                    <div className="resource-card">
                        <div className="resource-header">
                            <span>CPU Usage</span>
                            <span className="resource-value">{systemMetrics.cpu}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${systemMetrics.cpu}%`, background: '#6366f1' }}
                            />
                        </div>
                    </div>

                    <div className="resource-card">
                        <div className="resource-header">
                            <span>Memory Usage</span>
                            <span className="resource-value">{systemMetrics.memory}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${systemMetrics.memory}%`, background: '#f59e0b' }}
                            />
                        </div>
                    </div>

                    <div className="resource-card">
                        <div className="resource-header">
                            <span>Disk Usage</span>
                            <span className="resource-value">{systemMetrics.disk}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${systemMetrics.disk}%`, background: '#10b981' }}
                            />
                        </div>
                    </div>

                    <div className="resource-card">
                        <div className="resource-header">
                            <span>Network I/O</span>
                            <span className="resource-value">{systemMetrics.network}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${systemMetrics.network}%`, background: '#8b5cf6' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>API Performance</h3>
                    {apiPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={apiPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} name="Response Time (ms)" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">No performance data available</div>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Errors by Type</h3>
                    {errorsByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={errorsByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="type" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">No error data available</div>
                    )}
                </div>
            </div>

            {/* Recent Errors */}
            <div className="errors-section">
                <h2>Recent Errors</h2>
                <div className="errors-list">
                    {recentErrors.length > 0 ? (
                        recentErrors.map((error) => (
                            <div key={error.id} className={`error-item error-${error.status}`}>
                                <div className="error-icon">
                                    {error.status === 'critical' ? (
                                        <XCircle size={20} />
                                    ) : (
                                        <AlertTriangle size={20} />
                                    )}
                                </div>
                                <div className="error-content">
                                    <div className="error-header">
                                        <span className="error-type">{error.type}</span>
                                        <span className="error-endpoint">{error.endpoint}</span>
                                    </div>
                                    <p className="error-message">{error.message}</p>
                                </div>
                                <div className="error-time">
                                    <Clock size={14} />
                                    {error.time}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data-msg">No recent errors logged.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminMonitoring;
