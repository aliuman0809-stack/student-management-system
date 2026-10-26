import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentManagement.css";

const API_URL = "https://student-management-system-q764.onrender.com/api/students";

const emptyForm = {
    name: "",
    email: "",
    age: "",
    course: "",
    phone: ""
};

function StudentManagement() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    // SESSION USER
    let user = null;
    try {
        user = JSON.parse(sessionStorage.getItem("studentUser") || "null");
    } catch {
        user = null;
    }

    // AGAR USER LOGIN NAHI HAI TO LOGIN PAR BHEJ DEIN
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // STATES
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

    const [notifications, setNotifications] = useState([
        { id: 1, text: "Welcome to EduManage System!", time: "Just now", read: false }
    ]);

    const addNotification = (text) => {
        const newNotif = {
            id: Date.now(),
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // CLOSE DROPDOWNS
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setMenuOpen(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // LOGOUT
    const handleLogout = () => {
        if (!window.confirm("Are you sure you want to logout?")) return;
        sessionStorage.removeItem("studentUser");
        navigate("/login", { replace: true });
    };

    // GET STUDENTS (ONLY FOR LOGGED IN USER)
    const fetchStudents = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            // Ab hum URL mein user.id bhej rahe hain
            const response = await axios.get(`${API_URL}/user/${user.id}`);
            setStudents(response.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load students. Backend connection error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [user]); // Jab user change ho to data refresh ho

    // FORM HANDLING
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name || "",
            email: student.email || "",
            age: student.age ?? "",
            course: student.course || "",
            phone: student.phone || ""
        });
        setEditingId(student.id);
        setError("");
        setShowForm(true);
        setActiveTab("students");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyForm);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.course.trim()) {
            setError("Name, Email, and Course are required.");
            return;
        }
        try {
            setSaving(true);
            setError("");
            const studentData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                age: formData.age === "" ? null : Number(formData.age),
                course: formData.course.trim(),
                phone: formData.phone.trim(),
                userId: user.id  // YEH LINE SAB SE AHEM HAI
            };
            
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
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        const studentName = students.find(s => s.id === id)?.name || "Unknown";
        
        try {
            setError("");
            await axios.delete(`${API_URL}/${id}`);
            addNotification(`Deleted student: ${studentName}`);
            await fetchStudents();
        } catch (err) {
            setError("Unable to delete student.");
        }
    };

    // FILTER & STATS
    const filteredStudents = useMemo(() => {
        const searchText = search.toLowerCase().trim();
        if (!searchText) return students;
        return students.filter((student) =>
            String(student.name || "").toLowerCase().includes(searchText) ||
            String(student.email || "").toLowerCase().includes(searchText) ||
            String(student.course || "").toLowerCase().includes(searchText) ||
            String(student.phone || "").toLowerCase().includes(searchText)
        );
    }, [students, search]);

    const totalStudents = students.length;
    const uniqueCourses = Array.from(new Set(students.map(s => s.course).filter(Boolean)));
    const totalCourses = uniqueCourses.length;
    const averageAge = students.length
        ? (students.reduce((total, s) => total + (Number(s.age) || 0), 0) / students.length).toFixed(1)
        : "0";
    const studentsWithPhone = students.filter(s => s.phone && s.phone.trim() !== "").length;

    // RENDER
    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">🎓</div>
                    <div>
                        <h2>EduManage</h2>
                        <span>Student Portal</span>
                    </div>
                </div>

                <nav className="navigation">
                    <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span>📊</span> Dashboard</button>
                    <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><span>👨‍🎓</span> Students</button>
                    <button className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}><span>📚</span> Courses</button>
                    <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><span>📈</span> Reports</button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="help-card">
                        <div className="help-icon">💡</div>
                        <div>
                            <strong>Need Help?</strong>
                            <p>Manage your students easily.</p>
                        </div>
                    </div>
                    <div className="copyright">© 2026 EduManage</div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p>
                            {activeTab === 'dashboard' && "Manage your students and academic records."}
                            {activeTab === 'students' && "View and manage all registered students."}
                            {activeTab === 'courses' && "View all active courses and enrolled students."}
                            {activeTab === 'reports' && "View academic statistics and overview."}
                        </p>
                    </div>

                    <div className="topbar-actions">
                        <div className="notification-wrapper" ref={notificationRef}>
                            <div className="notification" onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllAsRead(); }}>
                                🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </div>
                            {notifOpen && (
                                <div className="notification-dropdown">
                                    <div className="notif-header">
                                        <strong>Notifications</strong>
                                        <span>{unreadCount} unread</span>
                                    </div>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                                                <div className="notif-icon">🔔</div>
                                                <div className="notif-content"><p>{n.text}</p><small>{n.time}</small></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile" ref={dropdownRef}>
                            <button className="profile-trigger" onClick={() => setMenuOpen(v => !v)}>
                                <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                                <div className="profile-info">
                                    <strong>{user?.name || "User"}</strong>
                                    <small>{user?.role || "USER"}</small>
                                </div>
                            </button>
                            {menuOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-user">
                                        <div className="dropdown-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                                        <div className="dropdown-user-info">
                                            <strong>{user?.name || "User"}</strong>
                                            <small>{user?.email}</small>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="error-message">
                        <span>⚠️</span><span>{error}</span>
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <section className="stats-grid">
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Total Students</span><strong className="stat-number">{totalStudents}</strong></div><div className="stat-icon students">👨‍🎓</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Total Courses</span><strong className="stat-number">{totalCourses}</strong></div><div className="stat-icon courses">📚</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Average Age</span><strong className="stat-number">{averageAge}</strong></div><div className="stat-icon age">🎂</div></div>
                        <div className="stat-card"><div className="stat-content"><span className="stat-label">Contact Available</span><strong className="stat-number">{studentsWithPhone}</strong></div><div className="stat-icon contact">📱</div></div>
                    </section>
                )}

                {activeTab === 'students' && (
                    <section className="students-section">
                        <div className="section-header">
                            <div><h2>Student Directory</h2><p>View and manage all registered students.</p></div>
                            <button className="add-button" onClick={openAddForm}><span>＋</span> Add Student</button>
                        </div>

                        {showForm && (
                            <div className="form-card">
                                <div className="form-header">
                                    <div><h3>{editingId !== null ? "Update Student" : "Add New Student"}</h3></div>
                                    <button className="close-button" onClick={closeForm}>×</button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid">
                                        <div className="input-group"><label>Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
                                        <div className="input-group"><label>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                                        <div className="input-group"><label>Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} /></div>
                                        <div className="input-group"><label>Course *</label><input type="text" name="course" value={formData.course} onChange={handleChange} required /></div>
                                        <div className="input-group full-width"><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} /></div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-button" onClick={closeForm}>Cancel</button>
                                        <button type="submit" className="save-button" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="table-card">
                            <div className="table-toolbar">
                                <div><h3>Student List</h3><span>{filteredStudents.length} students</span></div>
                                <div className="search-box"><span>🔍</span><input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                            </div>

                            {loading ? (
                                <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="empty-state"><div className="empty-icon">👨‍🎓</div><h3>No students yet</h3></div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Course</th><th>Age</th><th>Phone</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td>{index + 1}</td>
                                                    <td><div className="student-cell"><div className="student-avatar">{student.name?.charAt(0)?.toUpperCase()}</div><div><strong>{student.name}</strong></div></div></td>
                                                    <td>{student.email}</td>
                                                    <td><span className="course-badge">{student.course}</span></td>
                                                    <td>{student.age || "-"}</td>
                                                    <td>{student.phone || "-"}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="edit-button" onClick={() => handleEdit(student)}>✏️</button>
                                                            <button className="delete-button" onClick={() => handleDelete(student.id)}>🗑️</button>
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

                {activeTab === 'courses' && (
                    <section className="students-section">
                        <div className="section-header"><div><h2>Active Courses</h2></div></div>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            {uniqueCourses.length === 0 ? (<p>No courses found.</p>) : (
                                uniqueCourses.map((course, index) => (
                                    <div className="stat-card" key={index} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <strong style={{ fontSize: '18px' }}>{course}</strong>
                                        <span>{students.filter(s => s.course === course).length} Students</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'reports' && (
                    <section className="students-section">
                        <div className="section-header"><div><h2>Reports Overview</h2></div></div>
                        <div className="table-card" style={{ padding: '30px' }}>
                            <p>Total Students: <strong>{totalStudents}</strong></p>
                            <p>Total Courses: <strong>{totalCourses}</strong></p>
                            <p>Average Age: <strong>{averageAge}</strong></p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default StudentManagement;