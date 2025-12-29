import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Eye, TrendingUp, Plus, FileText, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import adminApi from '../../utils/adminApi';
import './AdminDashboard.css';
import { formatDistanceToNow } from 'date-fns';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [trafficData, setTrafficData] = useState([]);
    const [propertyViewsData, setPropertyViewsData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsRes, trafficRes, viewsRes, activityRes] = await Promise.all([
                    adminApi.getDashboardStats('30d'),
                    adminApi.getTrafficData('7d'),
                    adminApi.getViewsByCategory(),
                    adminApi.getRecentActivity()
                ]);

                setStats(statsRes);

                // Format traffic data for chart
                const formattedTraffic = trafficRes.labels.map((label, index) => ({
                    date: label,
                    views: trafficRes.views[index],
                    visitors: trafficRes.visitors[index]
                }));
                setTrafficData(formattedTraffic);

                setPropertyViewsData(viewsRes);

                // Format relative time for activity
                const formattedActivity = activityRes.map(item => ({
                    ...item,
                    time: formatDistanceToNow(new Date(item.time), { addSuffix: true })
                }));
                setRecentActivity(formattedActivity);

            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard error">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Page Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your platform.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/properties')}
                >
                    <Plus size={20} />
                    Add Property
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Total Properties"
                    value={stats?.properties?.total.toLocaleString() || '0'}
                    change={`${stats?.properties?.growth > 0 ? '+' : ''}${stats?.properties?.growth}%`}
                    trend={stats?.properties?.growth >= 0 ? "up" : "down"}
                    icon={<Building2 size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total.toLocaleString() || '0'}
                    change={`${stats?.users?.growth > 0 ? '+' : ''}${stats?.users?.growth}%`}
                    trend={stats?.users?.growth >= 0 ? "up" : "down"}
                    icon={<Users size={24} />}
                    color="green"
                />
                <StatCard
                    title="Total Inquiries"
                    value={stats?.inquiries?.total.toLocaleString() || '0'}
                    change="+0%" // TODO: Add inquiry growth to API
                    trend="neutral"
                    icon={<Eye size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Revenue"
                    value={`$${stats?.revenue?.total.toLocaleString() || '0'}`}
                    change={`${stats?.revenue?.growth > 0 ? '+' : ''}${stats?.revenue?.growth}%`}
                    trend={stats?.revenue?.growth >= 0 ? "up" : "down"}
                    icon={<TrendingUp size={24} />}
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                {/* Traffic Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Traffic Overview</h3>
                        <select className="chart-filter">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', r: 4 }}
                                name="Page Views"
                            />
                            <Line
                                type="monotone"
                                dataKey="visitors"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                name="Visitors"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Property Views Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Property Views by Category</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={propertyViewsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="category" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row">
                {/* Recent Activity */}
                <div className="activity-card">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <button className="btn-link">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-icon">
                                    <AlertCircle size={16} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-action">{item.action}</p>
                                    <p className="activity-detail">
                                        {item.property || item.user}
                                    </p>
                                </div>
                                <span className="activity-time">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-grid">
                        <button className="quick-action-btn">
                            <Plus size={24} />
                            <span>Add Property</span>
                        </button>
                        <button className="quick-action-btn">
                            <FileText size={24} />
                            <span>View Reports</span>
                        </button>
                        <button className="quick-action-btn">
                            <Users size={24} />
                            <span>Manage Users</span>
                        </button>
                        <button className="quick-action-btn">
                            <AlertCircle size={24} />
                            <span>System Health</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
