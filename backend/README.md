# Issue Tracker Backend

A Python FastAPI backend for the Issue Tracker application.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Interactive API documentation is available at `http://localhost:8000/docs`

## Endpoints

- `GET /health` - Health check
- `GET /issues` - Get all issues with search, filtering, sorting, and pagination
- `GET /issues/{id}` - Get a single issue
- `POST /issues` - Create a new issue
- `PUT /issues/{id}` - Update an issue
