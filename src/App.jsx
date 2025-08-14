import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader, BarChart2, Clock, Users, Search, User, LogOut, PlusCircle, UploadCloud, Trash2, X, ArrowLeft, FileText, TestTube2, MessageSquare, Send, Globe, Edit, Code, Save, XCircle, Settings, Share2 } from 'lucide-react';
import './App.css'; 

// --- NOTEBOOK RENDERER (Placeholder) ---
const JupyterNotebookContentViewer = ({ notebookJson }) => {
    if (!notebookJson || !notebookJson.cells) return <div>No notebook content to display.</div>;
    return (
        <div className="notebook-viewer">
            <pre><code>{JSON.stringify(notebookJson, null, 2)}</code></pre>
        </div>
    );
};

const supabaseUrl = 'https://amepwiogiucmuqynxgrb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZXB3aW9naXVjbXVxeW54Z3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjQ2OTgsImV4cCI6MjA2ODQwMDY5OH0.-y2hIxFXch3nW8WnXRp0iPEKRUov7jAhczrbmK9o8-o';
const supabase = createClient(supabaseUrl, supabaseKey);


// --- NOTEBOOK ANALYSIS LOGIC (Placeholder) ---
const analyzeNotebookWithLLM = async (rawNotebookContent) => {
    console.log("Analyzing notebook (mock)...");
    return {
        title: "Mock Analyzed Project", description: "This is a mock description.",
        methodology: "Mock methodology.", tags: ["mock", "analysis"],
        visualizations: [], accuracy: Math.random(),
    };
};

// --- UI Components ---
const LoadingSpinner = () => <div className="loading-spinner-overlay"><Loader className="animate-spin" size={48} color="var(--primary-color)" /></div>;
const Badge = ({ children, className }) => <span className={`badge ${className || ''}`}>{children}</span>;

function AppHeader({ onNavigate, user }) {
    return (
        <header className="app-header">
            <div className="logo" onClick={() => onNavigate('dashboard')}><BarChart2 size={28} /><h1>Insight Grid</h1></div>
            <nav className="main-nav">
                <button onClick={() => onNavigate('timeline')}><Clock size={16} /> Timeline</button>
                <button onClick={() => onNavigate('users')}><Users size={16} /> Discover</button>
                <button onClick={() => onNavigate('search')}><Search size={16} /> Search</button>
                <button onClick={() => onNavigate('profile', user.id)}><User size={16} /> My Profile</button>
                <button onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Logout</button>
            </nav>
        </header>
    );
}

const AuthComponent = ({ setError, error }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLogin, setIsLogin] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = isLogin ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <div className="logo"><BarChart2 size={40} /></div>
                <h2 className="auth-title">Welcome to Insight Grid</h2>
                <p className="auth-subtitle">Your space for data science showcases.</p>
                <form onSubmit={handleAuth}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" />
                    <button type="submit" disabled={loading} className="auth-button">{loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}</button>
                    {error && <p className="auth-error">{error}</p>}
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle">{isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}</button>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onClick, onDelete }) => {
    const handleDelete = onDelete ? (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) onDelete(project.id);
    } : null;

    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-card-header"><h3 className="project-card-title">{project.title}</h3>{onDelete && <button onClick={handleDelete} className="delete-button"><Trash2 size={16} /></button>}</div>
            <p className="project-card-description">{project.description?.substring(0, 100)}{project.description?.length > 100 ? '...' : ''}</p>
            <div className="tag-container">{(project.tags || []).map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
            {project.accuracy != null && (<div className="project-card-accuracy"><strong>Accuracy:</strong> {(project.accuracy * 100).toFixed(2)}%</div>)}
        </div>
    );
};

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [methodology, setMethodology] = React.useState('');
    const [accuracy, setAccuracy] = React.useState('');
    const [tags, setTags] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const projectData = { title, description, methodology, accuracy: accuracy ? parseFloat(accuracy) : null, tags: tags.split(',').map(tag => tag.trim()).filter(t => t), visualizations: [] };
        await onAddProject(projectData);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay"><div className="modal-content"><form onSubmit={handleSubmit}><div className="modal-header"><h3>Add New Project</h3><button type="button" onClick={onClose} className="close-button"><X size={20} /></button></div><div className="modal-body"><input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required /><textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required /><textarea placeholder="Methodology" value={methodology} onChange={e => setMethodology(e.target.value)} /><input type="number" step="0.01" min="0" max="1" placeholder="Accuracy (e.g., 0.96)" value={accuracy} onChange={e => setAccuracy(e.target.value)} /><input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} /></div><div className="modal-footer"><button type="button" onClick={onClose} className="button-secondary">Cancel</button><button type="submit" disabled={loading} className="button-primary">{loading ? 'Adding...' : 'Add Project'}</button></div></form></div></div>
    );
};

