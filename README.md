# Quill

**Your writing's missing progress bar.**

Quill is a personal writing tracker for long-form projects — novels, dissertations, screenplays, anything with a word count and a deadline. Log sessions, watch your heatmap fill in, and see exactly where you stand.

Live demo: [edking4967.pythonanywhere.com](https://edking4967.pythonanywhere.com/?demo)

---

## Features

- **Dashboard** — word count progress bar, session stats, and a 16-week writing heatmap per project
- **Session logging** — record time spent, words written, activity type (writing, editing, brainstorming, research), and notes
- **Built-in timer** — start/pause/end a session timer that feeds duration directly into the log form
- **Multiple projects** — track novels, scripts, or any other work-in-progress side by side
- **History view** — all-time stats and heatmap across every project at once
- **Demo mode** — try the full app at `?demo` with no account required
- **Streak counter** — consecutive days of writing shown in the header

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python / Flask |
| Database | SQLite |
| Frontend | React + Vite |
| Auth | Session cookies, passwords hashed with Werkzeug |
| Hosting | PythonAnywhere (free tier) |

## Project Structure

```
quill/
  backend/
    app.py          # Flask app — all API routes + static file serving
    quill.db        # SQLite database (gitignored, lives on server)
    dist/           # Built React app (committed, served by Flask)
  frontend/
    src/
      App.jsx               # Root component, routing, state
      api.js                # Fetch wrapper
      utils.js              # Date helpers, activity labels
      demoData.js           # Fake data for ?demo mode
      components/
        AuthScreen.jsx      # Login / register form
        SplashScreen.jsx    # Landing page
        SessionForm.jsx     # Log-a-session form with timer
        Timer.jsx           # Start / pause / end stopwatch
        ProjectCard.jsx     # Project summary card
        StatCard.jsx        # Single stat display
        SessionList.jsx     # Chronological session list
        Heatmap.jsx         # GitHub-style writing activity grid
```

## Running Locally

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install flask flask-cors werkzeug python-dotenv
python app.py
# Runs on http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

The frontend proxies API calls to Flask via Vite's dev server. In production, Flask serves the built React app directly from `backend/dist/`.

## Deployment

Quill is designed for PythonAnywhere's free tier. Because PythonAnywhere can't run Node.js, the React build is committed to the repo under `backend/dist/` and Flask serves it as static files.

```bash
# Build and commit before pushing
cd frontend
npm run build    # outputs to ../backend/dist/
git add backend/dist
git commit -m "Build frontend"
git push
```

On PythonAnywhere, pull the repo and set the WSGI file to point at `backend/app.py`. Set `SECRET_KEY` and `ALLOWED_ORIGINS` in a `.env` file in the backend directory.

See [doc/blog/self-hosting.md](doc/blog/self-hosting.md) for a full step-by-step guide.

## API

All routes are under `/api` and require a session cookie (set on login) except `/register`, `/login`, and `/me`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Create account |
| POST | `/api/login` | Log in |
| POST | `/api/logout` | Log out |
| GET | `/api/me` | Current session user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/sessions` | List user's sessions |
| POST | `/api/sessions` | Log a session |

## Environment Variables

Create a `.env` file in `backend/`:

```
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://yourdomain.pythonanywhere.com
```

## License

MIT
