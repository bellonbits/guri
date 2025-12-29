import { useState } from 'react';
import { useCompare } from '../context/CompareContext';
import { X, ChevronUp, ChevronDown, Check, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CompareWidget.css';

function CompareWidget() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const [isExpanded, setIsExpanded] = useState(false);

    if (compareList.length === 0) return null;

    return (
        <div className={`compare-widget ${isExpanded ? 'expanded' : ''}`}>
            {/* Header / Toggle */}
            <div className="compare-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="compare-title">
                    <Scale size={18} />
                    <span>Compare ({compareList.length})</span>
                </div>
                <button className="toggle-btn">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
            </div>

            {/* Content List */}
            {isExpanded && (
                <div className="compare-content">
                    <div className="compare-items">
                        {compareList.map(item => (
                            <div key={item.id} className="compare-item">
                                <div className="item-thumb">
                                    <img src={item.images[0]} alt={item.title} />
                                </div>
                                <div className="item-info">
                                    <span className="item-title">{item.title}</span>
                                    <span className="item-price">{item.currency} {parseFloat(item.price).toLocaleString()}</span>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCompare(item.id);
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="compare-actions">
                        <button className="clear-link" onClick={clearCompare}>Clear all</button>
                        <Link to="/compare" className="compare-btn" onClick={() => setIsExpanded(false)}>
                            Compare Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompareWidget;
