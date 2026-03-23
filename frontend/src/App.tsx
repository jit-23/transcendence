import React from "react"; // Add this line
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./userLog";
import { Dashboard } from "./dashboard";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Define which component shows for which URL */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={
    		<PrivateRoute>
      			<Dashboard />
    		</PrivateRoute>
  }/>     
        {/* Optional: Catch-all redirect */} // maybe insert a 404 page here instead
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;