const Dashboard = ({ user, onSelectProject, onNavigate }) => {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) console.error('Error fetching projects:', error); else setProjects(data);
        setLoading(false);
    };

    const addProject = async (projectData, rawNotebookContent = null) => {
        const { data, error } = await supabase.from('projects').insert([{ ...projectData, user_id: user.id, notebook_content: rawNotebookContent ? JSON.parse(rawNotebookContent) : null }]).select();
        if (error) alert('Error adding project: ' + error.message); else if (data) setProjects([data[0], ...projects]);
    };

    const deleteProject = async (projectId) => {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) alert('Error deleting project: ' + error.message); else setProjects(projects.filter(p => p.id !== projectId));
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawContent = e.target.result;
            try { JSON.parse(rawContent); } catch (parseError) { alert("Invalid .ipynb file."); setIsAnalyzing(false); return; }
            const analyzedData = await analyzeNotebookWithLLM(rawContent);
            if (analyzedData) await addProject(analyzedData, rawContent); else alert("Failed to analyze notebook.");
            setIsAnalyzing(false);
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    return (
        <><AppHeader onNavigate={onNavigate} user={user} /><div className="page-container"><div className="dashboard-header"><div className="welcome-message"><h2>Welcome back, {user.email.split('@')[0]}!</h2><p>Here's an overview of your projects.</p></div><div className="dashboard-stats"><div className="stat-card"><h3>{projects.length}</h3><p>Total Projects</p></div><div className="stat-card"><h3>{projects.length > 0 && projects.some(p => p.accuracy) ? `${(projects.reduce((acc, p) => acc + (p.accuracy || 0), 0) / projects.filter(p => p.accuracy).length * 100).toFixed(1)}%` : 'N/A'}</h3><p>Avg. Accuracy</p></div></div></div><div className="dashboard-actions"><button onClick={() => setIsModalOpen(true)} className="action-button"><PlusCircle size={16} /> Add Manually</button><input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept=".ipynb" /><button onClick={() => fileInputRef.current.click()} className="action-button" disabled={isAnalyzing}>{isAnalyzing ? <><Loader size={16} className="animate-spin" /> Analyzing...</> : <><UploadCloud size={16} /> Analyze Notebook</>}</button></div><main className="projects-grid">{loading ? <p>Loading projects...</p> : projects.length > 0 ? projects.map(project => (<ProjectCard key={project.id} project={project} onClick={() => onSelectProject(project.id)} onDelete={deleteProject} />)) : <p>No projects yet. Add one!</p>}</main><AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddProject={addProject} /></div></>
    );
};

const ProjectDetailPage = ({ projectId, onNavigate, user }) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('projects').select('*, profiles (id, username)').eq('id', projectId).single();
            if (error) console.error("Error fetching project:", error);
            else {
                setProject(data);
                setEditableProject({ title: data.title, description: data.description, methodology: data.methodology, tags: (data.tags || []).join(', ') });
            }
            setLoading(false);
        };
        fetchProjectData();
    }, [projectId]);

    const handleUpdateProject = async () => {
        setIsSaving(true);
        const { data, error } = await supabase.from('projects').update({ title: editableProject.title, description: editableProject.description, methodology: editableProject.methodology, tags: editableProject.tags.split(',').map(t => t.trim()).filter(Boolean) }).eq('id', projectId).select('*, profiles (id, username)').single();
        if (error) alert('Error updating project: ' + error.message);
        else { setProject(data); setIsEditing(false); }
        setIsSaving(false);
    };

    const handleInputChange = (e) => setEditableProject(prev => ({ ...prev, [e.target.name]: e.target.value }));

    if (loading) return <LoadingSpinner />;
    if (!project) return <div>Project not found.</div>;

    const isOwner = user.id === project.user_id;

    return (
        <><AppHeader onNavigate={onNavigate} user={user} /><div className="page-container"><button onClick={() => onNavigate('dashboard')} className="back-button"><ArrowLeft size={16} /> Back</button><div className="project-detail-header">{isEditing ? <input name="title" value={editableProject.title} onChange={handleInputChange} className="title-input" /> : <h1>{project.title}</h1>}{isOwner && !isEditing && <button onClick={() => setIsEditing(true)} className="action-button"><Edit size={16} /> Edit</button>}</div><p className="author-info">By: {project.profiles?.username || 'Unknown'}</p>{isEditing ? (<div className="edit-form"><label>Description</label><textarea name="description" value={editableProject.description} onChange={handleInputChange} rows="6" /><label>Methodology</label><textarea name="methodology" value={editableProject.methodology} onChange={handleInputChange} rows="4" /><label>Tags (comma-separated)</label><input name="tags" value={editableProject.tags} onChange={handleInputChange} /><div className="edit-actions"><button onClick={handleUpdateProject} className="button-primary" disabled={isSaving}>{isSaving ? <><Loader size={16} className="animate-spin"/> Saving...</> : <><Save size={16}/> Save</>}</button><button onClick={() => setIsEditing(false)} className="button-secondary"><XCircle size={16}/> Cancel</button></div></div>) : (<div className="project-content"><div className="content-section"><h3><FileText size={18}/> Description</h3><p>{project.description}</p></div><div className="content-section"><h3><TestTube2 size={18}/> Methodology</h3><p>{project.methodology}</p></div><div className="content-section"><h3><Code size={18}/> Tags</h3><div className="tag-container">{(project.tags || []).map(tag => <Badge key={tag}>{tag}</Badge>)}</div></div>{project.notebook_content && <div className="content-section"><h3>Notebook Preview</h3><JupyterNotebookContentViewer notebookJson={project.notebook_content} /></div>}</div>)}</div></>
    );
};

