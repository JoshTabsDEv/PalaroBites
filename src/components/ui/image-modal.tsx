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
      <DialogContent className="max-w-[100vw] max-h-[100vh] p-0 bg-black border-none sm:max-w-[95vw] sm:max-h-[95vh] sm:rounded-lg">
        <div className="relative w-full h-full flex flex-col">
          {/* Header - Clean Professional Design */}
          <div className="flex items-center justify-between p-3 bg-black/95 backdrop-blur-md border-b border-white/20">
            <div className="flex items-center flex-1 min-w-0">
              {title && (
                <h3 className="text-base font-medium text-white truncate pr-4">
                  {title}
                </h3>
              )}
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                disabled={scale <= 0.3}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="bg-white/10 rounded-full px-3 py-1">
                <span className="text-sm text-white font-mono">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                disabled={scale >= 4}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                title="Rotate"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-white hover:bg-white/20 px-3 py-1 rounded-full text-sm"
                title="Reset"
              >
                Reset
              </Button>
            </div>
            
            {/* Mobile Controls - Clean and Simple */}
            <div className="flex sm:hidden items-center space-x-2">
              <div className="flex items-center bg-white/10 rounded-full px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  disabled={scale <= 0.3}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-white font-mono mx-2 min-w-[35px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  disabled={scale >= 4}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                title="Reset"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full ml-2"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Image container - Professional Design */}
          <div 
            className="flex-1 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 to-black touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={(e) => {
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative">
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-none select-none shadow-2xl touch-none rounded-lg"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  maxHeight: 'calc(100vh - 140px)',
                  maxWidth: 'calc(100vw - 40px)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))'
                }}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Footer - Clean and Minimal */}
          <div className="p-3 bg-black/95 backdrop-blur-md border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-xs text-white/70">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <span>Pinch to zoom</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <span>Drag to pan</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <span>Tap X to close</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
