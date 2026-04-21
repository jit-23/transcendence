import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/**
 * The backend redirects here after a successful OAuth flow (Google or 42):
 *   /oauth/callback#token=<jwt>
 *
 * We read the token from the hash, call login(), then forward to /dashboard.
 * If anything is wrong we send the user back to /login with an error flag.
 */
export function OAuthCallback() {
    const { login }  = useContext(AuthContext);
    const navigate   = useNavigate();

    useEffect(() => {
        const hash   = window.location.hash.slice(1);          // strip leading #
        const params = new URLSearchParams(hash);
        const token  = params.get('token');
        const requires2FA = params.get('requires2FA') === 'true';
        const tempToken = params.get('tempToken');

        if (requires2FA && tempToken) {
            navigate('/login', {
                replace: true,
                state: { needs2FA: true, tempToken },
            });
            return;
        }

        if (!token) {
            navigate('/login?error=oauth_failed', { replace: true });
            return;
        }

        login(token)
            .then(() => navigate('/dashboard', { replace: true }))
            .catch(() => navigate('/login?error=oauth_failed', { replace: true }));
    }, []);

    return (
        <div id="center">
            <p style={{ color: 'var(--ink3)', fontSize: '0.875rem' }}>
                Signing you in…
            </p>
        </div>
    );
}
