import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import MediaCarousel from "./MediaCarousel";

function convertDriveToThumbnail(url) {
  if (!url || typeof url !== "string") return url || "";
  if (url.includes("googleusercontent.com") || url.includes("thumbnail?id=")) return url;

  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1 && m1[1]) return `https://drive.google.com/thumbnail?id=${m1[1]}`;

  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2 && m2[1]) return `https://drive.google.com/thumbnail?id=${m2[1]}`;

  return url;
}

export default function DisplayScreen() {
  const [smallTiles, setSmallTiles] = useState([]);
  const [bigTiles, setBigTiles] = useState([]);
  const [tickerText, setTickerText] = useState("");
  const [timerExtra, setTimerExtra] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 🔥 FIXED — Proper conversion function for media arrays
  function normalizeMedia(d) {
    let media = [];

    if (Array.isArray(d.media)) {
      media = d.media
        .filter((x) => typeof x === "string" && x.trim().length > 0)
        .map((link) => ({
          type: link.includes(".mp4") ? "video" : "image",
          url: convertDriveToThumbnail(link),
        }));
    }

    // Fallback to old single imageUrl
    if (media.length === 0 && d.imageUrl) {
      media.push({
        type: "image",
        url: convertDriveToThumbnail(d.imageUrl),
      });
    }

    return media;
  }

  useEffect(() => {
    const smallRef = ref(db, "smallTiles");
    const bigRef = ref(db, "bigTiles");
    const tickerRef = ref(db, "settings/ticker");
    const timerRef = ref(db, "settings/timer");
    const logoRef = ref(db, "settings/global/logoUrl");

    const unsubSmall = onValue(smallRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, d]) => ({
        id,
        ...d,
        media: normalizeMedia(d),
      }));
      setSmallTiles(arr);
    });

    const unsubBig = onValue(bigRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, d]) => ({
        id,
        ...d,
        media: normalizeMedia(d),
      }));
      setBigTiles(arr);
    });

    onValue(tickerRef, (snap) => setTickerText(snap.val()?.text || ""));

    onValue(timerRef, (snap) => {
      const v = snap.val();
      if (typeof v === "object" && v?.value) setTimerExtra(v.value);
      else setTimerExtra(v || "");
    });

    onValue(logoRef, (snap) => {
      const v = snap.val();
      setLogoUrl(v ? convertDriveToThumbnail(v) : null);
    });

    return () => {
      unsubSmall();
      unsubBig();
    };
  }, []);

  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  return (
    <div className="w-screen h-screen p-6 bg-white relative overflow-hidden">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="logo"
          className="fixed top-4 left-4 w-24 z-40 bg-white/40 backdrop-blur rounded"
        />
      )}

      {/* MAIN LAYOUT */}
      <div className="flex gap-6 h-full">
        {/* LEFT SMALL TILES */}
        <div className="flex flex-col gap-4 w-1/4 min-w-[220px] ml-28">
          {smallTiles.map((tile) => (
            <div key={tile.id} className="bg-lime-600/20 border border-lime-400 p-4 rounded-xl">
              {tile.media.length > 0 && tile.imagePosition === "above" && (
                <img
                  src={tile.media[0].url}
                  className="w-full max-h-28 object-contain mb-2 rounded"
                />
              )}

              <h3 className="text-lg font-semibold">{tile.title}</h3>
              <p className="text-sm mt-1 opacity-80 whitespace-pre-wrap">{tile.content}</p>

              {tile.media.length > 0 && tile.imagePosition === "below" && (
                <img
                  src={tile.media[0].url}
                  className="w-full max-h-28 object-contain mt-2 rounded"
                />
              )}
            </div>
          ))}
        </div>

        {/* RIGHT BIG TILE */}
        <div className="flex-1 flex flex-col gap-4">
          {bigTiles.length === 0 ? (
            <div className="flex-1 rounded-2xl bg-gray-100 flex items-center justify-center">
              No big tiles configured
            </div>
          ) : (
            bigTiles.map((tile) => (
              <div key={tile.id} className="flex-1 rounded-2xl p-6 bg-gray-100 relative overflow-hidden">
                <h2 className="text-3xl font-bold text-center">{tile.title}</h2>
                <p className="text-lg text-center mt-2 max-w-3xl mx-auto opacity-80 whitespace-pre-wrap">
                  {tile.content}
                </p>

                <div className="absolute inset-x-6 top-32 bottom-6 overflow-hidden">
                  <MediaCarousel media={tile.media} interval={5000} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-4 left-4 right-4 flex items-center">
        <div className="flex-1 overflow-hidden bg-black/30 border border-lime-500 rounded px-3 py-2">
          <div className="inline-block whitespace-nowrap animate-marquee text-lime-300 text-lg">
            {tickerText}
          </div>
        </div>

        <div className="ml-4 text-right text-lime-300">
          <div className="text-2xl font-semibold">{timeStr}</div>
          <div className="text-sm">{dateStr}</div>
          {timerExtra && <div className="text-sm mt-1">{timerExtra}</div>}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%) }
          100% { transform: translateX(-100%) }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { db } from "../firebase/firebaseConfig";
// import MediaCarousel from "./MediaCarousel";

// /**
//  * DisplayScreen:
//  * - left column: smallTiles (vertical)
//  * - right main column: big tiles (grid or main)
//  * - bottom: ticker (marquee) + clock bottom-right
//  * - floating logo on top-left (offset so it doesn't overlap small tiles)
//  *
//  * Important: this file converts Drive links at read-time to thumbnail links if needed.
//  */

// // small helper to convert drive links to thumbnail URL (fallback)
// function convertDriveToThumbnail(url) {
//   if (!url || typeof url !== "string") return url || "";
//   // if already drive thumbnail pattern or googleusercontent, keep it
//   if (url.includes("googleusercontent.com") || url.includes("thumbnail?id=")) return url;
//   // attempt to extract id from patterns
//   const m1 = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
//   if (m1 && m1[1]) return `https://drive.google.com/thumbnail?id=${m1[1]}`;
//   const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
//   if (m2 && m2[1]) return `https://drive.google.com/thumbnail?id=${m2[1]}`;
//   // fallback: return original
//   return url;
// }

// export default function DisplayScreen() {
//   const [smallTiles, setSmallTiles] = useState([]);
//   const [bigTiles, setBigTiles] = useState([]);
//   const [tickerText, setTickerText] = useState("");
//   const [timerExtra, setTimerExtra] = useState("");
//   const [logoUrl, setLogoUrl] = useState(null);

//   // clock
//   const [now, setNow] = useState(new Date());
//   useEffect(() => {
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     const smallRef = ref(db, "smallTiles");
//     const bigRef = ref(db, "bigTiles");
//     const tickerRef = ref(db, "settings/ticker");
//     const timerRef = ref(db, "settings/timer");
//     const globalLogoRef = ref(db, "settings/global/logoUrl");

//     const unsubSmall = onValue(smallRef, (snap) => {
//       const val = snap.val() || {};
//       // val might be {key: {title,content,media:[]}} or an array-like object
//       const arr = Object.entries(val).map(([id, d]) => {
//         // normalize media: convert drive links at read-time
//         const media = (d.media || []).map((m) => {
//           if (!m || !m.url) return m;
//           return { ...m, url: convertDriveToThumbnail(m.url) };
//         });
//         // legacy support: if imageUrl exists, convert into media[0]
//         if ((!media || media.length === 0) && d.imageUrl) {
//           media.push({ type: "image", url: convertDriveToThumbnail(d.imageUrl) });
//         }
//         return { id, ...d, media };
//       });
//       setSmallTiles(arr);
//     });

//     const unsubBig = onValue(bigRef, (snap) => {
//       const val = snap.val() || {};
//       const arr = Object.entries(val).map(([id, d]) => {
//         const media = (d.media || []).map((m) => {
//           if (!m || !m.url) return m;
//           return { ...m, url: convertDriveToThumbnail(m.url) };
//         });
//         // legacy fallback
//         if ((!media || media.length === 0) && d.imageUrl) {
//           media.push({ type: "image", url: convertDriveToThumbnail(d.imageUrl) });
//         }
//         return { id, ...d, media };
//       });
//       setBigTiles(arr);
//     });

//     const unsubTicker = onValue(tickerRef, (snap) => {
//       setTickerText(snap.val()?.text || "");
//     });

//     const unsubTimer = onValue(timerRef, (snap) => {
//       // support both object {value: 'x'} or plain string
//       const v = snap.val();
//       if (v && typeof v === "object" && "value" in v) setTimerExtra(v.value || "");
//       else setTimerExtra(v || "");
//     });

//     const unsubLogo = onValue(globalLogoRef, (snap) => {
//       const v = snap.val() || null;
//       setLogoUrl(v ? convertDriveToThumbnail(v) : null);
//     });

//     return () => {
//       unsubSmall();
//       unsubBig();
//       unsubTicker();
//       unsubTimer();
//       unsubLogo();
//     };
//   }, []);

//   // format time / date
//   const timeStr = now.toLocaleTimeString();
//   const dateStr = now.toLocaleDateString();

//   return (
//     <div className="w-screen h-screen p-6 bg-white relative overflow-hidden">
//       {/* FLOATING LOGO (offset so it doesn't overlap left column) */}
//       {logoUrl && (
//         <img
//           src={logoUrl}
//           alt="logo"
//           className="fixed top-4 left-4 w-24 h-auto object-contain z-40 drop-shadow"
//           style={{ borderRadius: 6, background: "rgba(255,255,255,0.4)" }}
//         />
//       )}

//       {/* Layout: left small tiles column + right main area */}
//       <div className="flex gap-6 h-full">
//         {/* Left column */}
//         <div className="flex flex-col gap-4 w-1/4 min-w-[220px] ml-28"> {/* ml-28 to prevent logo overlap */}
//           {smallTiles.map((tile) => (
//             <div key={tile.id} className="bg-lime-600 bg-opacity-20 border border-lime-400 rounded-xl p-4 backdrop-blur-sm">
//               {tile.media && tile.media.length > 0 && tile.imagePosition === "above" && (
//                 <img src={tile.media[0].url} alt={tile.title} className="w-full max-h-28 object-contain mb-2 rounded" />
//               )}
//               <h3 className="text-lg font-semibold">{tile.title}</h3>
//               <p className="text-sm opacity-80 mt-1 whitespace-pre-wrap">{tile.content}</p>
//               {tile.media && tile.media.length > 0 && tile.imagePosition === "below" && (
//                 <img src={tile.media[0].url} alt={tile.title} className="w-full max-h-28 object-contain mt-2 rounded" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Right main area */}
//         <div className="flex-1 flex flex-col gap-4">
//           {/* For now show the first big tile (you can expand to multiple) */}
//           {bigTiles.length === 0 ? (
//             <div className="flex-1 border rounded-2xl p-6 bg-gray-100 flex items-center justify-center">
//               <div className="text-xl text-gray-500">No big tiles configured</div>
//             </div>
//           ) : (
//             bigTiles.map((tile, idx) => (
//               <div key={tile.id} className="flex-1 border rounded-2xl p-6 bg-gray-100 relative overflow-hidden">
//                 <div className="mb-4">
//                   <h2 className="text-3xl font-bold text-center">{tile.title}</h2>
//                   <p className="text-lg text-center mt-2 opacity-90 max-w-3xl mx-auto whitespace-pre-wrap">{tile.content}</p>
//                 </div>

//                 {/* MEDIA AREA (carousel). fits the remaining card area */}
//                 <div className="absolute inset-x-6 bottom-6 top-32 rounded overflow-hidden">
//                   {/* if media array exists */}
//                   {Array.isArray(tile.media) && tile.media.length > 0 ? (
//                     <MediaCarousel media={tile.media} interval={5000} />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-500">
//                       No media
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* FOOTER: ticker running + clock bottom-right */}
//       <div className="fixed bottom-4 left-4 right-4 flex items-center">
//         {/* marquee / ticker */}
//         <div className="flex-1 overflow-hidden bg-black bg-opacity-30 border border-lime-500 rounded px-3 py-2">
//           <div className="inline-block whitespace-nowrap animate-marquee text-lime-300 text-lg">
//             {tickerText}
//           </div>
//         </div>

//         {/* clock */}
//         <div className="ml-4 text-right text-lime-300 opacity-90">
//           <div className="text-2xl font-semibold">{timeStr}</div>
//           <div className="text-sm">{dateStr}</div>
//           {timerExtra && <div className="text-sm mt-1">{timerExtra}</div>}
//         </div>
//       </div>

//       {/* small marquee keyframes injected inline because Tailwind custom keyframes may differ */}
//       <style>{`
//         @keyframes marquee {
//           0% { transform: translateX(100%); }
//           100% { transform: translateX(-100%); }
//         }
//         .animate-marquee {
//           animation: marquee 18s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// --------------------------------------------------------------------------------------------------------

// import React, { useEffect, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { db } from "../firebase/firebaseConfig";
// import MediaCarousel from "./MediaCarousel";
// import "./DisplayScreen.css";

// export default function DisplayScreen() {
//   const [settings, setSettings] = useState(null);
//   const [bigTiles, setBigTiles] = useState([]);
//   const [announcement, setAnnouncement] = useState("");

//   useEffect(() => {
//     onValue(ref(db, "settings/global"), (snapshot) => {
//       setSettings(snapshot.val() || {});
//     });

//     onValue(ref(db, "announcement"), (snapshot) => {
//       setAnnouncement(snapshot.val());
//     });

//     onValue(ref(db, "bigTiles"), (snapshot) => {
//       const data = snapshot.val();
//       if (!data) return;
//       setBigTiles(Object.keys(data).map((id) => ({ id, ...data[id] })));
//     });
//   }, []);

//   if (!settings) return null;

//   return (
//     <div className="display-screen">

//       {/* LOGO - FIXED TOP LEFT */}
//       {settings.logoUrl && (
//         <img
//           src={settings.logoUrl}
//           className="logo"
//           alt="Logo"
//         />
//       )}

//       {/* LIVE ANNOUNCEMENT TEXT */}
//       <div className="announcement-text">{announcement}</div>

//       {/* MAIN TILE (FIRST ONE) */}
//       {bigTiles.length > 0 && (
//         <div className="big-tile">
//           <h1 className="tile-title">{bigTiles[0].title}</h1>
//           <p className="tile-content">{bigTiles[0].content}</p>

//           {Array.isArray(bigTiles[0].media) && bigTiles[0].media.length > 0 && (
//             <MediaCarousel media={bigTiles[0].media} interval={5000} />
//           )}
//         </div>
//       )}

//       {/* TIMER - BOTTOM RIGHT */}
//       <div className="footer-timer">
//         {new Date().toLocaleString("id-ID", {
//           weekday: "long",
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         })}
//       </div>
//     </div>
//   );
// }
// -------------------------------------------------------------------------------------------

