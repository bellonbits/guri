import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import './DataTable.css';

function DataTable({
    data = [],
    columns = [],
    searchable = false,
    sortable = false,
    onRowClick,
    emptyMessage = 'No data available'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Filter data based on search
    const filteredData = searchable
        ? data.filter(row =>
            columns.some(col =>
                String(row[col.key])
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        )
        : data;

    // Sort data
    const sortedData = sortable && sortConfig.key
        ? [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })
        : filteredData;

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="data-table-container">
            {searchable && (
                <div className="table-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className={sortable ? 'sortable' : ''}
                                    style={{ width: col.width }}
                                >
                                    <div className="th-content">
                                        <span>{col.label}</span>
                                        {sortable && sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc'
                                                ? <ChevronUp size={16} />
                                                : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="empty-state">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={onRowClick ? 'clickable' : ''}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {sortedData.length > 0 && (
                <div className="table-footer">
                    <span className="table-count">
                        Showing {sortedData.length} of {data.length} entries
                    </span>
                </div>
            )}
        </div>
    );
}

export default DataTable;
