import React, { useEffect, useState } from 'react';
import { Building, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AgentDashboard.css';

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="stat-card">
        <div className="stat-header">
            <span className="stat-title">{title}</span>
            <div className={`stat-icon icon-${color}`}>
                {icon}
            </div>
        </div>
        <div className="stat-value">{value}</div>
        {trend && (
            <div className="stat-trend positive">
                <TrendingUp size={16} />
                <span>{trend} this month</span>
            </div>
        )}
    </div>
);

const AgentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        listings: 0,
        views: 0,
        inquiries: 0
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'Agent'}! 👋</h1>
                    <p className="page-subtitle">Here's what's happening with your listings today.</p>
                </div>
                <Link to="/agent/listings/new" className="btn-primary-agent">
                    <Plus size={20} />
                    <span>Add Property</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Active Listings"
                    value="12"
                    icon={<Building size={24} />}
                    color="blue"
                    trend="+2"
                />
                <StatCard
                    title="Total Views"
                    value="1.2k"
                    icon={<Eye size={24} />}
                    color="green"
                    trend="+18%"
                />
                <StatCard
                    title="New Inquiries"
                    value="5"
                    icon={<MessageSquare size={24} />}
                    color="purple"
                    trend="+3"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="dashboard-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                    <div className="empty-state">
                        <p>No recent activity to show.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
