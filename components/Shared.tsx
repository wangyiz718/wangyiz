import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-eco-panel border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm bg-opacity-90 ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = ""
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  disabled?: boolean;
  className?: string;
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-eco-accent text-eco-dark hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-eco-highlight text-white hover:bg-blue-400 disabled:opacity-50",
    danger: "bg-eco-danger text-white hover:bg-red-400",
    ghost: "bg-transparent text-eco-muted hover:text-white border border-slate-700 hover:border-slate-500"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warn' | 'success' | 'danger' }) => {
  const styles = {
    info: "bg-blue-900 text-blue-200 border-blue-700",
    warn: "bg-yellow-900 text-yellow-200 border-yellow-700",
    success: "bg-emerald-900 text-emerald-200 border-emerald-700",
    danger: "bg-red-900 text-red-200 border-red-700",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${styles[type]}`}>
      {children}
    </span>
  );
};

export const Loader = () => (
  <div className="flex items-center justify-center space-x-2 animate-pulse text-eco-accent">
    <div className="w-2 h-2 bg-eco-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-eco-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-2 h-2 bg-eco-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

export const ToggleSwitch = ({ 
  options, 
  selected, 
  onChange 
}: { 
  options: { label: string; value: string }[]; 
  selected: string; 
  onChange: (val: string) => void; 
}) => {
  return (
    <div className="bg-slate-900 p-1 rounded-lg inline-flex border border-slate-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
            selected === opt.value
              ? 'bg-eco-accent text-eco-dark shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};