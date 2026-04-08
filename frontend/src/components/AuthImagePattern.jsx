import { useState } from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  const [theme, setTheme] = useState("night");

  const toggleTheme = () => {
    const newTheme = theme === "night" ? "light" : "night";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12 relative overflow-hidden">

      {/* 🌈 Background glow */}
      <div className="absolute w-96 h-96 bg-primary/20 blur-3xl rounded-full top-[-100px] left-[-100px]"></div>
      <div className="absolute w-96 h-96 bg-secondary/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]"></div>

      {/* 🌙 Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="btn btn-sm btn-primary absolute top-6 right-6"
      >
        {theme === "night" ? "🌞 Light" : "🌙 Night"}
      </button>

      <div className="max-w-md text-center z-10">
        
        {/* 🔲 Animated grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-2xl 
                bg-gradient-to-br from-primary/30 to-secondary/30
                backdrop-blur-lg
                border border-base-300
                shadow-lg
                transition-all duration-500
                hover:scale-110 hover:rotate-3
                ${i % 2 === 0 ? "animate-pulse" : ""}
              `}
            />
          ))}
        </div>

        {/* ✨ Title */}
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h2>

        {/* 📝 Subtitle */}
        <p className="text-base-content opacity-70 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthImagePattern;