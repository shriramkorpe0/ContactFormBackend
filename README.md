# Contact Form Backend

AVIP 2026 Backend Development Internship — Task 2

## Description

A simple, professional backend API that receives a contact form submission (name, email, message), validates it, saves it to MongoDB Atlas, emails it to a configured address via Nodemailer, and returns a clean JSON response.

## Features

- `POST /api/contact` endpoint
- Server-side validation (required fields, valid email format, trimmed input)
- MongoDB Atlas persistence via Mongoose
- Email notification via Nodemailer + Gmail SMTP (App Password)
- Centralized error handling with proper HTTP status codes
- No leaked credentials or stack traces in responses
- Minimal sample HTML/CSS/JS frontend to demonstrate the API

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Nodemailer
- dotenv
- Postman (for testing)

## Architecture

```
Contact Form (public/index.html)
        │  fetch() POST
        ▼
POST /api/contact  (routes/contactRoutes.js)
        ▼
contactController.js
        │
        ├─► Validate input (name, email, message)
        │        │  invalid → AppError(400) → errorHandler → JSON error
        │        ▼ valid
        ├─► Save to MongoDB (models/Contact.js)
        │        │  DB error → AppError(500) → errorHandler
        ▼
        ├─► Send email (services/emailService.js → Nodemailer → Gmail SMTP)
        │        │  email error → AppError(500) → errorHandler
        ▼
Return JSON: { success: true, message, data: { id } }
```

## Project Structure

```
contact-form-backend/
│
├── config/
│   └── db.js                  MongoDB connection
├── controllers/
│   └── contactController.js   Validation + orchestration
├── models/
│   └── Contact.js              Mongoose schema
├── routes/
│   └── contactRoutes.js       POST /api/contact route
├── middleware/
│   ├── AppError.js             Custom error class
│   ├── asyncHandler.js         Async error wrapper
│   └── errorHandler.js         Centralized error handler
├── services/
│   └── emailService.js         Nodemailer logic
├── public/
│   └── index.html               Sample frontend
├── .env                         Real secrets (never commit)
├── .env.example                Template (safe to commit)
├── .gitignore
├── package.json
├── server.js                    App entry point
└── README.md
```

## Installation

```bash
cd contact-form-backend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CONTACT_RECEIVER=your_email@gmail.com
```

