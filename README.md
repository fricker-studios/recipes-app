# Recipes App

[![latest release](https://gitlab.alexfricker.com/external/recipes-app/-/badges/release.svg)](https://gitlab.alexfricker.com/external/recipes-app/-/releases)
[![pipeline status](https://gitlab.alexfricker.com/external/recipes-app/badges/main/pipeline.svg)](https://gitlab.alexfricker.com/external/recipes-app/-/pipelines)

A full-stack recipe management application built with Django and React, featuring a modern UI powered by Mantine and comprehensive recipe library management.

## Features

- 📚 Recipe library management
- 🔍 Search and filter recipes
- 📝 Create and edit recipes with detailed information
- 🎨 Modern, responsive UI built with Mantine
- 🔐 User authentication and authorization
- 📱 Mobile-friendly design
- ⚡ Fast API built with Django REST Framework
- 🔄 Background task processing with Celery
- 📊 Integration with USDA FoodData Central

## Tech Stack

### Backend
- **Python 3.11+**
- **Django 5.2** - Web framework
- **Django REST Framework** - API
- **PostgreSQL 17** - Database
- **Redis 7** - Cache and message broker
- **Celery** - Async task processing
- **Gunicorn** - WSGI server

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Mantine 8** - UI component library
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **React Router 7** - Navigation

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 17 (if running without Docker)
- Redis 7 (if running without Docker)

## Getting Started

### Development Setup with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://gitlab.alexfricker.com/external/recipes-app.git
   cd recipes-app
   ```

2. **Set up environment**
   ```bash
   make env
   ```
   This creates a `.env` file from `.env.example`. Edit `.env` to configure your environment variables.

3. **Build the application**
   ```bash
   make build
   ```

4. **Run database migrations**
   ```bash
   make migrate
   ```

5. **Start the development server**
   ```bash
   make runserver
   ```

   This will:
   - Start the PostgreSQL database
   - Start the Django API on `http://localhost:8000`
   - Start the Vite dev server on `http://localhost:5173`

### Local Development Setup (Without Docker)

1. **Set up Python environment**
   ```bash
   make python-env
   source .venv/bin/activate
   ```

2. **Set up Node environment**
   ```bash
   make node-env
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local database and Redis settings
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start services**
   ```bash
   # Terminal 1: Start Django
   python manage.py runserver

   # Terminal 2: Start Vite dev server
   cd frontend
   yarn dev

   # Terminal 3: Start Celery worker
   celery -A recipes worker -l info

   # Terminal 4: Start Celery beat
   celery -A recipes beat -l info
   ```

## Development Commands

### Makefile Commands

- `make env` - Set up Python and Node environments
- `make python-env` - Set up Python virtual environment only
- `make node-env` - Install Node dependencies only
- `make build` - Build Docker images
- `make migrate` - Run database migrations
- `make migrations` - Generate new migrations
- `make runserver` - Start development server
- `make shell` - Open a shell in the API container
- `make clean` - Remove build artifacts and dependencies

### Frontend Commands

```bash
cd frontend

# Start dev server
yarn dev

# Run tests
yarn test

# Type checking
yarn typecheck

# Linting
yarn lint

# Format code
yarn prettier:write

# Build for production
yarn build
```

### Backend Commands

```bash
# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Open Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

## Project Structure

```
recipes/
├── frontend/              # React frontend
│   ├── src/              # Source files
│   └── package.json      # Node dependencies
├── recipes/              # Django project
│   ├── fdc/             # FoodData Central integration
│   ├── library/         # Recipe library app
│   ├── settings.py      # Django settings
│   └── urls.py          # URL routing
├── docker-compose.yaml   # Docker services
├── Dockerfile           # API container
├── Dockerfile.nginx     # Frontend container
├── Makefile            # Development commands
└── pyproject.toml      # Python dependencies
```

## Deployment

The application is designed to be deployed on Kubernetes using the GitOps manifests in the `gitops-demo` repository.

## License

See [LICENSE](LICENSE) file for details.

## Author

Alex Fricker - alex@alexfricker.com
