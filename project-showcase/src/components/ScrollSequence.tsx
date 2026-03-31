"use client";

import React, { useRef, useEffect, useState } from 'react';
import { DrinkVariant } from '@/lib/constants';

interface ScrollSequenceProps {
  variant: DrinkVariant;
  onImageLoadProgress?: (progress: number) => void;
  onVideoEnd?: () => void;
}

export function ScrollSequence({ variant, onImageLoadProgress, onVideoEnd }: ScrollSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [frameSize, setFrameSize] = useState({ width: 1200, height: 675 });

  useEffect(() => {
    const updateFrameSize = () => {
      // Fill full hero height so the frame touches top and bottom of the viewport.
      const height = window.innerHeight;
      const width = height * videoAspect;

      setFrameSize({ width, height });
    };

    updateFrameSize();
    window.addEventListener('resize', updateFrameSize);
    return () => window.removeEventListener('resize', updateFrameSize);
  }, [videoAspect]);

  // Reset when variant changes so loading and playback start from frame zero.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoaded(false);
    setDuration(0);
    onImageLoadProgress?.(0);

    video.pause();
    video.currentTime = 0;
    video.load();
  }, [variant, onImageLoadProgress]);

  // Autoplay once for the active product; parent handles transition on end.
  useEffect(() => {
    if (!isLoaded || !duration) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleEnded = () => {
      onVideoEnd?.();
    };

    video.pause();
    video.currentTime = 0;
    video.loop = false;
    video.addEventListener('ended', handleEnded);
    video.playbackRate = 1;
    video.play().catch(() => {
      // Keep silent; browser autoplay policy may block in rare cases.
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLoaded, duration, onVideoEnd]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setVideoAspect(video.videoWidth / video.videoHeight);
    }
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    onImageLoadProgress?.(100);
  };

  const handleVideoError = () => {
    setIsLoaded(true);
    onImageLoadProgress?.(100);
  };

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
      style={{ transition: 'opacity 0.8s ease-in-out', opacity: isLoaded ? 1 : 0 }}
    >
      <div
        className="relative overflow-hidden bg-black"
        style={{ width: `${frameSize.width}px`, height: `${frameSize.height}px` }}
      >
        <video
          ref={videoRef}
          key={variant.id}
          src={variant.videoUrl}
          className="h-full w-full"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
        />
      </div>
    </div>
  );
}
