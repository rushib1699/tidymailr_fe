import { createBrowserRouter, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ConnectAccountsPage from './pages/ConnectAccountsPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TasksPage from './pages/TasksPage';
import EmailsPage from './pages/EmailsPage';
import Layout from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/connect-accounts',
    element: <ConnectAccountsPage />,
  },
  {
    path: '/onboarding',
    element: (
      <Layout>
        <OnboardingPage />
      </Layout>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <DashboardPage />
      </Layout>
    ),
  },
  {
    path: '/emails',
    element: (
      <Layout>
        <EmailsPage />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
  },
  {
    path: '/tasks',
    element: (
      <Layout>
        <TasksPage />
      </Layout>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);