// import React, { useEffect, useState } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { ref, onValue } from "firebase/database";

// export default function DisplayScreen() {
//   const [smallTiles, setSmallTiles] = useState([]);
//   const [bigTiles, setBigTiles] = useState([]);
//   const [tickerText, setTickerText] = useState("");
//   const [timerExtra, setTimerExtra] = useState("");
//   const [globalLogo, setGlobalLogo] = useState(null);

//   // local clock state
//   const [now, setNow] = useState(new Date());

//   useEffect(() => {
//     // update clock every second
//     const iv = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(iv);
//   }, []);

//   useEffect(() => {
//     const smallRef = ref(db, "smallTiles");
//     const bigRef = ref(db, "bigTiles");
//     const tickerRef = ref(db, "settings/ticker");
//     const timerRef = ref(db, "settings/timer/value");
//     const globalRef = ref(db, "settings/global/logoUrl");

//     const unsubSmall = onValue(smallRef, (snap) => {
//       const val = snap.val() || {};
//       const arr = Object.entries(val).map(([id, d]) => ({ id, ...d }));
//       setSmallTiles(arr);
//     });

//     const unsubBig = onValue(bigRef, (snap) => {
//       const val = snap.val() || {};
//       const arr = Object.entries(val).map(([id, d]) => ({ id, ...d }));
//       setBigTiles(arr);
//     });

