import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h1 className="text-6xl font-bold text-primary-600">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Page Not Found</h2>
          <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;