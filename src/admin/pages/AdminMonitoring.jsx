import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminMonitoring.css';

// Mock data
const apiPerformance = [
    { time: '12:00', responseTime: 120, requests: 450 },
    { time: '12:15', responseTime: 135, requests: 520 },
    { time: '12:30', responseTime: 110, requests: 480 },
    { time: '12:45', responseTime: 145, requests: 590 },
    { time: '13:00', responseTime: 125, requests: 510 },
    { time: '13:15', responseTime: 140, requests: 550 },
    { time: '13:30', responseTime: 115, requests: 490 },
];

const errorsByType = [
    { type: '404 Not Found', count: 45 },
    { type: '500 Server Error', count: 12 },
    { type: '403 Forbidden', count: 8 },
    { type: '400 Bad Request', count: 23 },
];

const recentErrors = [
    { id: 1, type: '500', message: 'Database connection timeout', endpoint: '/api/properties', time: '2 min ago', status: 'critical' },
    { id: 2, type: '404', message: 'Resource not found', endpoint: '/api/users/999', time: '5 min ago', status: 'warning' },
    { id: 3, type: '403', message: 'Unauthorized access attempt', endpoint: '/api/admin/settings', time: '12 min ago', status: 'warning' },
    { id: 4, type: '500', message: 'Internal server error', endpoint: '/api/analytics', time: '18 min ago', status: 'critical' },
    { id: 5, type: '400', message: 'Invalid request parameters', endpoint: '/api/search', time: '25 min ago', status: 'info' },
];

const systemMetrics = {
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 28,
};

function AdminMonitoring() {
    return (
        <div className="admin-monitoring">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>System Monitoring</h1>
                    <p>Real-time system health and performance metrics</p>
                </div>
                <div className="status-badge status-healthy">
                    <CheckCircle size={18} />
                    All Systems Operational
                </div>
            </div>

            {/* System Health Cards */}
            <div className="health-grid">
                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Server size={24} />
                        </div>
                        <span className="health-status healthy">Healthy</span>
                    </div>
                    <h3>API Server</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Uptime</span>
                            <span className="stat-value">99.98%</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Avg Response</span>
                            <span className="stat-value">125ms</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Database size={24} />
                        </div>
                        <span className="health-status healthy">Healthy</span>
                    </div>
                    <h3>Database</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Connections</span>
                            <span className="stat-value">45/100</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Query Time</span>
                            <span className="stat-value">18ms</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Zap size={24} />
                        </div>
                        <span className="health-status warning">Warning</span>
                    </div>
                    <h3>Cache Server</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Hit Rate</span>
                            <span className="stat-value">87.3%</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Memory</span>
                            <span className="stat-value">2.1GB</span>
                        </div>
                    </div>
                </div>

                <div className="health-card">
                    <div className="health-header">
                        <div className="health-icon">
                            <Activity size={24} />
                        </div>
                        <span className="health-status healthy">Healthy</span>
                    </div>
                    <h3>Background Jobs</h3>
                    <div className="health-stats">
                        <div className="stat">
                            <span className="stat-label">Queue Size</span>
                            <span className="stat-value">12</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Processing</span>
                            <span className="stat-value">3</span>
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
                </div>

                <div className="chart-card">
                    <h3>Errors by Type</h3>
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
                </div>
            </div>

            {/* Recent Errors */}
            <div className="errors-section">
                <h2>Recent Errors</h2>
                <div className="errors-list">
                    {recentErrors.map((error) => (
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminMonitoring;
