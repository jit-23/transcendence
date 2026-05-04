Nome do projeto: ft_transcendence 

## Team

The team had by-weekly meets to discuss every subject. with the participants of the team witht he responsabilities

**paulo-do** — Product Owner: defines the product vision, maintains the backlog, validates completed work, communicates with evaluators.

**fde-jesu** — Project Manager: organizes meetings, tracks progress and deadlines, handles blockers and team coordination.

**filferna** — Technical Lead: architecture decisions, tech stack choices, code quality, reviews critical changes.

**brfernand** / **ptorrao** — Developers: implement features, code reviews, testing, documentation.

 

---

This is a full-stack web app built for the completion of the 42 Common Core . 

this project is a platform with full interaction with other users,
it has friend and group system. with the main atraction being a framnework where you are able to
draw, write and make schemes for projects, with the intention to mimic miro.com and excalidraw.com.

The User is able to draw with full creativity alone, or with friends. the User has a capacity to create a max of 3 canvas, however he can be a participant of a undefined number of other canvas by invitation.

The sign up can be made by default with a gmail and a password, by google or 42 api's.

We also have a feature to make sign in by qr code.


The frontend is made with React 18, TypeScript, Tailwind CSS.
The realtime actions are made with Socket.io ans the canvas is made with the library p5.js

The backend is made with Express 5 with typeScript, sockets.io.
The database associated with the backend is PostgreSQL 13 , and its connected to the backend with Prisma as ORM.

In the Topic of Devops we use Prometheus(used to analise the metrics endpoint every 15 secs)
and Grafana(to visualize the data in question)

-----------

The entire project is running in containers:

Image    | Port(machine:container)

Frontend : 5173:5173
Backend  : 8081:8081
Database : 5432:5432
Prometeus: 9090:9090
Grafana  : 3000:3000

The transcendence has a file type ".env" . 
But for the project we can't just reveal our secrects, so we will have a empty .env and copy the secrects to it:

    cp .env.example .env    # fill in your secrets
    make up                 # builds images and starts everything

the project runs in HTTPS protocol, and the website will run in the 5173 port.

---

Makefile commands

    make up            — start all containers (auto-detects LAN IP)
    make down          — stop and remove containers
    make stop          — stop containers, keep them around for a faster restart
    make restart       — stop + start without rebuilding
    make build         — rebuild images without starting
    make logs          — follow combined logs of all containers
    make ps            — show container status and ports
    make clean         — stop containers and wipe all volumes (database included)
    make clean-certs   — delete the generated TLS cert files
    make clean-all     — clean + clean-certs

---

Docker Compose services

The docker-compose.yml defines five services all connected to a single bridge network called observability. Services reference each other by service name — the backend connects to the database at hostname db, Prometheus scrapes backend_server, and so on. Nothing is exposed to external networks beyond the ports mapped to the host.

The db service runs PostgreSQL 13.2 and has a health check using pg_isready. It checks every 5 seconds with a 30-second start period. The backend_server service depends on db with condition: service_healthy, which means Docker Compose will not start the backend until the database is actually ready to accept connections — not just "started", but healthy. This prevents the race condition where Prisma tries to run db push before Postgres is up.

backend_server builds from ./backend, runs start.sh as its entrypoint (which generates the TLS cert, runs prisma db push, then starts nodemon), and exposes port 8081. The certs/ directory is mounted as a volume so the generated certificate persists on the host and gets shared with the frontend.

frontend_server builds from ./frontend, runs npm install && npm run dev, and mounts both the frontend source code and the certs/ directory (read-only). Because the source is mounted as a volume, code changes on the host are immediately reflected inside the container without a rebuild — Vite's HMR picks them up. The same is true for the backend with nodemon.

prometheus and grafana are off-the-shelf images. Prometheus reads its config from prometheus.yml at the root of the repo. Grafana reads datasource and dashboard provisioning from grafana/provisioning/ and grafana/dashboards/, so everything is pre-wired on first boot — you don't need to configure anything in the UI.

