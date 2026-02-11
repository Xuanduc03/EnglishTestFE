import './App.scss';
import { Route, Routes, Navigate } from 'react-router-dom';
import { StudentLayout, AdminLayout } from './layouts';
import { PublicRoute } from './routes/publicRoute';
import { AdminRoute } from './routes/adminRoute';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import "./theme.scss";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "antd/dist/reset.css";
import { App as AntdApp } from 'antd';
import ProtectedRoute from './routes/ProtectedRoute';

const renderRoutes = (routes: any[], isChild = false) =>
  routes.map((route, idx) => {
    const Page = route.component;
    const LayoutComponent = route.layout === null
      ? null
      : (route.layout || StudentLayout);
    // Nếu có children, render Outlet và children
    if (route.children) {
      return (
        <Route
          key={idx}
          path={route.path}
          element={
            isChild
              ? <Page />
              : (LayoutComponent ? <LayoutComponent><Page /></LayoutComponent> : <Page />)
          }
        >
          {renderRoutes(route.children, true)}
        </Route>
      );
    }
    // Nếu là redirect (index route)
    if (route.index) {
      return (
        <Route
          key={idx}
          index
          element={<Navigate to={route.redirect} replace />}
        />
      );
    }
    // Route thường
    return (
      <Route
        key={idx}
        path={route.path}
        element={
          isChild
            ? <Page />
            : (LayoutComponent ? <LayoutComponent><Page /></LayoutComponent> : <Page />)
        }
      />
    );
  });

const App: React.FC = () => {

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AntdApp>
        <div className="App">
          <Routes>
            {renderRoutes(PublicRoute)}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Teacher']} />}>
              {renderRoutes(AdminRoute)}
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AntdApp>
    </GoogleOAuthProvider>
  );
};

export default App;