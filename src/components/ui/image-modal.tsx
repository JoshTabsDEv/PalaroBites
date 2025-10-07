"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt, title }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-4xl sm:max-h-[90vh] p-0">
        <div className="relative">
          {/* Simple Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold truncate pr-2">{title || alt}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Simple Image Display */}
          <div className="p-2 sm:p-4">
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-auto max-h-[75vh] sm:max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
