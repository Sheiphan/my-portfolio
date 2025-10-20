export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-900" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-xs sm:text-sm text-gray-400">
          © {currentYear} AI Engineer Portfolio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
