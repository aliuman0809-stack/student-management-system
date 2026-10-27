import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentManagement.css";

const API_URL = "https://student-management-system-q764.onrender.com/api/students";
const USER_API_URL = "https://student-management-system-q764.onrender.com/api/users";

const emptyForm = { name: "", email: "", age: "", course: "", phone: "" };

function StudentManagement() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem("studentUser") || "null"); } 
        catch { return null; }
    });

    // States
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    
    // Delete States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
    const [deleteAccountModal, setDeleteAccountModal] = useState(false); // NEW

    const [notifications, setNotifications] = useState([
        { id: 1, text: "Welcome to EduManage System!", time: "Just now", read: false }
    ]);

    // Fetch Data
    const fetchStudents = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/user/${user.id}`);
            setStudents(response.data);
        } catch (err) {
            setError("Unable to load students. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) navigate("/login");
        else fetchStudents();
    }, []);

    // Notifications Logic
    const addNotification = (text) => {
        const newNotif = { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false };
        setNotifications(prev => [newNotif, ...prev]);
    };
    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Dropdowns Click Outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setMenuOpen(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handlers
    const handleLogout = () => {
        if (!window.confirm("Are you sure you want to logout?")) return;
        sessionStorage.removeItem("studentUser");
        navigate("/login", { replace: true });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddForm = () => { setFormData(emptyForm); setEditingId(null); setError(""); setShowForm(true); };

    const handleEdit = (student) => {
        setFormData({ name: student.name || "", email: student.email || "", age: student.age ?? "", course: student.course || "", phone: student.phone || "" });
        setEditingId(student.id); setError(""); setShowForm(true); setActiveTab("students");
    };

    const closeForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.course.trim()) {
            setError("Name, Email, and Course are required."); return;
        }
        try {
            setSaving(true); setError("");
            const studentData = { ...formData, userId: user.id };
            
            if (editingId !== null) {
                await axios.put(`${API_URL}/${editingId}`, studentData);
                addNotification(`Updated student: ${studentData.name}`);
            } else {
                await axios.post(API_URL, studentData);
                addNotification(`Added new student: ${studentData.name}`);
            }
            await fetchStudents();
            closeForm();
        } catch (err) {
            setError(err.response?.data?.message || "Error saving student.");
        } finally { setSaving(false); }
    };

    const confirmDelete = (student) => setDeleteModal({ isOpen: true, id: student.id, name: student.name });

    const executeDelete = async () => {
        const { id, name } = deleteModal;
        setDeleteModal({ isOpen: false, id: null, name: "" });
        try {
            await axios.delete(`${API_URL}/${id}`);
            addNotification(`Deleted student: ${name}`);
            await fetchStudents();
        } catch (err) {
            setError("Unable to delete student.");
        }
    };

    // NEW: Delete Account Function
    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`${USER_API_URL}/${user.id}`);
            sessionStorage.removeItem("studentUser");
            alert("Your account and all associated data have been permanently deleted.");
            navigate("/login", { replace: true });
        } catch (err) {
            alert("Failed to delete account. Please try again.");
        }
    };

    const exportToCSV = () => {
        if (students.length === 0) return alert("No data available to export.");
        const headers = ["ID", "Name", "Email", "Age", "Course", "Phone"];
        const csvData = students.map(s => [s.id, s.name, s.email, s.age || "", s.course, s.phone || ""].join(","));
        const csvContent = [headers.join(","), ...csvData].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `students_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter & Stats
    const filteredStudents = useMemo(() => {
        const searchText = search.toLowerCase().trim();
        if (!searchText) return students;
        return students.filter((s) =>
            String(s.name || "").toLowerCase().includes(searchText) ||
            String(s.email || "").toLowerCase().includes(searchText) ||
            String(s.course || "").toLowerCase().includes(searchText)
        );
    }, [students, search]);

    const totalStudents = students.length;
    const uniqueCourses = Array.from(new Set(students.map(s => s.course).filter(Boolean)));
    const totalCourses = uniqueCourses.length;
    const averageAge = students.length ? (students.reduce((total, s) => total + (Number(s.age) || 0), 0) / students.length).toFixed(1) : "0";
    const studentsWithPhone = students.filter(s => s.phone && s.phone.trim() !== "").length;

    return (
        <div className="dashboard">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="brand"><div className="brand-icon">🎓</div><div><h2>EduManage</h2><span>Student Portal</span></div></div>
                <nav className="navigation">
                    <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span>📊</span> Dashboard</button>
                    <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><span>👨‍🎓</span> Students</button>
                    <button className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}><span>📚</span> Courses</button>
                    <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><span>📈</span> Reports</button>
                    <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><span>⚙️</span> Settings</button>
                </nav>
                <div className="sidebar-bottom"><div className="copyright">© 2026 EduManage</div></div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                <header className="topbar">
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p>{activeTab === 'dashboard' ? "Manage your students and academic records." : "View and manage your account details."}</p>
                    </div>
                    <div className="topbar-actions">
                        <div className="notification-wrapper" ref={notificationRef}>
                            <div className="notification" onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllAsRead(); }}>🔔{unreadCount > 0 && <span className="badge">{unreadCount}</span>}</div>
                            {notifOpen && (
                                <div className="notification-dropdown">
                                    <div className="notif-header"><strong>Notifications</strong><span>{unreadCount} unread</span></div>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                                                <div className="notif-icon">🔔</div><div className="notif-content"><p>{n.text}</p><small>{n.time}</small></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="profile" ref={dropdownRef}>
                            <button className="profile-trigger" onClick={() => setMenuOpen((v) => !v)}>
                                <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                                <div className="profile-info"><strong>{user?.name || "User"}</strong><small>{user?.role || "USER"}</small></div>
                                <span className="chevron">{menuOpen ? "▲" : "▼"}</span>
                            </button>
                            {menuOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-user"><div className="dropdown-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div><div className="dropdown-user-info"><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={() => navigate("/register")}><span className="dropdown-icon">🔄</span> Switch Account</button>
                                    <button className="dropdown-item danger" onClick={handleLogout}><span className="dropdown-icon">🚪</span> Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {error && <div className="error-message"><span>⚠️</span><span>{error}</span><button onClick={() => setError("")}>×</button></div>}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <section className="stats-grid">
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Total Students</span><strong className="stat-number">{totalStudents}</strong></div><div className="stat-icon students">👨‍🎓</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Total Courses</span><strong className="stat-number">{totalCourses}</strong></div><div className="stat-icon courses">📚</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Average Age</span><strong className="stat-number">{averageAge}</strong></div><div className="stat-icon age">🎂</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Contact Available</span><strong className="stat-number">{studentsWithPhone}</strong></div><div className="stat-icon contact">📱</div></div>
                    </section>
                )}

                {/* STUDENTS TAB */}
                {activeTab === 'students' && (
                    <section className="students-section">
                        <div className="section-header">
                            <div><h2>Student Directory</h2><p>View and manage all registered students.</p></div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="export-button" onClick={exportToCSV}>📥 Export Data</button>
                                <button className="add-button" onClick={openAddForm}><span>＋</span> Add Student</button>
                            </div>
                        </div>

                        {showForm && (
                            <div className="form-card">
                                <div className="form-header"><div><h3>{editingId !== null ? "Update Student" : "Add New Student"}</h3></div><button className="close-button" onClick={closeForm}>×</button></div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="input-group"><label>Student Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" /></div>
                                        <div className="input-group"><label>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@example.com" /></div>
                                        <div className="input-group"><label>Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter age" /></div>
                                        <div className="input-group"><label>Course *</label><input type="text" name="course" value={formData.course} onChange={handleChange} required placeholder="e.g. Computer Science" /></div>
                                        <div className="input-group full-width"><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" /></div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-button" onClick={closeForm}>Cancel</button>
                                        <button type="submit" className="save-button" disabled={saving}>{saving ? "Saving..." : "Save Student"}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="table-card">
                            <div className="table-toolbar">
                                <div><h3>Student List</h3><span>{filteredStudents.length} students</span></div>
                                <div className="search-box"><span>🔍</span><input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                            </div>

                            {loading ? (
                                <div className="loading-state"><div className="spinner"></div><p>Loading students...</p></div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">👨‍🎓</div><h3>No students yet</h3><p>Add your first student to get started.</p></div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Course</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="student-cell">
                                                            <div className="student-avatar">{student.name?.charAt(0)?.toUpperCase()}</div>
                                                            <div><strong>{student.name}</strong><small>Age: {student.age || "-"}</small></div>
                                                        </div>
                                                    </td>
                                                    <td>{student.email}<br/><small>{student.phone || "-"}</small></td>
                                                    <td><span className="course-badge">{student.course}</span></td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="edit-button" onClick={() => handleEdit(student)}>✏️</button>
                                                            <button className="delete-button" onClick={() => confirmDelete(student)}>🗑️</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                    <section className="students-section">
                        <div className="section-header">
                            <div><h2>Active Courses</h2><p>List of all courses based on registered students.</p></div>
                        </div>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {uniqueCourses.length === 0 ? (
                                <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="empty-icon">📚</div><h3>No courses found</h3><p>Add students to see their enrolled courses here.</p></div>
                            ) : (
                                uniqueCourses.map((course, index) => {
                                    const enrolledStudents = students.filter(s => s.course === course);
                                    return (
                                        <div className="stat-card" key={index} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', width: '100%' }}>
                                                <div className="stat-icon courses">📚</div>
                                                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>{course}</h3>
                                            </div>
                                            <div style={{ background: 'var(--bg-main)', width: '100%', padding: '12px', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>{enrolledStudents.length} Students Enrolled</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <section className="students-section">
                        <div className="section-header">
                            <div><h2>System Reports</h2><p>A comprehensive overview of your student data.</p></div>
                        </div>
                        <div className="table-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                <div style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '16px' }}>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Total Students</p>
                                    <h2 style={{ margin: '8px 0 0', fontSize: '32px' }}>{totalStudents}</h2>
                                </div>
                                <div style={{ borderLeft: '4px solid var(--success)', paddingLeft: '16px' }}>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Average Age</p>
                                    <h2 style={{ margin: '8px 0 0', fontSize: '32px' }}>{averageAge} <span style={{fontSize: '16px', fontWeight: 'normal', color: 'var(--text-muted)'}}>Years</span></h2>
                                </div>
                                <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '16px' }}>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Contact Info Provided</p>
                                    <h2 style={{ margin: '8px 0 0', fontSize: '32px' }}>{studentsWithPhone}</h2>
                                </div>
                            </div>
                            <div style={{ marginTop: '32px', padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>💡</span> <strong>Pro Tip:</strong> You can export this data to a CSV file from the Students tab for further analysis in Excel.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <section className="students-section">
                        <div className="section-header">
                            <div><h2>Account Settings</h2><p>Manage your profile and preferences.</p></div>
                        </div>
                        <div className="table-card">
                            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ margin: '0 0 24px', fontSize: '18px' }}>Profile Information</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-main)' }}>{user?.name || "User"}</h2>
                                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{user?.email || "email@example.com"}</p>
                                        <span className="course-badge" style={{ marginTop: '8px', display: 'inline-block' }}>{user?.role || "USER"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* DANGER ZONE */}
                            <div style={{ padding: '32px', background: '#fef2f2' }}>
                                <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#991b1b' }}>Danger Zone</h3>
                                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#b91c1c' }}>
                                    Be careful with these actions. They cannot be undone.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <button 
                                        className="save-button" 
                                        style={{ background: '#475569', color: '#fff' }} 
                                        onClick={handleLogout}
                                    >
                                        🚪 Logout
                                    </button>

                                    <button 
                                        className="save-button" 
                                        style={{ background: 'var(--danger)', color: '#fff' }} 
                                        onClick={() => setDeleteAccountModal(true)}
                                    >
                                        ⚠️ Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                
            </main>

            {/* CUSTOM DELETE STUDENT MODAL */}
            {deleteModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon danger">🗑️</div>
                        <h2>Delete Student?</h2>
                        <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })}>Cancel</button>
                            <button className="modal-confirm" onClick={executeDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM DELETE ACCOUNT MODAL */}
            {deleteAccountModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-icon danger" style={{ background: '#fee2e2', color: '#ef4444' }}>⚠️</div>
                        <h2>Delete Account Permanently?</h2>
                        <p style={{ color: '#475569' }}>
                            This action is <strong>irreversible</strong>. This will permanently delete your account and <strong>all your students' records</strong> from our servers. You will not be able to log in again with this email.
                        </p>
                        <div className="modal-actions">
                            <button 
                                className="modal-cancel" 
                                onClick={() => setDeleteAccountModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-confirm" 
                                onClick={handleDeleteAccount}
                            >
                                Yes, Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentManagement;