# Field Agent Onboarding and Document Verification Workflow – Frontend

## Overview

This repository contains the **frontend** of the Field Agent Onboarding and Document Verification Workflow project.

The frontend provides a user-friendly interface for field agents to register, log in, submit their details and documents, and track their verification status. It also provides an interface for administrators to review agent information and manage the document verification process.

## Key Features

* Field agent registration and login
* User-friendly onboarding process
* Agent profile and personal information management
* Document upload interface
* Document verification status tracking
* Admin dashboard for reviewing agent details
* Approve or reject document verification requests
* Integration with backend APIs
* Responsive and easy-to-use interface

## Project Workflow

1. The field agent registers or logs in to the application.
2. The agent enters the required personal and onboarding information.
3. The agent uploads the required documents.
4. The frontend sends the submitted information to the backend through APIs.
5. The administrator reviews the submitted agent details and documents.
6. Documents can be approved or rejected based on verification.
7. The field agent can view the updated verification status through the application.

## Technologies Used

* React.js
* JavaScript
* HTML5
* CSS3
* REST API
* Axios / Fetch API
* Git and GitHub

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

> The exact folder structure may vary depending on the implementation.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-frontend-repository-url>
```

### 2. Navigate to the Project Folder

```bash
cd <frontend-folder-name>
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

If the project uses Vite:

```bash
npm run dev
```

Open the localhost URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Backend Integration

This frontend application communicates with the backend using REST APIs.

The backend is maintained in a **separate GitHub repository**.

Make sure the backend server is running before using features that require authentication, agent data, document uploads, or verification.

## Application Screenshots

### Home Page

![Home Page](screenshots/home-page.png)

### Login Page

![Login Page](screenshots/login-page.png)

### Agent Dashboard

![Agent Dashboard](screenshots/agent-dashboard.png)

### Document Upload Page

![Document Upload](screenshots/document-upload.png)

### Document Verification Page

![Document Verification](screenshots/document-verification.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

## Purpose of the Project

The purpose of this project is to digitize and simplify the field agent onboarding and document verification process.

The system helps organizations efficiently collect agent information, manage document submissions, verify documents, and track onboarding progress through a centralized workflow.

## Future Enhancements

* Email and SMS notifications
* Automated document verification
* Cloud-based document storage
* Improved role-based access control
* Real-time verification status updates
* Enhanced dashboard and analytics

## Author

**Joshal Fernandes**

Computer Science and Engineering
IoT with Cybersecurity and Blockchain Technology
