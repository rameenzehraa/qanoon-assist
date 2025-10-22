# Qanoon Assist - Legal Assistance Platform

A comprehensive legal assistance platform connecting citizens with verified lawyers in Pakistan. Built with Django REST Framework and React.

## Features

- **User Management**: Separate roles for Citizens, Lawyers, and Admins
- **Lawyer Verification**: Admin-verified lawyer profiles with specialties
- **Case Request Workflow**: Citizens can request lawyers, lawyers can approve/deny
- **Case Management**: Track cases, hearings, and deadlines
- **Secure Messaging**: Case-based communication system
- **Knowledge Base**: Legal articles organized by specialty

## Tech Stack

**Backend:**
- Django 4.x
- Django REST Framework
- PostgreSQL
- JWT Authentication

**Frontend:**
- React.js
- React Router
- Axios
- CSS3

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL 15+

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/rameenzehraa/qanoon-assist.git
cd qanoon-assist
```

2. **Create virtual environment:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-decouple pillow
```

4. **Create PostgreSQL database:**
- Open pgAdmin
- Create database: `qanoon_assist_db`

5. **Create `.env` file in root directory:**
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=qanoon_assist_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

6. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Create superuser:**
```bash
python manage.py createsuperuser
```

8. **Run development server:**
```bash
python manage.py runserver
```

Backend will run at: `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

Frontend will run at: `http://localhost:3000`

## Project Structure

```
qanoon-assist/
├── core/                   # Django app
│   ├── migrations/
│   ├── models.py          # Database models
│   ├── serializers.py     # API serializers
│   ├── views.py           # API views
│   ├── urls.py            # API routes
│   └── admin.py           # Admin panel config
├── qanoon_assist/         # Django project settings
├── frontend/              # React application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/      # API calls
│       └── context/       # Auth context
├── manage.py
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `GET /api/auth/me/` - Get current user

### Lawyers
- `GET /api/lawyers/verified/` - List verified lawyers
- `GET /api/lawyer-profiles/` - Get lawyer profiles
- `POST /api/lawyer-profiles/{id}/verify/` - Verify lawyer (admin only)

### Cases
- `GET /api/case-requests/` - List case requests
- `POST /api/case-requests/` - Create case request
- `POST /api/case-requests/{id}/respond/` - Respond to request
- `GET /api/cases/` - List cases
- `GET /api/hearings/` - List hearings
- `GET /api/messages/` - Case messages

### Knowledge Base
- `GET /api/articles/` - List articles
- `GET /api/specialties/` - List legal specialties

## Usage

### For Citizens
1. Register and create profile
2. Search for verified lawyers by specialty/city
3. Send case request to lawyer
4. Track case progress and hearings
5. Communicate with lawyer via messaging

### For Lawyers
1. Register and complete profile with bar council number
2. Wait for admin verification
3. Review and respond to case requests
4. Manage cases and schedule hearings
5. Communicate with clients

### For Admins
1. Verify lawyer applications
2. Manage users and cases
3. Add legal specialties
4. Moderate knowledge base articles

## Contributing

This is a university project. If you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is for educational purposes.

## Contact

For questions or issues, please create an issue in the repository.