const EditProfilePage = ({ user, onNavigate }) => {
    const [profile, setProfile] = useState({ username: '', title: '', bio: '' });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile({ username: data.username || '', title: data.title || '', bio: data.bio || '' });
            else if (error && error.code !== 'PGRST116') console.error("Error fetching profile:", error);
            setLoading(false);
        };
        fetchProfile();
    }, [user.id]);

    const handleInputChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await supabase.from('profiles').update({ username: profile.username, title: profile.title, bio: profile.bio, updated_at: new Date() }).eq('id', user.id);
        if (error) alert('Error updating profile: ' + error.message);
        else { alert('Profile updated successfully!'); onNavigate('profile', user.id); }
        setIsSaving(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <><AppHeader onNavigate={onNavigate} user={user} /><div className="page-container"><button onClick={() => onNavigate('profile', user.id)} className="back-button"><ArrowLeft size={16} /> Back to Profile</button><div className="edit-profile-form"><h2>Edit Your Profile</h2><form onSubmit={handleUpdateProfile}><div className="form-group"><label htmlFor="username">Username</label><input id="username" name="username" value={profile.username} onChange={handleInputChange} placeholder="e.g., dataviz_guru" /></div><div className="form-group"><label htmlFor="title">Title / Headline</label><input id="title" name="title" value={profile.title} onChange={handleInputChange} placeholder="e.g., Senior Data Scientist" /></div><div className="form-group"><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" value={profile.bio} onChange={handleInputChange} rows="5" placeholder="Tell us about yourself..."/></div><div className="edit-actions"><button type="submit" className="button-primary" disabled={isSaving}>{isSaving ? <><Loader size={16} className="animate-spin"/> Saving...</> : <><Save size={16}/> Save Profile</>}</button></div></form></div></div></>
    );
};

const UserProfilePage = ({ userId, onNavigate, currentUser }) => {
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfile(profileData);
            const { data: projectsData } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
            setProjects(projectsData || []);
            setLoading(false);
        };
        fetchData();
    }, [userId]);

    if (loading) return <LoadingSpinner />;
    if (!profile) return <div>User not found.</div>;

    const isOwner = currentUser.id === userId;

    return (
        <><AppHeader onNavigate={onNavigate} user={currentUser} /><div className="page-container"><div className="profile-header"><div className="profile-info"><h2>{profile.username || 'Anonymous User'}</h2><p className="profile-title">{profile.title || 'Data Enthusiast'}</p><p className="profile-bio">{profile.bio || 'No bio provided.'}</p></div>{isOwner && (<div className="profile-actions"><button onClick={() => setIsSettingsOpen(true)} className="action-button"><Settings size={16}/> Settings</button><button onClick={() => onNavigate('editProfile')} className="action-button"><Edit size={16}/> Edit Profile</button></div>)}</div><div className="profile-content"><h3>Projects</h3><div className="projects-grid">{projects.length > 0 ? projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => onNavigate('project', p.id)} />) : <p>This user hasn't added any projects yet.</p>}</div></div></div>{isOwner && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={currentUser} />}</>
    );
};

const TimelinePage = ({ user, onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('projects').select('*, profiles (username, id)').order('created_at', { ascending: false }).limit(50);
            if (error) console.error("Timeline fetch error:", error); else setProjects(data);
            setLoading(false);
        };
        fetchTimeline();
    }, []);

    return (
        <><AppHeader onNavigate={onNavigate} user={user} /><div className="page-container"><div className="timeline-header"><h2>Timeline</h2><p>See the latest projects from the community.</p></div>{loading ? <LoadingSpinner /> : (<div className="timeline-feed">{projects.map(project => (<div key={project.id} className="timeline-item"><ProjectCard project={project} onClick={() => onNavigate('project', project.id)} /><p className="timeline-author">Posted by <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('profile', project.profiles.id)}}>{project.profiles?.username || 'a user'}</a></p></div>))}</div>)}</div></>
    );
};

