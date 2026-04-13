import { useRef, useState } from 'react';

// ── 4 default avatars as inline SVG data URLs ─────────────────────────────────
// Each is a simple geometric face — no external assets needed
export const DEFAULT_AVATARS: Record<string, string> = {
    'default:1': `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#1a1a1a"/>
  <circle cx="40" cy="32" r="14" fill="#444"/>
  <ellipse cx="40" cy="64" rx="20" ry="12" fill="#444"/>
</svg>`)}`,

    'default:2': `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#111"/>
  <rect x="20" y="18" width="40" height="40" rx="6" fill="#555"/>
  <ellipse cx="40" cy="70" rx="22" ry="10" fill="#555"/>
</svg>`)}`,

    'default:3': `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#0d0d0d"/>
  <polygon points="40,14 62,54 18,54" fill="#555"/>
  <ellipse cx="40" cy="68" rx="20" ry="9" fill="#555"/>
</svg>`)}`,

    'default:4': `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#141414"/>
  <path d="M40 16 L56 28 L50 48 L30 48 L24 28 Z" fill="#555"/>
  <ellipse cx="40" cy="66" rx="20" ry="10" fill="#555"/>
</svg>`)}`,
};

// ── Resolve what to actually display as <img src> ─────────────────────────────
export function resolveAvatarSrc(avatar: string | null | undefined, name: string): string | null {
    if (!avatar) return null;
    if (avatar.startsWith('default:')) return DEFAULT_AVATARS[avatar] ?? null;
    return avatar; // base64 upload
}

// ── <Avatar> display component ────────────────────────────────────────────────
interface AvatarProps {
    avatar?: string | null;
    name: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function Avatar({ avatar, name, size = 40, className = '', style }: AvatarProps) {
    const src     = resolveAvatarSrc(avatar, name);
    const initials = name.slice(0, 2).toUpperCase();

    const base: React.CSSProperties = {
        width: size, height: size,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
    };

    if (src) {
        return (
            <div className={className} style={base}>
                <img src={src} alt={name} width={size} height={size}
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }

    return (
        <div className={className} style={{
            ...base,
            background: 'var(--ink)',
            color: 'var(--bg)',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.28,
        }}>
            {initials}
        </div>
    );
}

// ── <AvatarPicker> full picker panel ─────────────────────────────────────────
interface AvatarPickerProps {
    current: string | null | undefined;
    name: string;
    onSave: (avatar: string) => Promise<void>;
    onCancel: () => void;
}

export function AvatarPicker({ current, name, onSave, onCancel }: AvatarPickerProps) {
    const [selected, setSelected] = useState<string>(current ?? 'default:1');
    const [preview, setPreview]   = useState<string | null>(null);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const fileRef                 = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPG, PNG or WebP allowed');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB');
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setPreview(base64);
            setSelected(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await onSave(selected);
        } catch (err: any) {
            setError(err.message ?? 'Failed to save avatar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar avatar={selected} name={name} size={64} />
                <div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500, marginBottom: 2 }}>
                        Preview
                    </p>
                    <p style={{ fontSize: '0.74rem', color: 'var(--ink3)' }}>
                        This is how others will see you.
                    </p>
                </div>
            </div>

            {/* Default options */}
            <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10 }}>
                    Default Avatars
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    {Object.keys(DEFAULT_AVATARS).map((key) => (
                        <button
                            key={key}
                            onClick={() => { setSelected(key); setPreview(null); }}
                            style={{
                                padding: 3,
                                borderRadius: '50%',
                                border: selected === key
                                    ? '2px solid var(--ink)'
                                    : '2px solid transparent',
                                background: 'none',
                                cursor: 'pointer',
                                transition: 'border-color 0.15s ease',
                            }}
                        >
                            <img
                                src={DEFAULT_AVATARS[key]}
                                alt={key}
                                width={44}
                                height={44}
                                style={{ borderRadius: '50%', display: 'block' }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload */}
            <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10 }}>
                    Upload Your Own
                </p>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFile}
                    style={{ display: 'none' }}
                />
                <button
                    className="btn btn-ghost"
                    onClick={() => fileRef.current?.click()}
                    style={{ fontSize: '0.78rem' }}
                >
                    Choose image (JPG / PNG, max 2MB)
                </button>
                {preview && (
                    <p style={{ marginTop: 6, fontSize: '0.74rem', color: 'var(--success)' }}>
                        ✓ Image loaded — click Save to apply
                    </p>
                )}
            </div>

            {error && (
                <div className="msg msg-error">{error}</div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Avatar'}
                </button>
                <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
            </div>
        </div>
    );
}