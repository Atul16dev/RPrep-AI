# Artify API

Artify API is a full-stack application that generates **AI-powered interview-preparation reports** from a user's **resume PDF, self-description, and job description**.

It consists of a React/Vite frontend and an Express/MongoDB backend, with support for AI-generated reports, authentication, email verification, password reset, Google sign-in, and profile photo uploads.

---

## ✨ Features

* 📄 Resume PDF upload and processing
* 🧑‍💼 Self-description input
* 💼 Job description input
* 🤖 AI-powered interview-preparation report generation
* 🔐 Authentication and authorization
* 🔑 Google sign-in
* 📧 Email verification
* 🔄 Password reset through email
* 🖼️ Profile photo uploads using Cloudinary
* 🗃️ MongoDB-based data storage
* 📊 Report history with configurable retention
* 🔒 Production-oriented security configuration

---

## 🏗️ Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React, Vite                  |
| Backend          | Node.js, Express             |
| Database         | MongoDB                      |
| AI               | Google Gemini / Google GenAI |
| Authentication   | JWT, Google OAuth            |
| Email            | SMTP                         |
| File Storage     | Cloudinary                   |
| Frontend Tooling | Vite, Oxlint                 |

---

## 🔄 How It Works

```text
                 ┌──────────────────┐
                 │      User        │
                 └────────┬─────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      Frontend         │
              │    React + Vite       │
              └───────────┬───────────┘
                          │
             Resume PDF + Self Description
                    + Job Description
                          │
                          ▼
              ┌───────────────────────┐
              │      Backend API      │
              │   Node.js + Express   │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       ┌──────────────┐       ┌───────────────┐
       │   MongoDB    │       │ Google GenAI  │
       │   Database   │       │ AI Processing │
       └──────────────┘       └───────┬───────┘
                                      │
                                      ▼
                           ┌──────────────────┐
                           │ Interview Report │
                           └──────────────────┘
```

---

## 📁 Project Structure

```text
Artify/
├── Backend/
│   ├── ...
│   ├── .env.example
│   └── package.json
│
├── Frontend/
│   ├── ...
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

> The detailed implementation structure may evolve as the project grows.

---

# 🚀 Local Setup

## Prerequisites

Make sure the following are installed:

* Node.js `20.19.0+` for the backend; frontend supports `20.19.0+` or `22.12.0+`
* npm
* MongoDB
* A Google GenAI API key
* Google OAuth credentials
* SMTP credentials for email functionality
* Cloudinary credentials for profile photo uploads

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Artify
```

---

# ⚙️ Backend Setup

Go to the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Then configure the required environment variables.

### Backend Environment Variables

| Variable                 | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `MONGO_URI`              | MongoDB connection string                  |
| `JWT_SECRET`             | JWT authentication secret                  |
| `GOOGLE_GENAI_API_KEY`   | Google GenAI API key for report generation |
| `GOOGLE_CLIENT_ID`       | Google OAuth web client ID                 |
| `SMTP_USER`              | SMTP account used for email services       |
| `SMTP_APP_PASSWORD`      | SMTP app password                          |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                      |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                      |
| `PORT`                   | Backend server port                        |
| `CORS_ORIGIN`            | Allowed frontend origin(s)                 |
| `NODE_ENV`               | Application environment                    |
| `HISTORY_RETENTION_DAYS` | Report history retention period            |

### Run the Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API listens on `PORT`, which defaults to:

```text
3000
```

For local development, the default allowed frontend origin is:

```text
http://localhost:5173
```

Multiple origins can be specified in `CORS_ORIGIN` using commas.

---

# 💻 Frontend Setup

Open a new terminal and go to the frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the frontend environment variables.

### Frontend Environment Variables

| Variable                | Purpose                    |
| ----------------------- | -------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `VITE_API_URL`          | Backend API origin         |

`VITE_GOOGLE_CLIENT_ID` should use the same Google OAuth web client ID configured in the backend as `GOOGLE_CLIENT_ID`.

For local development, `VITE_API_URL` can remain empty when the frontend is configured to use the local/shared API setup.

### Start the Frontend

```bash
npm run dev
```

---

# 🏭 Production Configuration

For production deployments, configure secrets through the hosting/deployment platform instead of committing them to source control.

The backend production environment should include:

```text
NODE_ENV=production
PORT=<production-port>
MONGO_URI=<mongodb-connection-string>
JWT_SECRET=<strong-unique-secret>
GOOGLE_GENAI_API_KEY=<google-genai-api-key>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
SMTP_USER=<smtp-user>
SMTP_APP_PASSWORD=<smtp-app-password>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
CORS_ORIGIN=<deployed-frontend-origin>
HISTORY_RETENTION_DAYS=<retention-period>
```

### Production Security

* Use a strong, unique `JWT_SECRET`.
* Keep all credentials outside source control.
* Set `CORS_ORIGIN` to the exact deployed frontend origin(s).
* Use HTTPS in production.
* Authentication cookies use the `Secure` attribute in production.

---

# 📦 File Upload Limits

The application currently uses the following limits:

| Upload        | Limit |
| ------------- | ----: |
| Resume PDF    |  3 MB |
| Profile Image |  5 MB |

Resume uploads are held in memory during processing.

---

# 🗃️ Report History Retention

Generated report history is automatically retained according to:

```text
HISTORY_RETENTION_DAYS
```

The default retention period is:

```text
30 days
```

---

# 🔐 Environment & Secret Management

Never commit sensitive credentials to GitHub.

The following types of values should remain private:

* API keys
* JWT secrets
* Database connection strings
* OAuth credentials
* SMTP credentials
* Cloudinary secrets

Keep local secrets inside `.env` files and use `.env.example` only for safe variable-name documentation.

---

# 🧪 Checks

## Frontend

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

The production frontend build is generated in:

```text
Frontend/dist
```

When the backend is hosted on a different origin, set:

```text
VITE_API_URL
```

to the deployed API origin before running the production build.

For a shared origin, `/api` can be routed to the backend while leaving `VITE_API_URL` empty.

## Backend

Production start command:

```bash
npm start
```

The backend currently does not have an automated test suite configured.

---

# 🚀 Deployment

Before deploying:

1. Configure all required environment variables on the hosting platform.
2. Set `NODE_ENV=production`.
3. Configure the production MongoDB connection.
4. Configure the Google OAuth client ID.
5. Configure SMTP credentials.
6. Configure Cloudinary credentials when profile photo uploads are enabled.
7. Set `CORS_ORIGIN` to the deployed frontend origin.
8. For a separate frontend/backend deployment, configure `VITE_API_URL` with the deployed backend API origin.
9. Enable HTTPS for production traffic.

---

# 🛡️ Security Notes

Artify API is designed to keep sensitive configuration outside the source repository.

Before deployment, verify that:

* `.env` files are ignored by Git.
* No real API keys are present in the repository.
* No database credentials are committed.
* Production secrets are configured through environment variables.
* `CORS_ORIGIN` is restricted to trusted frontend origins.

---

# 📌 Project Status

Artify API is currently structured as a full-stack application with a React/Vite frontend and an Express/MongoDB backend, with AI-powered report generation and production deployment configuration.

---

# 👨‍💻 Author

**Atul Kumar**

---

# 📄 License

No license has been specified yet.
