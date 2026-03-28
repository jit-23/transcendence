import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function SignupForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res  = await fetch('http://localhost:8081/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/login');
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="center">
            <div className="card fade-up">
                <div className="auth-header">
                    <div className="logo">
                        <div className="logo-mark">W</div>
                        whiteboard
                    </div>
                    <p className="auth-subtitle">Create your workspace account</p>
                </div>

                {error && <div className="msg msg-error" style={{ marginBottom: 16 }}>{error}</div>}

                <form onSubmit={handleSubmit} className="form-stack">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="yourname"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="at least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}
                            style={{ marginTop: 4 }}>
                        {loading ? 'Creating account...' : 'Create account →'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;