import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Login = React.lazy(() => import("pages/Login"));

const AuthRoutes = () => {
  return (
    <React.Suspense fallback={<span>Loading</span>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </React.Suspense>
  );
};

export default AuthRoutes;
