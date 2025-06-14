
import { Bug } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const location = useLocation();
  const message = location.state?.message || "Sorry we couldn't access your budget. We're fixing it.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-finance-background text-center p-4">
      <div className="animate-pulse-wave">
        <Bug className="h-24 w-24 text-finance-danger" />
      </div>
      <h1 className="text-4xl font-bold mt-8 mb-4 text-finance-text">Oops, a bug!</h1>
      <p className="text-xl text-slate-600 mb-8 max-w-md">
        {message}
      </p>
      <Link
        to="/"
        className="px-8 py-3 bg-finance-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default ErrorPage;
