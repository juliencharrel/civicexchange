"use client";
import { useRef, useEffect } from 'react';

interface ResizerProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  className?: string;
}

export default function Resizer({ 
  onResize, 
  minWidth = 300, 
  maxWidth = 600, 
  className = "" 
}: ResizerProps) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      const newWidth = e.clientX;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    resizer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [minWidth, maxWidth, onResize]);

  return (
    <div
      ref={resizerRef}
      className={`w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 flex items-center justify-center group ${className}`}
    >
      <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
    </div>
  );
}