const SearchPage = ({ user, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ projects: [], users: [] });
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        const { data: projects } = await supabase.from('projects').select('*').textSearch('title', `'${query}'`);
        const { data: users } = await supabase.from('profiles').select('*').textSearch('username', `'${query}'`);
        setResults({ projects: projects || [], users: users || [] });
        setLoading(false);
    };

    return (
        <><AppHeader onNavigate={onNavigate} user={user} /><div className="page-container"><div className="search-header"><h2>Search</h2></div><form onSubmit={handleSearch} className="search-form"><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for projects or users..." /><button type="submit" disabled={loading}>{loading ? 'Searching...' : <Search size={18}/>}</button></form>{loading ? <LoadingSpinner /> : (<div className="search-results"><div className="results-section"><h3>Projects</h3><div className="projects-grid">{results.projects.length > 0 ? results.projects.map(p => <ProjectCard key={p.id} project={p} onClick={() => onNavigate('project', p.id)} />) : <p>No projects found.</p>}</div></div><div className="results-section"><h3>Users</h3><div className="user-list">{results.users.length > 0 ? results.users.map(u => (<div key={u.id} className="user-card" onClick={() => onNavigate('profile', u.id)}><User size={24} /><div className="user-info"><h4>{u.username}</h4><p>{u.title}</p></div></div>)) : <p>No users found.</p>}</div></div></div>)}</div></>
    );
};

const SettingsModal = ({ isOpen, onClose, user }) => {
    const accentColors = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6'];
    const [activeColor, setActiveColor] = useState(localStorage.getItem('accentColor') || accentColors[0]);
    const [copied, setCopied] = useState(false);

    const profileUrl = `${window.location.origin}/profile/${user.id}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const changeAccentColor = (color) => {
        document.documentElement.style.setProperty('--primary-color', color);
        localStorage.setItem('accentColor', color);
        setActiveColor(color);
    };
    
    useEffect(() => {
        const savedColor = localStorage.getItem('accentColor');
        if (savedColor) document.documentElement.style.setProperty('--primary-color', savedColor);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>Settings</h3><button type="button" onClick={onClose} className="close-button"><X size={20} /></button></div><div className="modal-body"><div className="setting-item"><span>Accent Color</span><div className="color-picker">{accentColors.map(color => (<button key={color} style={{ backgroundColor: color }} className={`color-swatch ${activeColor === color ? 'active' : ''}`} onClick={() => changeAccentColor(color)} />))}</div></div><div className="setting-item"><span>Share Profile</span><div className="share-link-container"><input type="text" readOnly value={profileUrl} /><button onClick={copyToClipboard}>{copied ? 'Copied!' : <Share2 size={16}/>}</button></div></div></div></div></div>
    );
};

// --- Main App Component (Router) ---
export default function App() {
    const [session, setSession] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [view, setView] = useState({ name: 'dashboard', id: null });

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            
            // Handle URL-based routing on initial load
            if (session) {
                const path = window.location.pathname.split('/');
                if (path[1] === 'profile' && path[2]) {
                    setView({ name: 'profile', id: path[2] });
                }
            }
            setIsAuthLoading(false);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
        return () => subscription.unsubscribe();
    }, []);

    const handleNavigate = (page, id = null) => {
        const newPath = id ? `/${page}/${id}` : `/${page}`;
        window.history.pushState({}, '', newPath);
        setView({ name: page, id });
    };

    let content;

    if (isAuthLoading) {
        content = <LoadingSpinner />;
    } else if (!session) {
        content = <AuthComponent setError={setAuthError} error={authError} />;
    } else {
        switch (view.name) {
            case 'project':
                content = <ProjectDetailPage projectId={view.id} onNavigate={handleNavigate} user={session.user} />;
                break;
            case 'profile':
                content = <UserProfilePage userId={view.id} onNavigate={handleNavigate} currentUser={session.user} />;
                break;
            case 'editProfile':
                content = <EditProfilePage onNavigate={handleNavigate} user={session.user} />;
                break;
            case 'timeline':
                content = <TimelinePage user={session.user} onNavigate={handleNavigate} />;
                break;
            case 'search':
                content = <SearchPage user={session.user} onNavigate={handleNavigate} />;
                break;
            default:
                content = <Dashboard user={session.user} onSelectProject={(id) => handleNavigate('project', id)} onNavigate={handleNavigate} />;
                break;
        }
    }

    return <>{content}</>;
}
