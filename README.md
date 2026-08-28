<div align="center">
  <img src="public/studyos_banner.png" alt="StudyOS Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;">
  
  <h1 align="center">StudyOS</h1>
  <p align="center">
    <strong>The ultimate all-in-one productivity operating system for students.</strong>
    <br />
    <br />
    <a href="https://studyos-snowy.vercel.app" target="_blank"><strong>View Live Demo »</strong></a>
    <br />
    <br />
    <a href="#features">Explore Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#getting-started">Getting Started</a>
  </p>

  <p align="center">
    <a href="https://github.com/anburaven13/Studyos/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&color=4F46E5" alt="License"></a>
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white&color=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6" alt="TypeScript">
    <img src="https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge&logo=google-gemini&logoColor=white&color=FF6B6B" alt="AI Powered">
  </p>
</div>

---

## ⚡ Overview

**StudyOS** is a comprehensive, full-stack student dashboard designed to centralize and supercharge your academic life. It seamlessly combines task management, class scheduling, interactive note-taking, and AI-powered tutoring into a single, beautiful interface.

Stop switching between five different apps to get your homework done. Welcome to the future of studying. 🚀

<br/>

## ✨ Features

### 🎓 **Smart Dashboard**
Get a powerful, at-a-glance view of your academic day. See your next classes, pending assignments, and a dynamic countdown to your most pressing upcoming exam.

### 📝 **Persistent, Cloud-Synced Notes**
Take rich-text notes that automatically save to the cloud. You never have to worry about losing your work with our built-in 1-second debounce autosave system.

### 🧠 **AI Tutor & Flashcard Generator**
StudyOS integrates deeply with **Google's Gemini 3.7 Flash** model, acting as your personal 24/7 tutor.
- **AI Chat:** Get instant, grade-tailored explanations for complex homework questions directly in your workspace.
- **Vision AI:** Upload photos of your worksheets and get instant extractions and explanations.
- **Smart Flashcards:** Instantly generate study flashcards straight from your saved notes with a single click.

### ⏰ **Planner & Pomodoro Timer**
Stay focused and structured. The built-in Pomodoro timer helps you power through deep-work sessions while your daily timetable keeps you on track for your next class.

### 📚 **Homework & Exam Tracking**
- **Homework Manager:** Track assignments, deadlines, and get AI-estimated completion times.
- **Exam Hub:** Visually monitor your confidence levels across subjects and track precisely how many days, hours, and minutes remain until your next test.

### 🔄 **Daily Routines**
Build a customized daily schedule. Use the auto-generator to instantly structure a week's worth of time blocks based on your preferred wake and sleep times.

<br/>

## 🛠 Tech Stack

StudyOS is built with modern, serverless web technologies to ensure a lightning-fast and secure experience:

| Category | Technology |
|---|---|
| **Frontend Ecosystem** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router v7 |
| **Backend & Database** | Node.js, Express (Serverless), Neon Serverless Postgres |
| **AI Integration** | Google GenAI SDK (Gemini 3.7 Flash) |
| **Security** | JSON Web Tokens (JWT), Bcrypt, Express Rate Limiting |
| **Deployment** | Vercel Serverless Functions |

<br/>

## 🚀 Getting Started

Follow these instructions to set up StudyOS locally for development.

### 1. Prerequisites
- Node.js (v18+)
- A [Neon Postgres](https://neon.tech) database URL
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Clone the Repository
```bash
git clone https://github.com/anburaven13/Studyos.git
cd Studyos
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory. You will need to supply the following values:

```env
# Database Connection (Neon Postgres)
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Restrict CORS for production
FRONTEND_URL=https://your-production-url.vercel.app
```

### 5. Run the Application
StudyOS uses Vercel Serverless Functions for its backend API. To run both the React frontend and the Express backend locally, use the Vercel CLI:

```bash
# If you don't have vercel CLI installed:
npm i -g vercel

# Start the dev server
vercel dev
```

*Note: You can run just the frontend with `npm run dev`, but API calls to `/api/*` will fail unless routed through the Vercel dev server.*

<br/>

## 🛡️ Security Architecture

StudyOS takes security seriously:
- **Server-Side AI Integration:** API keys for Gemini are safely stored as Vercel Environment Variables and are completely hidden from the client browser.
- **Secured Endpoints:** Every sensitive API route requires a valid Bearer JWT.
- **Password Encryption:** User passwords are encrypted using `bcrypt` before ever reaching the Postgres database.

<br/>

## 📄 License
This project is licensed under the MIT License.
