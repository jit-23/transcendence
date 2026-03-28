
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8081/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.requires2FA) {
                setNeeds2FA(true);
                setTempToken(data.tempToken);
            } else if (res.ok && data.token) {
                await login(data.token);
                navigate('/dashboard');
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async () => {
        console.log("Sending 2FA:", { code, tempToken });
        if (!tempToken) {
            alert("User session lost. Please login again.");
            setNeeds2FA(false);
            return;
        }

        if (!code) {
            alert('Please enter your 2FA code');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8081/users/login2FA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, tempToken }),
            });

            const data = await res.json();

            if (data.token) {
                await login(data.token)
                navigate('/dashboard')
            } else {
                alert(data.error || 'Invalid 2FA code');
            }
        } catch (err) {
            console.error(err);
            alert('Network error during 2FA verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            {!needs2FA ? (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>

                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p>
                        Don't have an account? <a href="/signup">Sign up</a>
                    </p>
                </form>
            ) : (
                <div>
                    <h2>Enter 2FA Code</h2>
                    <input
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handle2FA}
                        disabled={!tempToken || loading}
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            )}
        </div>
    );
}