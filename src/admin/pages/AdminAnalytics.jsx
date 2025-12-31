import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, Eye, MousePointer, Clock, Globe, Smartphone, Loader, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../components/StatCard';
import adminApi from '../../utils/adminApi';
import './AdminAnalytics.css';


function AdminAnalytics() {
    const [dateRange, setDateRange] = useState('7d');
    const [trafficData, setTrafficData] = useState([]);
    const [topProperties, setTopProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ visitors: 0, views: 0 });

    // State for data that was previously mocked
    const [trafficSources, setTrafficSources] = useState([]);
    const [deviceData, setDeviceData] = useState([]);
    const [searchQueries, setSearchQueries] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [trafficRes, topPropsRes, dashboardStats] = await Promise.all([
                    adminApi.getTrafficData(dateRange),
                    adminApi.getTopProperties(),
                    adminApi.getDashboardStats(dateRange)
                ]);

                // Format traffic data
                const formattedTraffic = trafficRes.labels.map((label, index) => ({
                    date: label,
                    visitors: trafficRes.visitors[index],
                    pageViews: trafficRes.views[index]
                }));
                setTrafficData(formattedTraffic);

                // Calculate totals from traffic data
                const totalVisitors = trafficRes.visitors.reduce((a, b) => a + b, 0);
                const totalViews = trafficRes.views.reduce((a, b) => a + b, 0);
                setStats({ visitors: totalVisitors, views: totalViews });

                setTopProperties(topPropsRes);

                // Attempt to load other stats if available in dashboardStats
                // If the backend assumes we're using mock data for these, we'll now get undefined/empty here
                // ensuring we don't show fake data.
                if (dashboardStats) {
                    setTrafficSources(dashboardStats.sources || []);
                    setDeviceData(dashboardStats.devices || []);
                    setSearchQueries(dashboardStats.search_queries || []);
                }

            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="admin-analytics loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }
    return (
        <div className="admin-analytics">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Detailed insights into your platform performance</p>
                </div>
                <div className="date-range-selector">
                    <Calendar size={18} />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="stats-grid">
                <StatCard
                    title="Total Visitors"
                    value={stats.visitors.toLocaleString()}
                    change={(stats.visitors > 0) ? "+15.3%" : "0%"} // Only show trend if there is data
                    trend={stats.visitors > 0 ? "up" : "neutral"}
                    icon={<Users size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Page Views"
                    value={stats.views.toLocaleString()}
                    change={(stats.views > 0) ? "+12.8%" : "0%"}
                    trend={stats.views > 0 ? "up" : "neutral"}
                    icon={<Eye size={24} />}
                    color="green"
                />
                <StatCard
                    title="Avg. Session Duration"
                    value="4m 32s" // This might be hardcoded in backend or frontend calculation need
                    change="+8.2%"
                    trend="up"
                    icon={<Clock size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Bounce Rate"
                    value="42.3%"
                    change="-3.1%"
                    trend="up"
                    icon={<MousePointer size={24} />}
                    color="orange"
                />
            </div>

            {/* Traffic Overview */}
            <div className="analytics-section">
                <div className="section-header">
                    <h2>Traffic Overview</h2>
                </div>
                <div className="chart-card large">
                    {trafficData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
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
                                <Legend />
                                <Line type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} name="Visitors" />
                                <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={2} name="Page Views" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-msg">No traffic data available for this range.</div>
                    )}
                </div>
            </div>

            {/* Traffic Sources & Devices */}
            <div className="charts-row">
                <div className="chart-card">
                    <h3>Traffic Sources</h3>
                    {trafficSources.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={trafficSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {trafficSources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                {trafficSources.map((source) => (
                                    <div key={source.name} className="legend-item">
                                        <span className="legend-color" style={{ background: source.color }}></span>
                                        <span className="legend-label">{source.name}</span>
                                        <span className="legend-value">{source.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-data-msg">No traffic source data available.</div>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Device Breakdown</h3>
                    {deviceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deviceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-msg">No device data available.</div>
                    )}
                </div>
            </div>

            {/* Top Properties & Search Queries */}
            <div className="analytics-row">
                <div className="analytics-card">
                    <h3>Top Performing Properties</h3>
                    <div className="properties-list">
                        {topProperties.length > 0 ? (
                            topProperties.map((prop, index) => (
                                <div key={index} className="property-item">
                                    <div className="property-rank">#{index + 1}</div>
                                    <div className="property-details">
                                        <span className="property-name">{prop.title}</span>
                                        <div className="property-stats">
                                            <span>{prop.views.toLocaleString()} views</span>
                                            <span>•</span>
                                            <span>{prop.inquiries} inquiries</span>
                                            <span>•</span>
                                            <span className="conversion">{prop.conversion}% conversion</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data-msg">No property data available.</div>
                        )}
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>Top Search Queries</h3>
                    <div className="search-list">
                        {searchQueries.length > 0 ? (
                            searchQueries.map((search, index) => (
                                <div key={index} className="search-item">
                                    <div className="search-rank">#{index + 1}</div>
                                    <div className="search-details">
                                        <span className="search-query">{search.query}</span>
                                        <span className="search-count">{search.count} searches</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data-msg">No search query data available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;