//     const unsubTicker = onValue(tickerRef, (snap) => {
//       setTickerText(snap.val()?.text || "");
//     });

//     const unsubTimer = onValue(timerRef, (snap) => {
//       // if you sometimes store object { value: '...' } this keeps compatibility
//       const v = snap.val();
//       if (v && typeof v === "object" && "value" in v) setTimerExtra(v.value || "");
//       else setTimerExtra(snap.val() || "");
//     });

//     const unsubGlobal = onValue(globalRef, (snap) => {
//       setGlobalLogo(snap.val() || null);
//     });

//     return () => {
//       unsubSmall();
//       unsubBig();
//       unsubTicker();
//       unsubTimer();
//       unsubGlobal();
//     };
//   }, []);

//   // format helpers
//   const timeStr = now.toLocaleTimeString(); // e.g. "14:05:09"
//   const dateStr = now.toLocaleDateString(); // e.g. "11/26/2025"

//   return (
//     <div className="w-screen h-screen bg-white overflow-hidden relative p-4 flex gap-4">

//       {/* TICKER ANIMATION STYLE */}
//       <style>{`
//         @keyframes tickerScroll {
//           0% { transform: translateX(100%); }
//           100% { transform: translateX(-100%); }
//         }
//         .ticker {
//           white-space: nowrap;
//           display: inline-block;
//           animation: tickerScroll 20s linear infinite;
//         }
//       `}</style>