**Never commit `.env` to GitHub.** It is already listed in `.gitignore`.

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Click **Build a Database** → choose the free **M0** tier → pick a cloud provider/region → **Create**.
3. **Create a database user**: Security → Database Access → Add New Database User. Set a username and password (save these — you'll need them in the connection string). Give it "Read and write to any database" role.
4. **Configure Network Access**: Security → Network Access → Add IP Address → for development choose "Allow Access from Anywhere" (`0.0.0.0/0`). For production, restrict this later.
5. **Get the connection string**: Database → Connect → "Drivers" → copy the string, which looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user's credentials, and optionally add a database name before the `?`, e.g. `.../contactformdb?retryWrites=true...`.
7. Paste this full string into `MONGODB_URI` in your `.env` file.
8. **To check saved records**: Atlas dashboard → Database → Browse Collections → find the `contacts` collection inside your database.

## Gmail / Nodemailer Setup

**What is Nodemailer?** A Node.js library for sending emails from your server through an SMTP server (in this case, Gmail's).

**How SMTP works (briefly):** Your server authenticates with Gmail's mail server using your email + a password, then hands off the message; Gmail delivers it.

**Why an App Password, not your real Gmail password:** Google blocks direct sign-in from third-party apps using your normal password for security. An App Password is a 16-character code generated specifically for one app, which you can revoke any time.

**How to generate a Gmail App Password:**

1. Your Gmail account must have **2-Step Verification** enabled (Google Account → Security → 2-Step Verification).
2. Go to Google Account → Security → **App Passwords** (search "App Passwords" in the account settings search bar if you don't see it).
3. Choose app: "Mail", choose device: "Other" → name it e.g. "ContactFormBackend" → Generate.
4. Copy the 16-character password (no spaces) into `EMAIL_PASS` in `.env`. Use your Gmail address as `EMAIL_USER`.

**How to test email sending:** Run the server, submit the sample form or a Postman request, and check the `CONTACT_RECEIVER` inbox (also check Spam on the first attempt).

## Running Locally

```bash
npm start
```

or, with auto-restart during development:

```bash
npm run dev
```

You should see:

```
MongoDB connected: <cluster host>
Server running on http://localhost:5000
```

Open `http://localhost:5000` in your browser to use the sample frontend.

## API Endpoint

### `POST /api/contact`

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I want to know more about your project."
}
```

**Success response — `201 Created`:**

```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": { "id": "665f1c2e4b1a2c001e8a1234" }
}
```

**Error response — `400 Bad Request` (example):**

```json
{
  "success": false,
  "message": "Invalid email address"
}
```

**Error response — `500 Internal Server Error`:**

```json
{
  "success": false,
  "message": "Something went wrong on the server. Please try again later."
}
```

## Postman Testing

Base URL when running locally: `http://localhost:5000`

| #   | Test                   | Method | URL            | Body                                                           | Expected Status | Expected Response                                                                                                  |
| --- | ---------------------- | ------ | -------------- | -------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Valid submission       | POST   | `/api/contact` | `{"name":"John","email":"john@example.com","message":"Hello"}` | 201             | `success: true`, includes `data.id`                                                                                |
| 2   | Missing name           | POST   | `/api/contact` | `{"email":"john@example.com","message":"Hello"}`               | 400             | `"Name is required"`                                                                                               |
| 3   | Missing email          | POST   | `/api/contact` | `{"name":"John","message":"Hello"}`                            | 400             | `"Email is required"`                                                                                              |
| 4   | Invalid email          | POST   | `/api/contact` | `{"name":"John","email":"not-an-email","message":"Hello"}`     | 400             | `"Invalid email address"`                                                                                          |
| 5   | Missing message        | POST   | `/api/contact` | `{"name":"John","email":"john@example.com"}`                   | 400             | `"Message is required"`                                                                                            |
| 6   | Empty request body     | POST   | `/api/contact` | `{}`                                                           | 400             | `"Name is required"`                                                                                               |
| 7   | MongoDB/database error | —      | —              | —                                                              | 500             | Temporarily set an invalid `MONGODB_URI` and restart the server to see this path; response hides the real DB error |
| 8   | Email error            | —      | —              | —                                                              | 500             | Temporarily set a wrong `EMAIL_PASS` to trigger `"Failed to send email notification"`                              |

For all POST tests, set header `Content-Type: application/json` and choose "raw" → "JSON" body in Postman.

## Sample Frontend

Open `http://localhost:5000` after starting the server. Fill in the form and submit — it calls `POST /api/contact` via `fetch()` and shows a success or error message inline.

## Deployment (Render)

1. Push the project to GitHub (see below).
2. Create a free account at https://render.com.
3. Dashboard → **New** → **Web Service**.
4. Connect your GitHub account and select the `ContactFormBackend` repository.
5. **Build command:** `npm install`
6. **Start command:** `npm start`
7. Add environment variables under the "Environment" tab (same keys as `.env.example`):
   - `MONGODB_URI`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CONTACT_RECEIVER`
   - `PORT` (Render sets this automatically, but you can leave your own too — the app reads `process.env.PORT` first)
8. Click **Create Web Service** and wait for the deploy to finish.
9. Copy the live URL Render gives you, e.g. `https://contact-form-backend.onrender.com`.
10. Test the live API in Postman using that URL instead of `localhost:5000`.

## GitHub

```bash
git init
git add .
git commit -m "feat: build contact form backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Confirm `.env` does **not** appear in the GitHub repo — only `.env.example` should be there.

## Security Notes

- Credentials only ever live in `.env` (gitignored), never hardcoded.
- Gmail App Password used instead of the real account password.
- All input validated and trimmed server-side.
- Centralized error handler never returns stack traces or credentials.
- CORS enabled broadly for this simple demo; restrict `origin` in `cors()` for production use.

## Evidence / Screenshots Checklist for AVIP Submission

1. Terminal showing `npm start` with "MongoDB connected" and "Server running" messages.
2. Postman: successful `201` request and response (Test 1).
3. Postman: a validation failure `400` response (e.g. Test 2 or 4).
4. MongoDB Atlas → Browse Collections showing the saved contact document.
5. Screenshot of the received email (name/email/message visible).
6. Sample HTML form in the browser, before and after a successful submission.
7. GitHub repository page showing the file structure.
8. Render dashboard showing the deployed service as "Live".
9. Postman request hitting the live Render URL with a successful response.

## Final AVIP Task 2 Checklist

- [x] `POST /api/contact` created
- [x] `name` accepted
- [x] `email` accepted
- [x] `message` accepted
- [x] Server-side validation
- [x] MongoDB persistence
- [x] Nodemailer email forwarding
- [x] JSON success response
- [x] JSON error response
- [x] Correct HTTP status codes
- [x] Centralized error handling
- [x] `.env` protected (gitignored)
- [x] `.env.example` provided
- [ ] GitHub repository pushed (do this yourself using the commands above)
- [x] README
- [x] Postman testing plan
- [x] Sample form
- [ ] MongoDB evidence (screenshot after you run it)
- [ ] Email evidence (screenshot after you run it)
- [ ] Render deployment (deploy it yourself following the steps above)

## Future Improvements

- Rate limiting on `/api/contact` to prevent spam/abuse
- CAPTCHA or honeypot field on the frontend
- Admin endpoint (with authentication) to list/manage submissions
- Automated tests (Jest + Supertest)
