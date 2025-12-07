import React, { useEffect, useState } from "react";

export default function MediaCarousel({ media = [], interval = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!media || media.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % media.length);
    }, interval);

    return () => clearInterval(timer);
  }, [media, interval]);

  if (!media || media.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No media
      </div>
    );
  }

  const current = media[index];

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
        {current.type === "video" ? (
          <video
            src={current.url}
            autoPlay
            muted
            loop
            className="w-full h-full object-contain rounded"
          />
        ) : (
          <img
            src={current.url}
            alt=""
            className="w-full h-full object-contain rounded"
          />
        )}
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from "react";

// export default function MediaCarousel({ media = [], interval = 5000 }) {
//   const [index, setIndex] = useState(0);
//   const [show, setShow] = useState(true); // for fade-in/out

//   useEffect(() => {
//     if (!media || media.length === 0) return undefined;

//     const mainTimer = setInterval(() => {
//       // trigger fade out
//       setShow(false);

//       // after fade out (1s) switch and fade in
//       const swap = setTimeout(() => {
//         setIndex((i) => (i + 1) % media.length);
//         setShow(true);
//       }, 1000); // must match CSS transition time

//       return () => clearTimeout(swap);
//     }, interval);

//     return () => clearInterval(mainTimer);
//   }, [media, interval]);

//   if (!media || media.length === 0) return null;

//   const item = media[index];

//   return (
//     <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
//       <div
//         className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}
//         key={index}
//       >
//         {item.type === "video" ? (
//           <video
//             src={item.url}
//             autoPlay
//             muted
//             loop
//             playsInline
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <img src={item.url} alt={`media-${index}`} className="w-full h-full object-cover" />
//         )}
//       </div>
//     </div>
//   );
// }

// ----------------------------------------------------------------------

// import React, { useState, useEffect } from "react";

// export default function MediaCarousel({ media, interval = 5000 }) {
//   const [index, setIndex] = useState(0);
//   const [fade, setFade] = useState(true); // fade state for transition

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setFade(false);

//       setTimeout(() => {
//         setIndex((prev) => (prev + 1) % media.length);
//         setFade(true);
//       }, 1000); // duration matches CSS fade duration (1s)
//     }, interval);

//     return () => clearInterval(timer);
//   }, [media.length, interval]);

//   const current = media[index];

//   return (
//     <div className={`carousel-media ${fade ? "fade-in" : "fade-out"}`}>
//       {current.type === "image" && (
//         <img src={current.url} alt="Media" className="media-content" />
//       )}

//       {current.type === "video" && (
//         <video
//           src={current.url}
//           autoPlay
//           muted
//           loop
//           className="media-content"
//         ></video>
//       )}
//     </div>
//   );
// }
