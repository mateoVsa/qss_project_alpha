import { useState } from "react";

const ProgressiveImage = ({
  src,
  alt,
  className,
  style,
}) => {
  const [loaded, setLoaded] = useState(false);

  // Imagen borrosa ultra liviana
  const blurSrc = src.includes("cloudinary")
    ? src.replace("/upload/", "/upload/w_50,e_blur:1000,q_1/")
    : src;

  // Imagen final optimizada
  const fullSrc = src.includes("cloudinary")
    ? src.replace("/upload/", "/upload/f_auto,q_auto/")
    : src;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Imagen borrosa */}
      <img
        src={blurSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          filter: "blur(20px)",
          transform: "scale(1.1)",
          position: "absolute",
          inset: 0,
          opacity: loaded ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Imagen HD */}
      <img
        src={fullSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
    </div>
  );
};

export default ProgressiveImage;