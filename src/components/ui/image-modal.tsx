"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt, title }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.3, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.3, 0.3));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        handleRotate();
        break;
      case '0':
        handleReset();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] p-0 bg-black border-none sm:max-w-[98vw] sm:max-h-[98vh]">
        <div className="relative w-full h-full flex flex-col">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between p-2 sm:p-3 bg-black/90 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              {title && (
                <h3 className="text-sm sm:text-lg font-medium text-white truncate">
                  {title}
                </h3>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {/* Mobile: Show only essential controls */}
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Download image"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  disabled={scale <= 0.3}
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-white/80 min-w-[50px] text-center font-mono">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  disabled={scale >= 4}
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  title="Reset"
                >
                  Reset
                </Button>
              </div>
              
              {/* Mobile: Simplified controls */}
              <div className="flex sm:hidden items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20 h-10 w-10 p-0"
                  disabled={scale <= 0.3}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-xs text-white/80 min-w-[40px] text-center font-mono">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20 h-10 w-10 p-0"
                  disabled={scale >= 4}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white hover:bg-white/20 h-10 w-10 p-0"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-8 sm:w-8 p-0 ml-2"
                title="Close"
              >
                <X className="h-4 w-4 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Image container - Mobile Optimized */}
          <div 
            className="flex-1 overflow-hidden flex items-center justify-center bg-gray-900 touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={(e) => {
              // Prevent default touch behaviors for better mobile experience
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              // Prevent scrolling when touching the image
              e.preventDefault();
            }}
          >
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-none select-none shadow-2xl touch-none"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                maxHeight: '85vh',
                maxWidth: '95vw',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Footer - Mobile Optimized */}
          <div className="p-2 sm:p-3 bg-black/80 backdrop-blur-sm border-t border-white/10">
            <p className="text-xs sm:text-sm text-white/60 text-center">
              <span className="hidden sm:inline">Scroll to zoom • Drag to pan • ESC to close</span>
              <span className="sm:hidden">Pinch to zoom • Drag to pan • Tap X to close</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
