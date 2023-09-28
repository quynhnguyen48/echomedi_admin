import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Login = React.lazy(() => import("pages/Login"));
const HealthFinder = React.lazy(() => import("pages/HealthFinder"));
const EnHealthFinder = React.lazy(() => import("pages/HealthFinderEN"));

const AuthRoutes = () => {
  return (
    <React.Suspense fallback={<span>Loading</span>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/health_finder" element={<HealthFinder />} />
        <Route path="/en_health_finder" element={<EnHealthFinder />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </React.Suspense>
  );
};

export default AuthRoutes;
