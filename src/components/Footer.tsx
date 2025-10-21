export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-900" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-gray-400">
            <a href="mailto:sheiphanshaijan@gmail.com" className="hover:text-blue-400 transition-colors">
              sheiphanshaijan@gmail.com
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="tel:+919370896602" className="hover:text-blue-400 transition-colors">
              +91 9370896602
            </a>
            <span className="hidden sm:inline">•</span>
            <span>Bengaluru, India</span>
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-400">
            © {currentYear} Sheiphan Joseph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
