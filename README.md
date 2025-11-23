# 🏛️ Qanoon Assist

A **prototype** lawyer-client platform for Pakistan that connects citizens with verified lawyers, enables case management, and supports real-time communication.

> ⚠️ **Important Notice**  
> This project is a **prototype only** and not a production-ready application.  
> **Copying, redistributing, or reusing any part of this project without explicit permission is strictly prohibited.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-5.2.7-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### For Citizens
- 🔍 **Find Lawyers** - Browse and filter verified lawyers by specialty, city, and experience
- 📝 **Request Cases** - Send case requests to lawyers with detailed descriptions
- 💬 **Real-time Messaging** - Chat with lawyers, share files and documents
- 📊 **Case Tracking** - Monitor case progress with updates and hearing schedules
- 🔔 **Notifications** - Get notified about new hearings, updates, and messages
- 📄 **Case Details** - View comprehensive case information with timeline

### For Lawyers
- ✅ **Manage Requests** - Accept or reject case requests with custom responses
- 📅 **Schedule Hearings** - Add court dates, locations, and hearing notes
- 📢 **Post Updates** - Keep clients informed with case progress updates
- 💼 **Case Management** - Track all active and completed cases
- 📁 **File Sharing** - Exchange documents with clients securely
- 👤 **Profile Management** - Showcase expertise, experience, and specialties

### For Admins
- ✔️ **Lawyer Verification** - Review and approve lawyer applications
- 📊 **Comprehensive Dashboard** - View platform statistics and analytics
- 📈 **Recent Activity** - Monitor latest case requests and filings
- 👥 **User Management** - Oversee all platform users
- 📉 **Platform Metrics** - Track cases, messages, hearings, and more

---

## 🛠️ Tech Stack

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **JWT Authentication** - Secure token-based auth
- **Python 3.x** - Programming language

### Frontend
- **React 18.x** - UI library
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation
- **JavaScript ES6+** - Programming language

---

## 📁 Project Structure

```
qanoon-assist/
├── backend/
│   ├── qanoon_assist/      # Django project settings
│   ├── users/              # Authentication & user management
│   ├── cases/              # Case & hearing management
│   ├── messaging/          # Real-time chat system
│   ├── knowledge_base/     # Legal articles (in progress)
│   └── media/              # File uploads
│
└── frontend/
    ├── public/
    └── src/
        ├── components/     # Reusable components
        ├── pages/          # Page components
        ├── contexts/       # React contexts
        └── services/       # API services
```

---

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rameenzehraa/qanoon-assist.git
   cd qanoon-assist/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

Frontend will run on `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=qanoon_assist
DB_USER=qanoon_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

---

## 🗄️ Database Schema

### Core Tables
- **users** - Main user authentication
- **citizen_profiles** - Citizen details
- **lawyer_profiles** - Lawyer information & verification
- **admin_profiles** - Admin accounts

### Case Management
- **case_requests** - Case requests from citizens to lawyers
- **cases** - Formal case records
- **hearings** - Court hearing schedules
- **case_updates** - Progress updates

### Communication
- **messages** - Chat messages with file attachments

### Reference Data
- **lawyer_specialties** - Legal practice areas

---

## 📡 API Documentation

### Authentication
```http
POST /api/auth/login/
POST /api/auth/register/citizen/
POST /api/auth/register/lawyer/
GET  /api/auth/me/
POST /api/auth/refresh/
```

### Lawyers
```http
GET  /api/lawyers/
GET  /api/lawyers/{id}/
POST /api/lawyers/{id}/verify/      # Admin only
POST /api/lawyers/{id}/reject/      # Admin only
```

### Case Requests
```http
GET  /api/case-requests/
POST /api/case-requests/
POST /api/case-requests/{id}/accept/
POST /api/case-requests/{id}/reject/
POST /api/case-requests/{id}/start_progress/
POST /api/case-requests/{id}/complete/
POST /api/case-requests/{id}/mark_viewed/
```

### Hearings
```http
GET    /api/hearings/
POST   /api/hearings/
PUT    /api/hearings/{id}/
DELETE /api/hearings/{id}/
```

### Messages
```http
GET  /api/messages/by_case/?case_request_id={id}
POST /api/messages/
```

### Admin
```http
GET /api/admin/dashboard/
GET /api/admin/dashboard/pending_lawyers/
GET /api/admin/dashboard/recent_activity/
```

---

## 👥 User Roles

### Citizen
- Browse lawyers
- Send case requests
- Chat with lawyers
- Track case progress
- View hearings and updates

### Lawyer
- Receive case requests
- Accept/reject cases
- Schedule hearings
- Post case updates
- Communicate with clients

### Admin
- Verify lawyers
- Monitor platform
- View statistics
- Manage users

---

## 🗺️ Roadmap

### ✅ Completed (Phases 1-7)
- [x] User authentication & registration
- [x] Lawyer profiles & verification
- [x] Case request system
- [x] Real-time messaging
- [x] Case management (hearings & updates)
- [x] Notification system
- [x] Enhanced admin dashboard

### 🚧 In Progress
- [ ] Knowledge Base (Legal articles database)

---

## 👨‍💻 Authors

- **Rameen Zehra**
- **Aisha Asif**
- **Omaima Afaq**

---