import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// Lives at /auth/callback
// Backend redirects here with ?token=JWT after successful Google login
export function AuthCallback() {
    const [params]  = useSearchParams();
    const { login } = useContext(AuthContext);
    const navigate  = useNavigate();

    useEffect(() => {
        const token      = params.get('token');
        const requires2FA = params.get('requires2FA');
        const tempToken  = params.get('tempToken');
        const error      = params.get('error');

        if (error) {
            navigate('/login?error=' + error);
            return;
        }

        // Google user has 2FA — hand off to login page with tempToken pre-filled
        if (requires2FA && tempToken) {
            navigate(`/login?requires2FA=true&tempToken=${tempToken}`);
            return;
        }

        if (token) {
            login(token).then(() => navigate('/dashboard'));
            return;
        }

        navigate('/login?error=unknown');
    }, []);

    return (
        <div id="center">
            <div style={{ textAlign: 'center' }}>
                <p style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '1.1rem',
                    color: 'var(--ink2)',
                    marginBottom: 8,
                }}>
                    Signing you in...
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink3)' }}>
                    You'll be redirected in a moment.
                </p>
            </div>
        </div>
    );
}