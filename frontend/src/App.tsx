import React from "react"; // Add this line
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginForm } from "./userLogin.tsx";
import { Dashboard } from "./dashboard";
import { SignupForm } from './userSignup.tsx'
import PrivateRoute from "./PrivateRoute";

import '../css/App.css'

//will move to another file soon//
function NotFound() {
    return (
        <div>
            <h1>404</h1>
            <p>Page not found</p>
            <Link to="/">Go home</Link>
        </div>
    )
}
function Home() {
    return (
        <div>
            <h1>Home</h1>
            <nav>
                <Link to="/login">Login</Link>
                <br />
                <Link to="/signup">Register</Link>
            </nav>
        </div>
    )
}
function App() {
  return (
      <div id="center">
        <BrowserRouter>
          <Routes>
            {/* Define which component shows for which URL */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
             <Route path="/signup" element={<SignupForm />} />
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
      }/>
              <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;