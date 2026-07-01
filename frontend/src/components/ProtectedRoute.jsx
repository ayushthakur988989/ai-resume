import { Navigate } from 'react-router-dom';
import { getUser } from '../api/api';

/**
 * ProtectedRoute – redirects to /login if user is not logged in.
 * Wrap any page that requires authentication with this component.
 */
function ProtectedRoute({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
