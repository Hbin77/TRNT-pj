# GEMINI.md - TRNT (The Road Not Taken)

## Project Overview
TRNT is an "AI-powered Parallel World Life Simulator." It allows users to explore "what if" scenarios based on their life's turning points. The application generates alternative life narratives using AI, helping users visualize different outcomes of their past choices.

### Main Technologies
- **Backend:** FastAPI (Python 3.12+), SQLAlchemy (ORM), Alembic (Migrations), Pydantic (Validation), Groq API (AI generation).
- **Frontend:** Next.js 14+ (TypeScript), Tailwind CSS 4, Zustand (State Management), React Hook Form, Axios.
- **Database:** PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens) with Bearer authentication, Kakao OAuth support.

### Architecture
- **Monorepo-style structure:** `/backend` for API and `/frontend` for the web interface.
- **Backend Design:** Domain-driven structure with clear separation of `api`, `models`, `schemas`, `services`, and `dependencies`.
- **Frontend Design:** App router-based Next.js structure with reusable components in `/components/ui`.

---

## Building and Running

### Backend
1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```
2. **Setup virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt # For development & testing
   ```
4. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in the required values (DB URL, GROQ_API_KEY, etc.).
5. **Database Migrations:**
   ```bash
   alembic upgrade head
   ```
6. **Run Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   - API Docs: `http://localhost:8000/docs`

### Frontend
1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   - URL: `http://localhost:3000`

---

## Testing
- **Backend:** Uses `pytest`.
  ```bash
  cd backend
  pytest
  ```
- **Frontend:** Linting via `npm run lint`.

---

## Development Conventions

### Backend
- **Code Style:** PEP 8 compliance.
- **Type Hinting:** Mandatory for all function signatures and variables.
- **Documentation:** Google-style Docstrings for complex logic.
- **Migrations:** All model changes must be accompanied by an Alembic migration (`alembic revision --autogenerate`).
- **Error Handling:** Use custom exceptions defined in `app/exceptions.py` and handled by `app/middleware/error_handler.py`.

### Frontend
- **Styling:** Utility-first CSS using Tailwind CSS.
- **State Management:** Use Zustand for global state (e.g., auth state in `store/authStore.ts`).
- **Validation:** Use Zod for schema validation with React Hook Form.
- **API Calls:** Use the centralized axios instance in `lib/api.ts`.

### General
- **Task Management:** Refer to `docs/TASK_ORDER.md` for the current development phase and next steps.
- **Security:** Never commit `.env` files. Ensure JWT tokens are handled securely in the frontend.

---

## Key Files & Directories
- `backend/app/main.py`: Application entry point and router registration.
- `backend/app/services/ai.py`: Logic for AI scenario generation.
- `frontend/app/scenarios/`: UI for creating and viewing scenarios.
- `docs/DEVELOPMENT_PLAN.md`: Comprehensive architectural and feature roadmap.
- `docs/schema.md`: Database schema definitions.