If you need to rebuild just one service after changing its code, you can do docker compose build backend_server followed by docker compose up -d backend_server, or just run make down && make up to rebuild everything. Because the source is volume-mounted, you usually don't need to rebuild the image at all during development — just save your file and nodemon or Vite will pick it up.

---

Environment variables

All variables live in .env at the project root and get injected into the containers by docker-compose.yml. HOST controls the hostname used in the TLS cert SAN and in CORS (defaults to localhost). POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB and DATABASE_URL configure the database connection. JWT_SECRET signs all tokens — change it in any real deployment. GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI and FORTYTWO_CLIENT_ID/SECRET/REDIRECT_URI are the OAuth app credentials registered with each provider. VITE_API_URL is the full backend URL the React app uses at runtime, VITE_HTTPS enables HTTPS on the Vite dev server. CORS_ORIGIN adds an extra allowed origin to the backend allowlist. FRONTEND_URL is where OAuth callbacks redirect after a successful login. SSL_CERT_PATH and SSL_KEY_PATH point to the TLS certificate and key inside the container.

---

Authentication and JWT

Regular signup stores a bcrypt hash with 10 salt rounds, passwords never touch the database in plaintext. On login the backend returns a JWT token with a 1-hour expiry  and it's stored in sessionStorage on the frontend. Every protected route extracts and verifies the token before the controller runs.

2FA is TOTP( Time-based One-Time Password) . When a user enables it, the backend generates a base32 secret and returns a QR code they scan with any authenticator app. From that point, login returns a short-lived pending token (5-minute expiry, { userId, pending2FA: true }) that can only be used against POST /users/login2FA. Once the user submits their 6-digit code and it verifies against the stored secret with a ±30-second window, a full JWT is issued. That endpoint is rate-limited to 5 attempts per 15 minutes per IP to slow down brute force.

OAuth with Google and 42 School both use the Authorization Code Grant. When the user clicks "login with Google", the backend generates a cryptographically random 48-hex-char state value, stores it in a short-lived httpOnly sameSite=lax cookie, and redirects to the provider. On callback it reads the state cookie and compares it to the query parameter to prevent CSRF, then exchanges the code for an access token, fetches the user profile, and upserts the user in the database using googleId or fortyTwoId as the unique key. The hash fragment keeps the token out of the frontend server's access logs. If the provider's display name is already taken.

---

### Developer of Google implementation, friend aplications, login, authentications

# dev: paulo-do

# Authentication & User Features Documentation

## Google Login
Users can sign up or log in using their Google account.
- The backend uses OAuth2 with Google's consent screen and retrieves user profile info such as email, name, and avatar.
- If the email already exists, the Google account is linked to that user; otherwise, a new user is created.
- The frontend provides a button that redirects to `/users/auth/google`.
- After authentication, the user is redirected back to the frontend and logged in.

## 42 Login
Users can sign up or log in using their 42 (Intra) account.
- The backend uses OAuth2 with 42's API to fetch user info such as email, login, display name, and avatar.
- If the email already exists, the 42 account is linked to that user; otherwise, a new user is created.
- The frontend provides a button that redirects to `/users/auth/42`.
- After authentication, the user is redirected back to the frontend and logged in.

## Two-Factor Authentication (2FA)
Users can enable 2FA in their dashboard.
- The backend uses `speakeasy` and `qrcode` to generate a secret and QR code.
- After scanning the QR code with an authenticator app, users confirm by entering a 6-digit code.
- On login, if 2FA is enabled, users must enter the code from their authenticator app.
- 2FA status is stored in the database using `twoFactorEnabled` and `twoFactorSecret`.

## Block Users
Users can block and unblock other users from their profile or the blocked users page.
- Blocked users cannot send messages or friend requests.
- The backend manages block relations in the `user_block` table.
- The frontend provides a UI to view and manage blocked users at `/profile/blocked`.

## Avatar
Users can set or update their avatar during signup or in their profile settings.
- Avatars can be uploaded manually or set via OAuth providers like Google and 42.
- Avatar URLs are stored in the database and displayed throughout the app.

