import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

function StatCard({ title, value, change, trend, icon, color = 'blue' }) {
    const isPositive = trend === 'up';

    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-header">
                <div className="stat-icon-wrapper">
                    {icon}
                </div>
                <div className="stat-trend">
                    {isPositive ? (
                        <TrendingUp size={16} className="trend-up" />
                    ) : (
                        <TrendingDown size={16} className="trend-down" />
                    )}
                    <span className={isPositive ? 'trend-up' : 'trend-down'}>
                        {change}
                    </span>
                </div>
            </div>

            <div className="stat-body">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>
        </div>
    );
}

export default StatCard;
