"use client";

import { FaStar } from "react-icons/fa6";
import Image from "next/image";
import { useGymGallery } from "../data/gymData";

interface GalleryProps {
  isPageHeader?: boolean;
}

export default function Gallery({ isPageHeader = false }: GalleryProps) {
  const Heading = isPageHeader ? "h1" : "h2";
  const [galleryImages] = useGymGallery();

  return (
    <>
      <section id="gallery" className="section gallerySection">
        <div className="sectionHeader">
          <p className="eyebrow dark">
            <FaStar /> Gallery
          </p>
          <Heading>Inside Fitness Bhaktapur</Heading>
        </div>
        <div className="galleryGrid">
          {galleryImages.length > 0 ? (
            galleryImages.map((image, index) => (
              <Image
                src={image}
                alt={`Gym interior training equipment and activities ${index + 1}`}
                key={`${image}-${index}`}
                className={`galleryItem item${index + 1}`}
                id={`gallery-image-${index}`}
                width={500}
                height={350}
                unoptimized
              />
            ))
          ) : (
            <div className="galleryEmptyState">
              <h3>Gallery coming soon</h3>
              <p>New facility photos will appear here after they are added from the admin panel.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
