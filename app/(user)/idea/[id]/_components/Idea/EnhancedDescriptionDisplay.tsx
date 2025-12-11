"use client";
import { useState, useEffect, useCallback } from "react";
import { SerializedEditorState } from "lexical";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WrapperDescriptionDisplay from "./DescriptionDisplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface EnhancedDescriptionDisplayProps {
  content: SerializedEditorState | undefined;
  uploadedImages: string[];
}

const EnhancedDescriptionDisplay = ({
  content,
  uploadedImages,
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
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
        <>
          <Carousel className=" rounded-lg ">
            <CarouselContent className=" rounded-xl">
              {images.map((image, index) => (
                <CarouselItem
                  key={index}
                  className=" relative  "
                  onClick={() => openCarousel(index)}
                >
                  <div className="flex  rounded-2xl justify-center overflow-hidden items-center relative z-50  h-full w-full  cursor-pointer">

                      <img
                        src={image}
                        alt=""
                        className="max-h-[85vh] max-w-full object-contain  select-none relative z-20 "
                        draggable={false}
                      />
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full select-none absolute z-10  blur-xl"
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </>
      )}

      {/* Image Carousel Modal */}
      {isCarouselOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div>
            <Button
              variant="secondary"
              className="absolute top-6 right-6   px-4 py-2 rounded-lg"
              onClick={closeCarousel}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className=" absolute top-6 left-6 bg-secondary  px-4 py-2 border border-border rounded-lg">
              <p className="text-sm">
                {currentImageIndex + 1} / {images.length}
              </p>
            </div>

            <div
              className=" absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex items-center justify-center cursor-pointer select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={images[currentImageIndex]}
                draggable={false}
                className="max-h-[80vh] max-w-[90vw]"
              />
            </div>

            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  className="absolute top-1/2 left-4 -translate-y-1/2"
                  onClick={prevImage}
                  size={"icon-lg"}
                >
                  <HugeiconsIcon
                    icon={ArrowLeft02Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </Button>
                <Button
                  variant="ghost"
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                  onClick={nextImage}
                  size={"icon-lg"}
                >
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </Button>
              </>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full bg-white/50 cursor-pointer",
                      index === currentImageIndex ? "bg-primary" : "bg-white/50"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDescriptionDisplay;
