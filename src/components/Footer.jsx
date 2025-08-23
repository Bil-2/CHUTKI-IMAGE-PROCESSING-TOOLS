import React from "react";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 text-gray-800 dark:text-gray-200 pt-8 mt-16 border-t border-purple-300/40 dark:border-purple-500/40">
      <div className="max-w-7xl mx-auto px-6 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {/* Logo & Privacy */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://img.icons8.com/fluency/96/bot.png"
              alt="Chutki Logo"
              className="w-10 h-10 animate-bounce-slow drop-shadow-lg hover:scale-110 hover:rotate-6 transition-transform duration-300"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
              Chutki Image Tool
            </span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed px-3 py-1.5 
            bg-gradient-to-r from-yellow-50 via-pink-50 to-yellow-50 dark:from-indigo-900/50 dark:via-purple-900/40 dark:to-indigo-800/50
            border border-yellow-300/40 dark:border-indigo-400/40
            rounded-md shadow-sm
            text-gray-800 dark:text-indigo-100 font-medium">
            <span className="font-semibold text-yellow-700 dark:text-indigo-300">Privacy Notice:</span>  
            Your images are deleted automatically after{" "}
            <span className="font-semibold text-yellow-700 dark:text-indigo-200">30 minutes</span>.  
            We care about your{" "}
            <span className="underline underline-offset-2 decoration-yellow-400 dark:decoration-indigo-400">privacy</span> and security.
          </p>
        </div>

        {/* Tools Section */}
        <div className="sm:col-span-2 md:col-span-2 flex flex-row gap-8">
          {/* GIF Tools */}
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">GIF Tools</h4>
            <ul className="space-y-2 text-sm">
              {["GIF Maker", "GIF Compressor", "Add Text to GIFs"].map((tool, i) => (
                <li
                  key={i}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>

          {/* Chutki Tools */}
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">Chutki Tools</h4>
            <ul className="space-y-2 text-sm">
              {["Chutki PDF Tool", "Convert Video to GIF", "List of Image Tools"].map((tool, i) => (
                <li
                  key={i}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider & Social Links */}
      <div className="border-t border-purple-300/40 dark:border-purple-500/40 mt-6 pt-4 text-center">
        <div className="flex justify-center gap-6 mb-4">
          {/* YouTube */}
          <a
            href="https://youtube.com/YourChannelName"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
            aria-label="YouTube"
          >
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.12C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.386.566A2.994 2.994 0 0 0 .502 6.186 31.18 31.18 0 0 0 0 12a31.18 31.18 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.112 2.12C4.495 20.5 12 20.5 12 20.5s7.505 0 9.386-.566a2.994 2.994 0 0 0 2.112-2.12A31.18 31.18 0 0 0 24 12a31.18 31.18 0 0 0-.502-5.814ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
            </svg>
          </a>

          {/* Facebook */}
         <a
  href="https://linkedin.com/in/your-profile"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:scale-110 transition-transform"
  aria-label="LinkedIn"
>
  <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.037-1.852-3.037-1.853 0-2.137 1.445-2.137 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.601 0 4.267 2.371 4.267 5.455v6.288zM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13zM6.963 20.452H3.713V9h3.25v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.225.792 24 1.771 24h20.451C23.2 24 24 23.225 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
</a>


          {/* X (Twitter) */}
          <a
            href="https://twitter.com/your_username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
            aria-label="X"
          >
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.5 2h3l-7.5 9.4L21 22h-5.8l-4.6-6.4L6 22H3l8.3-10.4L3 2h5.8l4 5.6L17.5 2z" />
            </svg>
          </a>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          © 2025 Made with <span className="text-red-500">♥</span> by{" "}
          <a
            href="https://github.com/Bil-2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-900 dark:text-purple-300 font-semibold hover:underline hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Bil-2
          </a>{" "}
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
