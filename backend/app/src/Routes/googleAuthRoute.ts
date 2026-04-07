import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = Router();
const prisma = new PrismaClient();

// ─── Configure Google Strategy ────────────────────────────────────────────────
passport.use(new GoogleStrategy(
    {
        clientID:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:  'http://localhost:8081/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            const googleId   = profile.id;
            const email      = profile.emails?.[0]?.value;
            const googleName = profile.displayName ?? 'user';
            const googleAvatar = profile.photos?.[0]?.value ?? null;
            if (!email) return done(new Error('No email from Google'), undefined);

            // Find by googleId first, then fall back to email
            // (handles users who signed up manually before using Google)
            let user = await prisma.my_users.findFirst({
                where: { OR: [{ googleId }, { email }] },
            });

            if (user) {
                // Link googleId if they signed up manually before
                if (!user.googleId) {
                    user = await prisma.my_users.update({
                        where: { id: user.id },
                        data:  { googleId },
                    });
                }
            } else {
                // New user — pick a unique username from their Google name
                let username = googleName.replace(/\s+/g, '').slice(0, 48);
                const taken  = await prisma.my_users.findUnique({ where: { name: username } });
                if (taken) username = `${username}${googleId.slice(-4)}`;

                user = await prisma.my_users.create({
                    data: {
                        name:             username,
                        email,
                        googleId,
                        password:         null,
                        avatar:           googleAvatar,
                        twoFactorEnabled: false,
                        twoFactorSecret:  null,
                    },
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err, undefined);
        }
    }
));

// Passport requires these stubs even though we're not using sessions (JWT only)
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id as any));

// ─── Step 1: redirect to Google consent screen ───────────────────────────────
router.get('/', passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
}));

// ─── Step 2: Google calls back here after user approves ──────────────────────
router.get('/callback',
    passport.authenticate('google', {
        session:         false,
        failureRedirect: 'http://localhost:5173/login?error=google_failed',
    }),
    (req, res) => {
        const user = req.user as any;

        // User has 2FA — issue a short-lived tempToken and send to login page
        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign(
                { userId: user.id, pending2FA: true },
                process.env.JWT_SECRET!,
                { expiresIn: '5m' }
            );
            return res.redirect(
                `http://localhost:5173/login?requires2FA=true&tempToken=${tempToken}`
            );
        }

        // Normal — issue full JWT and send to the frontend callback handler
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    }
);

export default router;