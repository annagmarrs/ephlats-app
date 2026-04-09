import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export function Card({ children, className = '', onClick, padding = true }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-neutral-200
        ${padding ? 'p-4' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
