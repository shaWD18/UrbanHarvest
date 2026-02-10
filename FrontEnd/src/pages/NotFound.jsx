function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-bold text-rustic-clay mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>

      <a
        href="/"
        className="px-6 py-3 bg-rustic-green text-white rounded-lg hover:bg-rustic-moss transition"
      >
        Go Back Home
      </a>
    </div>
  );
}

export default NotFound;