## Profile
Each user has a profile page showing their username, avatar, and other public info.
- Users can update their profile in the dashboard.
- Profile updates require current password verification for security.

## CSS Frameworks
The frontend uses [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- Custom themes and variables are defined in `tailwind.config.ts` and CSS files.
- [Autoprefixer](https://github.com/postcss/autoprefixer) is used for browser compatibility.
- UI components are built with React and styled using Tailwind utility classes.

---

## Developer of the infrastructure networking and system arquictecture    

# Dev: fde-jesu

# Infrastructure & Real-time

## Dockerfiles

### Backend
`backend/Dockerfile` uses `node:22-alpine` and installs `openssl` so `start.sh` can generate the self-signed cert. The build installs deps, copies source, runs `prisma generate` and compiles TypeScript. At runtime `start.sh` generates or reuses the cert, runs `prisma db push`, then starts `nodemon`.

### Frontend
`frontend/Dockerfile` uses `node:20-alpine`, installs deps and exposes port 5173. In Compose the source folder is volume-mounted over the image, so Vite HMR picks up file changes on the host with no image rebuild needed. Compose overrides the CMD to re-run `npm install` on start so new packages in `package.json` are picked up automatically.

## docker-compose.yml

All five services are on a bridge network called `observability`. They reach each other by service name (`db`, `backend_server`, etc.) — nothing extra is exposed to the outside beyond the mapped ports.

- `frontend_server` — port 5173, mounts source and certs
- `backend_server` — port 8081, waits for `db` to pass its health check before starting
- `db` (postgres:13.2) — port 5432, `pg_isready` health check every 5 s
- `prometheus` — port 9090, reads `prometheus.yml` and `prometheus-web.yml`, TLS via shared certs volume
- `grafana` — port 3000, HTTPS on, datasource and dashboards pre-wired from `grafana/provisioning/`

`HOST` in `.env` controls the TLS SAN and CORS origin. Defaults to `localhost`; set it to your LAN IP if you need other devices to connect.

## Sockets

The socket server is in `backend/app/src/sockets/chatSocket.ts`, exported as `setupChatSocket(server, prisma)` and attached to the same HTTPS server as Express.

On connect the server reads `socket.handshake.auth.username`, looks the user up in the DB, marks them online in the presence store, and joins them to all their conversation rooms. If this is their first socket (offline → online), accepted friends get a `friend-presence` event. On disconnect the reverse happens and canvas rooms are cleaned up — null cursor and null draft are broadcast so collaborators see them leave.

**Chat events**

- `conversation-message` — saves the message to the DB, broadcasts it to the whole conversation room
- `conversation-typing` — forwarded to the room, not persisted
- `private-message` / `typing` — direct socket-to-socket by username

## Canvas events

Each canvas has a room `canvas:<id>`. Only one active session per canvas per user is allowed — a second tab gets `canvas-entry-blocked`.

- `join-canvas` — checks access via Prisma, registers the session, joins the room, emits `canvas-presence` to the room
- `canvas-shape-commit` — broadcasts a finished shape and clears the sender's draft for other users
- `canvas-draft` — live in-progress stroke visible to collaborators while drawing
- `canvas-cursor` — broadcasts pointer position, or `visible: false` when the pointer leaves
- `canvas-clear` / `canvas-undo` / `canvas-redo` / `canvas-background` — synced to the whole room
- `canvas-shape-delete` — broadcasts deletion by shape ID array
- `canvas-presence` — sent by the server whenever room membership changes
- `canvas-invite-received` / `canvas-invite-accepted` — sent directly to the target user

---

WebSockets

Socket.io is attached to the same https.Server instance as Express, so the WebSocket handshake and the REST API share port 8081 and the same TLS certificate. The client connects with transports: ["polling"] instead of upgrading to a WebSocket, because browsers refuse to upgrade over untrusted self-signed certificates — HTTP long-polling over HTTPS gives the same encryption without that problem.

Chat events: conversation-message is broadcast to all participants of a conversation when a new message is saved, and conversation-typing is forwarded to all other participants when a user starts or stops typing.



Canvas events: clients join and leave named Socket.io rooms per canvas. canvas-draw broadcasts stroke data to all other members of the room in real time. canvas-presence sends the updated collaborator list whenever membership changes. canvas-entry-blocked is sent if the same user tries to open the same canvas in more than one tab. canvas-invite-received and canvas-invite-accepted notify the relevant users in real time when invitations are sent or accepted.

### Developer of the Canvas

Role: Frontend Developer
# Dev: ptorrao-

Description:
As a Frontend Developer, I was responsible for designing and implementing the interactive canvas feature for a web application. This involved creating a robust and user-friendly drawing tool using React and TypeScript. Key contributions include:

### Canvas Drawing Functionality:
- Developed the core canvas functionality, enabling users to draw and manipulate various shapes such as lines, arrows, rectangles, circles, diamonds, and text.
- Implemented advanced drawing tools, including freehand drawing, highlighter, and eraser.
- Added support for shape customization, such as resizing, rotation, and color adjustments.

### Shape Management:
- Designed a system to manage different shape types with properties like position, size, color, stroke weight, and rotation.
- Created utility functions for shape manipulation, including snapping to angles, resizing, and maintaining aspect ratios.

### User Interface Enhancements:
- Built a toolbar for selecting tools, colors, and other drawing options.
- Integrated a color picker component for customizing background and line colors.
- Designed intuitive controls for zooming, panning, and managing the canvas view.

### State Management:
- Implemented state management for the canvas, including undo/redo functionality and shape history.
- Developed a system to save and restore canvas snapshots, ensuring a seamless user experience.

### Performance Optimization:
- Optimized rendering performance for handling multiple shapes and interactions.
- Ensured smooth interactions, even with complex shapes and high user activity.

This work highlights my expertise in building interactive and dynamic front-end features, focusing on usability, performance, and maintainability.

---

Observability
### Developer of the language traduction funtionabilities

# Dev: brfernand

Internationalization (i18n)

The frontend uses i18next with react-i18next and the browser language detector plugin. The setup lives in frontend/src/components/i18n.tsx.

The app supports three languages: English (en), Spanish (es), and Portuguese (pt). The default language is English. On first load, i18next-browser-languagedetector reads the browser's locale and picks the closest supported language automatically.

All translatable strings are stored in a single flat resource object per language, keyed by a prefix that identifies the component they belong to:

- ERR_ — generic error messages
- TB_ — top navigation bar
- HO_ — home / landing page
- SU_ — sign-up flow
- LI_ — login flow
- DB_ — dashboard
- TFC_ — two-factor authentication card

Components call the useTranslation hook from react-i18next and look up strings by key, for example t("HO_slogan_1"). Because every key is prefixed, it is easy to find all strings that belong to a given screen by searching for the prefix.

The file also exports a changeLanguage() helper that cycles through the three locales in order (en → es → pt → en). Calling it once from the UI is enough to advance to the next language; no arguments are needed.

---

ORM and database

Prisma 6 is the only layer that touches PostgreSQL. The schema lives in backend/app/src/prisma/schema.prisma and is applied at container start with npx prisma db push inside start.sh. A single PrismaClient instance is created at server startup and attached to app.locals so all controllers share one connection pool.

The my_users table holds the core user record: id, name, email, an optional bcrypt password hash (null for OAuth-only users), avatar stored as a base64 data URI or a preset token like "default:1", and nullable googleId and fortyTwoId columns for OAuth linking. friend_request is a self-referential table on my_users with a status field (pending, accepted, rejected) and a unique constraint on the sender/receiver pair. user_block works the same way. conversation is typed as DIRECT or GROUP with an optional name. conversation_participants is the join table between conversations and users, carrying a role and joinedAt. message stores the content and links back to both conversation and sender. canvas stores the serialized p5.js drawing state as text and optionally links to a group conversation, which enables the integrated chat sidebar while drawing. canvas_collaborator is the many-to-many between canvas and users, with a status field for the invitation lifecycle (pending, accepted).

---

CORS(Cross-Origin Resource Sharing) and TLS(Transport Layer Security)

CORS is handled by the cors npm package. The allowed origins are a hardcoded set of localhost variants on ports 5173, 8081 and 3000, plus whatever CORS_ORIGIN is set to in the environment. credentials: true is required because the client sends an Authorization header. Socket.io uses the same origin set so the WebSocket handshake goes through too.

The self-signed RSA 2048 certificate is generated by backend/start.sh using OpenSSL on every container start. It skips regeneration if the existing cert already has the right Subject Alternative Names (DNS:localhost, IP:127.0.0.1, and optionally the custom HOST value). The cert is shared with the frontend container via a read-only volume so Vite can serve HTTPS from the same certificate. You need to accept the cert warning in the browser for both https://localhost:5173 and https://localhost:8081.

---

Observability
### Developer of the Devops funtionabilities

# Dev: filferna

Prometheus scrapes `https://backend_server:8081/metrics` every 15 seconds, configured in `prometheus.yml`. It connects over HTTPS and skips cert verification since it's a self-signed cert. It runs on port 9090 with its own TLS enabled via `prometheus-web.yml`.

The backend exposes metrics through `prom-client` in `backend/app/src/monitoring/metrics.ts`. Two things are tracked:

- Default Node.js metrics via `collectDefaultMetrics` — heap, event loop lag, GC pause time, active handles.
- `http_request_duration_seconds` — a histogram that times every request. `metricsMiddleware` starts a timer on each request and stops it when the response finishes, tagging it with `method`, `route`, and `status_code`. The route comes from `req.route.path` when matched, or falls back to `"unmatched"` for 404s. Buckets range from 5ms to 10s. The middleware is registered before the routes in `index.ts` so nothing is missed.

Grafana runs on port 3000 (HTTPS, same shared certs). Default login is `admin / admin`. Everything is pre-wired from the `grafana/` folder — no UI setup needed:

- `grafana/provisioning/datasources/datasource.yml` — points Grafana at `https://prometheus:9090` as the default datasource. Prometheus is reachable by service name inside the Docker network.
- `grafana/provisioning/dashboards/dashboard.yml` — tells Grafana to load JSON files from `grafana/dashboards/`.
- `grafana/dashboards/transcendence-observability.json` — the full dashboard definition, version-controlled in the repo, so it's the same on every fresh boot.

Data flow: request hits backend → `metricsMiddleware` records duration → `/metrics` exposes it → Prometheus scrapes every 15s → Grafana queries and displays.


//      - ./certs:/etc/ssl/certs:ro

### Modules for eval:

# WEB:

Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.).       | -> TypeScript (REACT)    | 1
Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.).   | -> TypeScript (EXPRESS)  | 1
Major: Implement real-time features using WebSockets or similar technology | SOckets.io               | 2
Major: Allow users to interact with other users.                           |                          | 2
Minor: Use an ORM for the database                                         | Prisma                   | 1
Minor: Real-time collaborative features                                    | (Canvas)                 | 1
Minor: Custom-made design system with reusable components                  | In the canvas/topbar     | 1
result:                                    								   |						  | 9 points
# Accessibility and Internationalization:								   |--------------------------|
Minor: Support for multiple languages (at least 3 languages).              | en/es/pt                 | 1
Minor: Support for additional browsers                                     | Firefox, Edge,Chrome     | 1
result:                                    								   |						  | 2 points
																		   |---------------------------|                          		
# User Management                                                          |--------------------------|
																		   |                          |                          		
Major: Standard user management and authentication. (update profile/avatar/friends/onlinestatus)      | 2
Minor: Implement remote authentication with OAuth 2.0  					   | google/42				  | 1
Minor: Implement a complete 2FA  system for the users.                     |						  | 1 
																		   |                          |                          		
result:																	   |						  | 4 points
																		   |---------------------------|                          		
# devops																   |--------------------------|
Major: Monitoring system with Prometheus and Grafana                       | Promethues & Grafana     | 2
																		   |                          |                          		
result:																	   |						  |	2 points
																		   |---------------------------|                          		
final result:                                                              |                          | 17 points.


whole project history : https://github.com/jit-23/transcendence