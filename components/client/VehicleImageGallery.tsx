"use client";

import { useState } from "react";
import Image from "next/image";

interface VehicleImageGalleryProps {
  photos: string[];
  alt: string;
}

export default function VehicleImageGallery({
  photos,
  alt,
}: VehicleImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative h-100 bg-slate-200 rounded-lg overflow-hidden">
        <Image
          src={photos[selectedImage]}
          alt={`${alt} - Photo ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative h-20 bg-slate-200 rounded-lg overflow-hidden border-2 transition ${
              selectedImage === index ? "border-primary" : "border-transparent"
            }`}
          >
            <Image
              src={photo}
              alt={`${alt} - Miniature ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
