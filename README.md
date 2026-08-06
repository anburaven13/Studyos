<div align="center">
  <div style="background-color: #4F46E5; width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
    <span style="color: white; font-size: 32px; font-weight: bold; font-family: sans-serif;">S</span>
  </div>
  <h1>StudyOS</h1>
  <p><strong>The ultimate all-in-one productivity operating system for students.</strong></p>
  <p>
    <a href="https://studyos-snowy.vercel.app" target="_blank">View Live Demo</a> · 
    <a href="#features">Explore Features</a> · 
    <a href="#tech-stack">Tech Stack</a> · 
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

StudyOS is a comprehensive, full-stack student dashboard designed to centralize and supercharge your academic life. It seamlessly combines task management, class scheduling, interactive note-taking, and AI-powered tutoring into a single, beautiful interface.

## ✨ Features

### 🎓 **Smart Dashboard**
Get a powerful, at-a-glance view of your academic day. See your next classes, pending assignments, and a dynamic countdown to your most pressing upcoming exam.

### 📝 **Persistent, Cloud-Synced Notes**
Take rich-text notes that automatically save to the cloud. You never have to worry about losing your work with our built-in 1-second debounce autosave system.

### 🧠 **AI Tutor & Flashcard Generator**
StudyOS integrates deeply with **Groq's Llama-3.3 70B** model, acting as your personal 24/7 tutor.
- **AI Chat:** Get instant, grade-tailored explanations for complex homework questions directly in your workspace.
- **Smart Flashcards:** Instantly generate study flashcards straight from your saved notes with a single click.

### ⏰ **Planner & Pomodoro Timer**
Stay focused and structured. The built-in Pomodoro timer helps you power through deep-work sessions while your daily timetable keeps you on track for your next class.

### 📚 **Homework & Exam Tracking**
- **Homework Manager:** Track assignments, deadlines, and get AI-estimated completion times. Easily delete completed tasks to clear your board.
- **Exam Hub:** Visually monitor your confidence levels across subjects and track precisely how many days, hours, and minutes remain until your next test.

### 🔄 **Daily Routines**
Build a customized daily schedule. Use the auto-generator to instantly structure a week's worth of time blocks based on your preferred wake and sleep times.

---

## 🛠 Tech Stack

StudyOS is built with modern, serverless web technologies to ensure a lightning-fast and secure experience:

**Frontend Ecosystem**
- **React 19** & **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** & **Lucide React** (Styling & Icons)
- **Zustand** (State Management)
- **React Router v7**

**Backend & Database**
- **Node.js** & **Express** (Serverless API Functions)
- **Neon Serverless Postgres** (`@neondatabase/serverless`)
- **Groq SDK** (AI API Integration)
- **JSON Web Tokens (JWT)** & **Bcrypt** (Secure Authentication)

**Deployment**
- Hosted on **Vercel**

---

## 🚀 Getting Started

Follow these instructions to set up StudyOS locally for development.

### 1. Prerequisites
- Node.js (v18+)
- A [Neon Postgres](https://neon.tech) database URL
- A [Groq API Key](https://console.groq.com/keys)

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
POSTGRES_URL=postgresql://user:password@endpoint.neon.tech/neondb

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# AI Integration
GROQ_API_KEY=gsk_your_groq_api_key_here

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

---

## 🛡️ Security Architecture

StudyOS takes security seriously:
- **Server-Side AI Integration:** API keys for Groq are safely stored as Vercel Environment Variables and are completely hidden from the client browser.
- **Secured Endpoints:** Every sensitive API route requires a valid Bearer JWT.
- **Password Encryption:** User passwords are encrypted using `bcrypt` before ever reaching the Postgres database.

---

## 📄 License
This project is licensed under the MIT License.
