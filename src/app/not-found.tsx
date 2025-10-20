import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="space-y-6">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-300">
          Page Not Found
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-gray-200 rounded-lg transition-colors duration-200"
          >
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
