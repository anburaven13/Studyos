import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Homework from './pages/Homework';
import Planner from './pages/Planner';
import Tutor from './pages/Tutor';
import ExamHub from './pages/ExamHub';
import Workspace from './pages/Workspace';
import Landing from './pages/Landing';
import Routines from './pages/Routines';
import Genome from './pages/Genome';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/" element={<Landing />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="homework" element={<Homework />} />
              <Route path="planner" element={<Planner />} />
              <Route path="tutor" element={<Tutor />} />
              <Route path="exams" element={<ExamHub />} />
              <Route path="routines" element={<Routines />} />
              <Route path="workspace" element={<Workspace />} />
              <Route path="genome" element={<Genome />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
