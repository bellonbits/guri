import { useState, useEffect } from 'react';
import { UserPlus, Shield, Ban, Mail, Phone, Calendar, Edit, Trash2, Loader, Check, X } from 'lucide-react';
import DataTable from '../components/DataTable';
import adminApi from '../../utils/adminApi';
import './AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [stats, setStats] = useState({ total: 0, active: 0, agents: 0, admins: 0 });

    useEffect(() => {
        fetchData();
    }, [selectedRole, selectedStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedRole !== 'all') params.role = selectedRole;
            // status filter not yet implemented in backend /users endpoint, doing client side for now or ignoring

            const [usersRes, dashboardStats] = await Promise.all([
                adminApi.getUsers(params),
                adminApi.getDashboardStats('30d') // For total stats
            ]);

            setUsers(usersRes);

            // Update stats from dashboard response + local calculation for convenience
            setStats({
                total: dashboardStats.users.total,
                active: usersRes.filter(u => u.status === 'active').length, // Approx from current page/limit
                agents: usersRes.filter(u => u.role === 'agent').length,
                admins: usersRes.filter(u => u.role === 'admin' || u.role === 'super_admin').length
            });

        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await adminApi.updateUserRole(userId, newRole);
            fetchData();
        } catch (error) {
            console.error("Failed to update role:", error);
            alert("Failed to update role");
        }
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'User',
            width: '20%',
            render: (value, row) => (
                <div className="user-cell">
                    <div className="user-avatar">
                        {value.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{value}</span>
                        <span className="user-email">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            width: '15%',
            render: (value) => (
                <span className="phone-cell">{value}</span>
            )
        },
        {
            key: 'role',
            label: 'Role',
            width: '10%',
            render: (value) => (
                <span className={`role-badge role-${value.toLowerCase()}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            width: '10%',
            render: (value) => (
                <span className={`status-badge status-${value.toLowerCase()}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'properties',
            label: 'Properties',
            width: '10%',
            render: (value) => (
                <span className="stat-cell">{value}</span>
            )
        },
        {
            key: 'inquiries',
            label: 'Inquiries',
            width: '10%',
            render: (value) => (
                <span className="stat-cell">{value}</span>
            )
        },
        {
            key: 'lastLogin',
            label: 'Last Login',
            width: '12%',
            render: (value) => (
                <span className="date-cell">{value}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '13%',
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn edit" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button className="action-btn mail" title="Send Email">
                        <Mail size={16} />
                    </button>
                    <button className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const handleRowClick = (user) => {
        console.log('User clicked:', user);
        // Navigate to user detail or open modal
    };


    return (
        <div className="admin-users">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage user accounts and permissions</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={20} />
                    Add User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="users-stats">
                <div className="stat-card-mini">
                    <div className="stat-icon">
                        <Shield size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon active">
                        <Shield size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon agent">
                        <Shield size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.agents}</span>
                        <span className="stat-label">Agents</span>
                    </div>
                </div>
                <div className="stat-card-mini">
                    <div className="stat-icon admin">
                        <Shield size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.admins}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <span>Role:</span>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="filter-group">
                    <span>Status:</span>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>

                <div className="filter-stats">
                    <span>{users.length} users</span>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-state">
                    <Loader className="animate-spin" size={32} />
                    <p>Loading users...</p>
                </div>
            ) : (
                <DataTable
                    data={users}
                    columns={columns}
                    searchable
                    sortable
                    onRowClick={handleRowClick}
                    emptyMessage="No users found"
                />
            )}        </div>
    );
}

export default AdminUsers;