//       {/* FLOATING LOGO */}
//       {globalLogo ? (
//         <img
//           src={globalLogo}
//           alt="Logo"
//           className="fixed top-4 left-4 w-32 object-contain z-50"
//         />
//       ) : null}

//       {/* LEFT SMALL TILES */}
//       <div className="flex flex-col gap-4 w-48">
//         {smallTiles.map((tile) => (
//           <div key={tile.id} className="border p-2 rounded bg-gray-50 shadow-sm">
//             {tile.imageUrl && tile.imagePosition === "above" && (
//               <img src={tile.imageUrl} className="w-full max-h-32 object-contain mb-2" alt={tile.title || "tile-img"} />
//             )}
//             <h3 className="text-center font-semibold">{tile.title}</h3>
//             <p className="text-center whitespace-pre-wrap">{tile.content}</p>
//             {tile.imageUrl && tile.imagePosition === "below" && (
//               <img src={tile.imageUrl} className="w-full max-h-32 object-contain mt-2" alt={tile.title || "tile-img-btm"} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* RIGHT BIG TILES */}
//       <div className="flex-1 grid grid-cols-1 gap-4">
//         {bigTiles.map((tile) => (
//           <div key={tile.id} className="border p-4 rounded bg-gray-100 shadow">
//             {tile.imageUrl && tile.imagePosition === "above" && (
//               <img src={tile.imageUrl} className="w-full max-h-48 object-contain mb-3" alt={tile.title || "big-img"} />
//             )}
//             <h2 className="text-xl font-bold text-center">{tile.title}</h2>
//             <p className="text-center whitespace-pre-wrap">{tile.content}</p>
//             {tile.imageUrl && tile.imagePosition === "below" && (
//               <img src={tile.imageUrl} className="w-full max-h-48 object-contain mt-3" alt={tile.title || "big-img-btm"} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* FOOTER BAR */}
//       <div className="fixed bottom-0 left-0 w-full bg-gray-200 p-2 flex items-center overflow-hidden">
//         {/* TICKER (LEFT, GROWS FULL WIDTH) */}
//         <div className="flex-1 overflow-hidden">
//           <div className="ticker whitespace-nowrap text-lg font-mono">
//             {tickerText}
//           </div>
//         </div>

//         {/* TIMER (RIGHT SIDE, FIXED POSITION) */}
//         <div className="ml-6 mr-4 text-right">
//           <div className="text-2xl font-mono font-semibold">{timeStr}</div>
//           <div className="text-sm font-mono opacity-80">{dateStr}</div>
//           {timerExtra && <div className="text-sm mt-1">{timerExtra}</div>}
//         </div>
//       </div>
//     </div>
//   );
// }