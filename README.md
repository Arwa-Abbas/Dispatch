# Dispatch

Dispatch is a full-stack delivery management platform for customers, drivers, and administrators. It provides role-based dashboards for creating, assigning, tracking, and completing shipments, with notifications, delivery history, and an optional AI assistant for querying shipment data.

## Features

### Customers

- Create and manage shipment requests
- Track deliveries with a unique tracking number
- View shipment details and status history
- Receive shipment and driver-assignment notifications

### Drivers

- View assigned shipments
- Review delivery details and history
- Update delivery statuses, including picked up, in transit, out for delivery, delivered, and failed

### Administrators

- Manage users and shipments
- View pending and active deliveries
- Assign drivers to shipments
- Monitor platform activity from an admin dashboard

### Platform

- JWT-based authentication and role-based access control
- Public shipment tracking
- In-app notifications
- Responsive React interface
- Interactive FastAPI documentation
- Optional Gemini-powered chat assistant connected to shipment data through MCP

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, SQLModel, Pydantic |
| Database | SQLite |
| Authentication | JWT, Passlib, bcrypt |
| AI assistant | Agno, Google Gemini, MCP |

## Project Structure

```text
Dispatch/
├── backend/
│   ├── app/
│   │   ├── agno/          # AI delivery assistant
│   │   ├── api/           # FastAPI routes
│   │   ├── core/          # Configuration and security
│   │   ├── database/      # Database engine and sessions
│   │   ├── mcp/           # MCP SQLite server
│   │   ├── models/        # SQLModel database models
│   │   ├── repositories/  # Data-access layer
│   │   ├── schemas/       # Request and response schemas
│   │   └── services/      # Application business logic
│   ├── create_admin.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── types/
```

## Getting Started

### Prerequisites

- Python 3.11 or later
- Node.js 20 or later
- npm
- Git
- A Google AI API key (optional; required only for the chat assistant)

### 1. Clone the repository

```bash
git clone https://github.com/Arwa-Abbas/Dispatch.git
cd Dispatch
```

### 2. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./delivery.db
SECRET_KEY=replace-this-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REMEMBER_ME_EXPIRE_DAYS=30
DEBUG=True

# Optional: enables the AI chat assistant
GOOGLE_API_KEY=your-google-api-key
```

Generate a secure secret key with Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Install the backend dependencies and start the API:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Then run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. Database tables are created automatically when the application starts.

### 3. Configure the frontend

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173` in your browser. During local development, Vite proxies `/api` requests to the backend on port `8000`.

## Create a Development Admin

With the backend virtual environment active:

```bash
cd backend
python create_admin.py
```

This development helper creates the following account:

```text
Email: admin@dispatch.com
Password: test1234
```

> [!WARNING]
> These credentials are intended for local development only. Change or remove them before deploying the application.

## API Documentation

Once the backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`
- API base path: `http://localhost:8000/api/v1`

## Available Scripts

Run frontend commands from the `frontend` directory:

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Security Notes

- Never commit `.env` files, API keys, production databases, or secret keys.
- Replace the default `SECRET_KEY` before deploying.
- Restrict CORS origins and disable debug mode in production.
- Replace the development admin credentials before public deployment.

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## Author

Created by Arwa Abbas
