# ToDo App

A To-Do application built with Django (backend) and React (frontend), with features like project creation, task management, and exporting project summaries as secret gists.

## Features

- **Basic Auth** for user login.

### Home Page:
- Create new projects.
- List all projects.

### Detailed Project View:
- Editable project title.
- List of todos with description, date, and completion status.
- Actions to Add/Update/Remove todos.
- Mark todos as "pending" or "completed".
- Export project summary as a secret GitHub gist.
- Exported Gist is saved to the local system as a markdown file.

## Setup

### Backend (Django)

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>


2. Create a virtual environment (optional but recommended):

   ```bash
    python3 -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate

3. Install backend dependencies: Make sure to have Python 3.11.1 installed.

   ```bash
    pip install -r requirements.txt

4. Apply migrations:

   ```bash
    python manage.py migrate

5. Run the backend:

   ```bash
    python manage.py runserver

The backend will be accessible at http://127.0.0.1:8000/.

### Frontend (React)

1. Navigate to the frontend directory:

   ```bash
    cd frontend

2. Install frontend dependencies: Make sure to have Node.js version 20.10.0 installed.

   ```bash
    npm install

3. Run the frontend:

   ```bash
    npm start

The frontend will be accessible at http://localhost:3000/.

## Testing

### Backend Testing (Django)
The backend includes a comprehensive suite of tests to validate key functionality, including authentication, project management, and todos.

**Running Tests**

1. Ensure the virtual environment is activated.

2. Run the test suite:

   ```bash
   python manage.py test

**Test Details**

- **Authentication** : Verifies token-based authentication and unauthorized access restrictions.
- **Project Tests** :
   - Creating, updating, and deleting projects.
   - Ensures validation for duplicate project titles.
- **Todo Tests** :
   - Creating todos under specific projects.
   - Validates permissions to ensure users cannot access or modify todos in unauthorized projects.
   - Duplicate todo descriptions within the same project are restricted.

# Secret Gist Template

Here is an example format of the markdown file that will be exported as a secret gist:


   # Project Title

   **Summary**: 5/6 todos completed

   ## Pending
   - [ ] Prepare budget report 1

   ## Completed
   - [x] completed project and updated
   - [x] second todo completed
   - [x] Prepare budget report
   - [x] Prepare budget report 2


   [Exported as secret gist]


### Personal Access Token is removed, before running you have to add PAT to the file (export.js) in src -> Export folder of Frontend 



## Dependencies

### Backend (Django)

- asgiref==3.8.1
- Django==5.1.3
- django-cors-headers==4.6.0
- djangorestframework==3.15.2
- djangorestframework-simplejwt==5.3.1
- PyJWT==2.9.0
- sqlparse==0.5.1
- tzdata==2024.2

### Frontend (React)

- react@18.3.1
- react-dom@18.3.1
- react-router-dom@6.28.0
- react-redux@9.1.2
- @mui/material@6.1.6
- @mui/icons-material@6.1.6
- react-toastify@10.0.6
- redux-toolkit@2.3.0


## Project Structure

   ```bash
    ToDo App/
    ├── backend/                  # Django backend files
    │   ├── manage.py
    │   ├── requirements.txt      # Backend dependencies
    │   └── ...
    ├── frontend/                 # React frontend files
    │   ├── package.json
    │   ├── src/
    │   └── ...
    └── venv/                     # Virtual environment (if created)


   
