"use client";
import { useState, useEffect, useCallback } from "react";
import { SerializedEditorState } from "lexical";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import WrapperDescriptionDisplay from "./DescriptionDisplay";

interface EnhancedDescriptionDisplayProps {
  content: SerializedEditorState | undefined;
  uploadedImages: string[];
}

const EnhancedDescriptionDisplay = ({ 
  content, 
  uploadedImages 
}: EnhancedDescriptionDisplayProps) => {
  const [images] = useState<string[]>(uploadedImages);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const MIN_SWIPE_DISTANCE = 50;
  const hasImages = images && images.length > 0;
  const hasMultipleImages = images && images.length > 1;

  const closeCarousel = useCallback(() => {
    setIsCarouselOpen(false);
    setCurrentImageIndex(0);
  }, []);

  const nextImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length, hasImages]);

  const prevImage = useCallback(() => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => 
      (prev - 1 + images.length) % images.length
    );
  }, [images.length, hasImages]);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  const openCarousel = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselOpen(true);
  }, []);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselOpen) return;

      switch (e.key) {
        case "Escape":
          closeCarousel();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCarouselOpen]);

  // Touch/swipe support for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
  };


  return (
    <div className="w-full space-y-8">
      {/* Description Text First */}
      {content && (
        <div className="w-full text-foreground">
          <WrapperDescriptionDisplay content={content} />
        </div>
      )}

      {/* Images Gallery Below Description */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h3 className="text-lg font-outfit font-semibold text-foreground">
              Images ({images.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-muted/20 border border-border/30 hover:border-border/60 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => openCarousel(index)}
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Carousel Modal */}
      {isCarouselOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={closeCarousel}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div
              className="flex items-center justify-center h-full"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={images[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
                draggable={false}
              />
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-12 h-12 rounded-md overflow-hidden transition-opacity duration-200 ${
                      index === currentImageIndex
                        ? "opacity-100 ring-2 ring-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => goToImage(index)}
                  >
                    <img
                      src={images[index]}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDescriptionDisplay;
