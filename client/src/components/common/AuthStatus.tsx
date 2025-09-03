import { useAuth } from '../contexts/AuthContext';

// Component to display current auth status and user info
const AuthStatus = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-red-800 text-sm">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-800 text-sm font-medium">
            Welcome, {user?.name}
          </p>
          <p className="text-green-600 text-xs">
            Role: {user?.role} | Email: {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="text-green-700 hover:text-green-900 text-sm underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthStatus;