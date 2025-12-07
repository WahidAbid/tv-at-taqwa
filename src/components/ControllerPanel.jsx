import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { ref as dbRef, onValue, push, set, update, remove } from "firebase/database";
import { convertDriveLink } from "../utils/driveUrl";

export default function ControllerPanel() {
  const [smallTiles, setSmallTiles] = useState([]);
  const [bigTiles, setBigTiles] = useState([]);

  const [tickerText, setTickerText] = useState("");
  const [timerText, setTimerText] = useState("");

  const [globalLogo, setGlobalLogo] = useState("");
  const [globalLogoInput, setGlobalLogoInput] = useState("");

  useEffect(() => {
    const smallRef = dbRef(db, "smallTiles");
    const bigRef = dbRef(db, "bigTiles");
    const tickerRef = dbRef(db, "settings/ticker");
    const timerRef = dbRef(db, "settings/timer");
    const globalRef = dbRef(db, "settings/global/logoUrl");

    onValue(smallRef, snap => {
      const v = snap.val() || {};
      setSmallTiles(Object.entries(v).map(([id, d]) => ({ id, ...d })));
    });

    onValue(bigRef, snap => {
      const v = snap.val() || {};
      setBigTiles(Object.entries(v).map(([id, d]) => ({ id, ...d })));
    });

    onValue(tickerRef, snap => setTickerText(snap.val()?.text || ""));
    onValue(timerRef, snap => setTimerText(snap.val()?.value || ""));
    onValue(globalRef, snap => setGlobalLogo(snap.val() || ""));
  }, []);

  const saveGlobalLogo = async () => {
    let url = globalLogoInput.trim();
    if (url.includes("drive.google.com")) url = convertDriveLink(url);

    await set(dbRef(db, "settings/global/logoUrl"), url);
    setGlobalLogo(url);
    alert("Logo saved!");
  };

  const addSmallTile = async () => {
    const r = await push(dbRef(db, "smallTiles"));
    await set(r, {
      title: "",
      content: "",
      imageUrl: "",
      imagePosition: "none"
    });
  };

  // FIXED — clean, correct structure for multi-media big tile
  const addBigTile = async () => {
    const r = await push(dbRef(db, "bigTiles"));
    await set(r, {
      title: "",
      content: "",
      media: [],           // slideshow media list
      imagePosition: "none"
    });
  };

  const deleteSmallTile = id => remove(dbRef(db, `smallTiles/${id}`));
  const deleteBigTile = id => remove(dbRef(db, `bigTiles/${id}`));

  const updateSmallField = (id, field, value) =>
    update(dbRef(db, `smallTiles/${id}`), { [field]: value });

  const updateBigField = (id, field, value) =>
    update(dbRef(db, `bigTiles/${id}`), { [field]: value });

  // FIXED — supports clearing inputs & properly maps multiple links
  const saveMediaLinks = async (id, raw) => {
    const lines = raw
      .split("\n")
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .map(convertDriveLink);

    await update(dbRef(db, `bigTiles/${id}`), { media: lines });
    alert("Media list saved!");
  };

  const saveImageLink = async (id, type, url) => {
    const fixed = convertDriveLink(url.trim());
    if (type === "small") updateSmallField(id, "imageUrl", fixed);
    else updateBigField(id, "imageUrl", fixed);
    alert("Image URL saved!");
  };

  const saveTicker = () =>
    set(dbRef(db, "settings/ticker"), { text: tickerText });

  const saveTimer = () =>
    set(dbRef(db, "settings/timer"), { value: timerText });

  return (
    <div className="p-6 space-y-8">

      {/* Global Logo */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Global Logo</h1>
        {globalLogo && <img src={globalLogo} className="w-32 mb-2" />}
        <input
          placeholder="Paste Google Drive link…"
          className="border p-2 w-full mb-2"
          value={globalLogoInput}
          onChange={e => setGlobalLogoInput(e.target.value)}
        />
        <button onClick={saveGlobalLogo} className="px-3 py-1 bg-blue-600 text-white rounded">
          Save Logo
        </button>
      </div>

      {/* Small Tiles */}
      <div>
        <div className="flex justify-between mb-3">
          <h2 className="text-xl font-semibold">Small Tiles</h2>
          <button onClick={addSmallTile} className="px-3 py-1 bg-green-600 text-white rounded">
            Add Small
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smallTiles.map(t => (
            <div key={t.id} className="border p-3 rounded bg-white">
              <input
                className="border p-2 w-full mb-2"
                placeholder="Title"
                value={t.title}
                onChange={e => updateSmallField(t.id, "title", e.target.value)}
              />
              <textarea
                className="border p-2 w-full mb-2"
                rows={3}
                value={t.content}
                onChange={e => updateSmallField(t.id, "content", e.target.value)}
              />

              <input
                placeholder="Single image link (optional)"
                className="border p-2 w-full mb-2"
                onBlur={e => saveImageLink(t.id, "small", e.target.value)}
              />

              <select
                className="border p-2 w-full mb-2"
                value={t.imagePosition}
                onChange={e => updateSmallField(t.id, "imagePosition", e.target.value)}
              >
                <option value="none">No Image</option>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>

              <button className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => deleteSmallTile(t.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Big Tiles */}
      <div>
        <div className="flex justify-between mb-3">
          <h2 className="text-xl font-semibold">Big Tiles</h2>
          <button onClick={addBigTile} className="px-3 py-1 bg-green-600 text-white rounded">
            Add Big
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bigTiles.map(t => (
            <div key={t.id} className="border p-3 rounded bg-white">

              <input
                className="border p-2 w-full mb-2"
                placeholder="Title"
                value={t.title}
                onChange={e => updateBigField(t.id, "title", e.target.value)}
              />

              <textarea
                className="border p-2 w-full mb-2"
                rows={4}
                value={t.content}
                onChange={e => updateBigField(t.id, "content", e.target.value)}
              />

              {/* Old single image fallback */}
              <input
                placeholder="Single image link (optional)"
                className="border p-2 w-full mb-2"
                onBlur={e => saveImageLink(t.id, "big", e.target.value)}
              />

              {/* MULTI MEDIA TEXTAREA — now loads existing media */}
              <textarea
                placeholder="Multiple media links (one per line)"
                className="border p-2 w-full mb-2 h-28"
                defaultValue={(t.media || []).join("\n")}
                onBlur={e => saveMediaLinks(t.id, e.target.value)}
              />

              <select
                className="border p-2 w-full mb-2"
                value={t.imagePosition}
                onChange={e => updateBigField(t.id, "imagePosition", e.target.value)}
              >
                <option value="none">No Image/Media</option>
                <option value="above">Media Above</option>
                <option value="below">Media Below</option>
              </select>

              <button className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => deleteBigTile(t.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker + Timer */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Ticker</h2>
        <textarea
          className="border p-2 w-full mb-2"
          value={tickerText}
          onChange={e => setTickerText(e.target.value)}
        />
        <button onClick={saveTicker} className="px-3 py-1 bg-blue-600 text-white rounded mb-6">
          Save Ticker
        </button>

        <h2 className="text-xl font-semibold mb-2">Timer Extra Text</h2>
        <input
          className="border p-2 w-full mb-2"
          value={timerText}
          onChange={e => setTimerText(e.target.value)}
        />
        <button onClick={saveTimer} className="px-3 py-1 bg-blue-600 text-white rounded">
          Save Timer
        </button>
      </div>

    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { ref as dbRef, onValue, push, set, update, remove } from "firebase/database";
// import { convertDriveLink } from "../utils/driveUrl";

// export default function ControllerPanel() {
//   const [smallTiles, setSmallTiles] = useState([]);
//   const [bigTiles, setBigTiles] = useState([]);

//   const [tickerText, setTickerText] = useState("");
//   const [timerText, setTimerText] = useState("");

//   // global logo state:
//   const [globalLogo, setGlobalLogo] = useState("");        // current saved url
//   const [globalLogoInput, setGlobalLogoInput] = useState(""); // editable input

//   // --- Load data (realtime listeners) ---
//   useEffect(() => {
//     const smallRef = dbRef(db, "smallTiles");
//     const bigRef = dbRef(db, "bigTiles");
//     const tickerRef = dbRef(db, "settings/ticker");
//     const timerRef = dbRef(db, "settings/timer");
//     const globalRef = dbRef(db, "settings/global/logoUrl");

//     const unsubSmall = onValue(smallRef, (snap) => {
//       const v = snap.val() || {};
//       setSmallTiles(Object.entries(v).map(([id, data]) => ({ id, ...data })));
//     });

//     const unsubBig = onValue(bigRef, (snap) => {
//       const v = snap.val() || {};
//       setBigTiles(Object.entries(v).map(([id, data]) => ({ id, ...data })));
//     });

//     const unsubTicker = onValue(tickerRef, (snap) => {
//       setTickerText(snap.val()?.text || "");
//     });

//     const unsubTimer = onValue(timerRef, (snap) => {
//       setTimerText(snap.val()?.value || "");
//     });

//     const unsubGlobal = onValue(globalRef, (snap) => {
//       const url = snap.val() || "";
//       setGlobalLogo(url);
//       setGlobalLogoInput(url); // keep input synced with DB value
//     });

//     // cleanup function not strictly necessary for onValue (it returns unsubscribe),
//     // but we return functions to be consistent.
//     return () => {
//       unsubSmall();
//       unsubBig();
//       unsubTicker();
//       unsubTimer();
//       unsubGlobal();
//     };
//   }, []);

//   // --- GLOBAL LOGO SAVE ---
//   const saveGlobalLogo = async () => {
//     try {
//       const raw = (globalLogoInput || "").trim();
//       if (!raw) {
//         alert("Please paste a Google Drive link or a direct image URL.");
//         return;
//       }

//       const converted = raw.includes("drive.google.com") ? convertDriveLink(raw) : raw;

//       await set(dbRef(db, "settings/global/logoUrl"), converted);

//       // update local states so display updates immediately
//       setGlobalLogo(converted);
//       setGlobalLogoInput(converted);

//       alert("Global logo saved!");
//     } catch (err) {
//       console.error("saveGlobalLogo error:", err);
//       alert("Failed to save global logo. See console for details.");
//     }
//   };

//   // --- TILE CRUD ---
//   const addSmallTile = async () => {
//     try {
//       const r = await push(dbRef(db, "smallTiles"));
//       await set(r, { title: "", content: "", imageUrl: "", imagePosition: "none" });
//     } catch (err) {
//       console.error("addSmallTile error:", err);
//       alert("Failed to add small tile.");
//     }
//   };

//   const addBigTile = async () => {
//     try {
//       const r = await push(dbRef(db, "bigTiles"));
//       await set(r, { title: "", content: "", imageUrl: "", imagePosition: "none" });
//     } catch (err) {
//       console.error("addBigTile error:", err);
//       alert("Failed to add big tile.");
//     }
//   };

//   const deleteSmallTile = (id) => remove(dbRef(db, `smallTiles/${id}`));
//   const deleteBigTile = (id) => remove(dbRef(db, `bigTiles/${id}`));

//   // --- Field update helpers ---
//   const updateSmallField = (id, field, value) =>
//     update(dbRef(db, `smallTiles/${id}`), { [field]: value });

//   const updateBigField = (id, field, value) =>
//     update(dbRef(db, `bigTiles/${id}`), { [field]: value });

//   // --- SAVE IMAGE LINK instead of FILE ---
//   const saveImageLink = async (id, type, inputValue) => {
//     try {
//       const raw = (inputValue || "").trim();
//       if (!raw) {
//         alert("Paste a Drive link or a direct URL then leave the field (onBlur) or Save.");
//         return;
//       }
//       const url = raw.includes("drive.google.com") ? convertDriveLink(raw) : raw;
//       if (type === "small") await updateSmallField(id, "imageUrl", url);
//       else await updateBigField(id, "imageUrl", url);
//       alert("Image URL saved!");
//     } catch (err) {
//       console.error("saveImageLink error:", err);
//       alert("Failed to save image URL.");
//     }
//   };

//   // --- ticker & timer save ---
//   const saveTicker = async () => {
//     try {
//       await set(dbRef(db, "settings/ticker"), { text: tickerText });
//       alert("Ticker saved.");
//     } catch (err) {
//       console.error("saveTicker error:", err);
//       alert("Failed to save ticker.");
//     }
//   };

//   const saveTimer = async () => {
//     try {
//       await set(dbRef(db, "settings/timer"), { value: timerText });
//       alert("Timer saved.");
//     } catch (err) {
//       console.error("saveTimer error:", err);
//       alert("Failed to save timer.");
//     }
//   };

//   return (
//     <div className="p-6 space-y-8">
//       {/* GLOBAL LOGO */}
//       <div>
//         <h1 className="text-2xl font-bold mb-2">Global Logo</h1>

//         {globalLogo ? (
//           <img src={globalLogo} className="w-32 mb-2 object-contain" alt="Global Logo" />
//         ) : (
//           <div className="mb-2 text-sm text-gray-500">No global logo set</div>
//         )}

//         <input
//           type="text"
//           placeholder="Paste Google Drive image link or direct image URL..."
//           className="border p-2 w-full mb-2"
//           value={globalLogoInput}
//           onChange={(e) => setGlobalLogoInput(e.target.value)}
//         />
//         <div className="flex gap-2">
//           <button onClick={saveGlobalLogo} className="px-3 py-1 bg-blue-600 text-white rounded">
//             Save Logo
//           </button>
//         </div>
//       </div>

//       {/* SMALL TILES */}
//       <div>
//         <div className="flex justify-between mb-3">
//           <h2 className="text-xl font-semibold">Small Tiles</h2>
//           <div className="flex gap-2">
//             <button onClick={addSmallTile} className="px-3 py-1 bg-green-600 text-white rounded">
//               Add Small
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {smallTiles.map((t) => (
//             <div key={t.id} className="border p-3 rounded bg-white">
//               <input
//                 className="border p-2 w-full mb-2"
//                 placeholder="Title"
//                 value={t.title}
//                 onChange={(e) => updateSmallField(t.id, "title", e.target.value)}
//               />
//               <textarea
//                 className="border p-2 w-full mb-2"
//                 rows={3}
//                 value={t.content}
//                 onChange={(e) => updateSmallField(t.id, "content", e.target.value)}
//               />

//               <input
//                 placeholder="Paste Google Drive image link or direct URL and leave field"
//                 className="border p-2 w-full mb-2"
//                 defaultValue={t.imageUrl || ""}
//                 onBlur={(e) => saveImageLink(t.id, "small", e.target.value)}
//               />

//               <select
//                 className="border p-2 w-full mb-2"
//                 value={t.imagePosition || "none"}
//                 onChange={(e) => updateSmallField(t.id, "imagePosition", e.target.value)}
//               >
//                 <option value="none">No Image</option>
//                 <option value="above">Above</option>
//                 <option value="below">Below</option>
//               </select>

//               <div className="flex gap-2">
//                 <button onClick={() => deleteSmallTile(t.id)} className="px-3 py-1 bg-red-600 text-white rounded">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BIG TILES */}
//       <div>
//         <div className="flex justify-between mb-3">
//           <h2 className="text-xl font-semibold">Big Tiles</h2>
//           <div className="flex gap-2">
//             <button onClick={addBigTile} className="px-3 py-1 bg-green-600 text-white rounded">
//               Add Big
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {bigTiles.map((t) => (
//             <div key={t.id} className="border p-3 rounded bg-white">
//               <input
//                 className="border p-2 w-full mb-2"
//                 placeholder="Title"
//                 value={t.title}
//                 onChange={(e) => updateBigField(t.id, "title", e.target.value)}
//               />
//               <textarea
//                 className="border p-2 w-full mb-2"
//                 rows={4}
//                 value={t.content}
//                 onChange={(e) => updateBigField(t.id, "content", e.target.value)}
//               />

//               <input
//                 placeholder="Paste Google Drive image link or direct URL and leave field"
//                 className="border p-2 w-full mb-2"
//                 defaultValue={t.imageUrl || ""}
//                 onBlur={(e) => saveImageLink(t.id, "big", e.target.value)}
//               />

//               <select
//                 className="border p-2 w-full mb-2"
//                 value={t.imagePosition || "none"}
//                 onChange={(e) => updateBigField(t.id, "imagePosition", e.target.value)}
//               >
//                 <option value="none">No Image</option>
//                 <option value="above">Above</option>
//                 <option value="below">Below</option>
//               </select>

//               <div className="flex gap-2">
//                 <button onClick={() => deleteBigTile(t.id)} className="px-3 py-1 bg-red-600 text-white rounded">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* TICKER + TIMER */}
//       <div>
//         <h2 className="text-xl font-semibold mb-2">Ticker</h2>
//         <textarea
//           value={tickerText}
//           onChange={(e) => setTickerText(e.target.value)}
//           className="border p-2 w-full mb-2"
//           rows={2}
//         />
//         <button onClick={saveTicker} className="px-3 py-1 bg-blue-600 text-white rounded mb-6">
//           Save Ticker
//         </button>

//         <h2 className="text-xl font-semibold mb-2">Timer Extra Text</h2>
//         <input
//           className="border p-2 w-full mb-2"
//           value={timerText}
//           onChange={(e) => setTimerText(e.target.value)}
//         />
//         <button onClick={saveTimer} className="px-3 py-1 bg-blue-600 text-white rounded">
//           Save Timer
//         </button>
//       </div>
//     </div>
//   );
// }

// --------------------------------------------------------------------------------------------------------

// import React, { useEffect, useState } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { ref as dbRef, onValue, push, set, update, remove } from "firebase/database";
// import { convertDriveLink } from "../utils/driveUrl";

// export default function ControllerPanel() {
//   const [smallTiles, setSmallTiles] = useState([]);
//   const [bigTiles, setBigTiles] = useState([]);

//   const [tickerText, setTickerText] = useState("");
//   const [timerText, setTimerText] = useState("");

//   const [globalLogo, setGlobalLogo] = useState("");
//   const [globalLogoInput, setGlobalLogoInput] = useState("");
  
//   const handleLogoLinkChange = (e) => {
//     const formatted = convertDriveLink(e.target.value);
//     db.ref("display/logo").set(formatted);
//   };

//   // --- Load data ---
//   useEffect(() => {
//     const smallRef = dbRef(db, "smallTiles");
//     const bigRef = dbRef(db, "bigTiles");
//     const tickerRef = dbRef(db, "settings/ticker");
//     const timerRef = dbRef(db, "settings/timer");
//     const globalRef = dbRef(db, "settings/global/logoUrl");

//     onValue(smallRef, (snap) => {
//       const v = snap.val() || {};
//       setSmallTiles(Object.entries(v).map(([id, data]) => ({ id, ...data })));
//     });

//     onValue(bigRef, (snap) => {
//       const v = snap.val() || {};
//       setBigTiles(Object.entries(v).map(([id, data]) => ({ id, ...data })));
//     });

//     onValue(tickerRef, (snap) => setTickerText(snap.val()?.text || ""));
//     onValue(timerRef, (snap) => setTimerText(snap.val()?.value || ""));
//     onValue(globalRef, (snap) => {
//       const url = snap.val() || "";
//       setGlobalLogo(url);
//       setGlobalLogoInput(url);
//     });    
//   }, []);

//   // --- GLOBAL LOGO SAVE ---
//   const saveGlobalLogo = async () => {
//     try {
//       const trimmed = globalLogoInput.trim();
//       const converted = trimmed.includes("drive.google.com")
//         ? convertDriveLink(trimmed)
//         : trimmed;
  
//       await set(dbRef(db, "settings/global/logoUrl"), converted);
  
//       // Update UI state
//       setGlobalLogo(converted);
//       setGlobalLogoInput(converted);
  
//       alert("Global logo saved!");
//     } catch (err) {
//       console.error("saveGlobalLogo error:", err);
//       alert("Failed to save global logo.");
//     }
//   };
  
  

//   // --- TILE CRUD ---
//   const addSmallTile = async () => {
//     const r = await push(dbRef(db, "smallTiles"));
//     await set(r, { title: "", content: "", imageUrl: "", imagePosition: "none" });
//   };

//   const addBigTile = async () => {
//     const r = await push(dbRef(db, "bigTiles"));
//     await set(r, { title: "", content: "", imageUrl: "", imagePosition: "none" });
//   };

//   const deleteSmallTile = (id) => remove(dbRef(db, `smallTiles/${id}`));
//   const deleteBigTile = (id) => remove(dbRef(db, `bigTiles/${id}`));

//   // --- Field update helpers ---
//   const updateSmallField = (id, field, value) =>
//     update(dbRef(db, `smallTiles/${id}`), { [field]: value });

//   const updateBigField = (id, field, value) =>
//     update(dbRef(db, `bigTiles/${id}`), { [field]: value });

//   // --- SAVE IMAGE LINK instead of FILE ---
//   const saveImageLink = async (id, type, inputValue) => {
//     const url = convertDriveLink(inputValue.trim());
//     if (type === "small") updateSmallField(id, "imageUrl", url);
//     else updateBigField(id, "imageUrl", url);
//     alert("Image URL saved!");
//   };

//   // --- ticker & timer ---
//   const saveTicker = () => set(dbRef(db, "settings/ticker"), { text: tickerText });
//   const saveTimer = () => set(dbRef(db, "settings/timer"), { value: timerText });

//   return (
//     <div className="p-6 space-y-8">

//       {/* GLOBAL LOGO */}
//       <div>
//         <h1 className="text-2xl font-bold mb-2">Global Logo</h1>
//         {globalLogo && <img src={globalLogo} className="w-32 mb-2" alt="Logo" />}
//         <input
//           placeholder="Paste Google Drive image link..."
//           className="border p-2 w-full mb-2"
//           value={globalLogoInput}
//           onChange={(e) => setGlobalLogoInput(e.target.value)}
//         />
//         <button onClick={saveGlobalLogo} className="px-3 py-1 bg-blue-600 text-white rounded">
//           Save Logo
//         </button>
//       </div>

//       {/* SMALL TILES */}
//       <div>
//         <div className="flex justify-between mb-3">
//           <h2 className="text-xl font-semibold">Small Tiles</h2>
//           <button onClick={addSmallTile} className="px-3 py-1 bg-green-600 text-white rounded">
//             Add Small
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {smallTiles.map((t) => (
//             <div key={t.id} className="border p-3 rounded bg-white">
//               <input
//                 className="border p-2 w-full mb-2"
//                 placeholder="Title"
//                 value={t.title}
//                 onChange={(e) => updateSmallField(t.id, "title", e.target.value)}
//               />
//               <textarea
//                 className="border p-2 w-full mb-2"
//                 rows={3}
//                 value={t.content}
//                 onChange={(e) => updateSmallField(t.id, "content", e.target.value)}
//               />

//               {/*New Image URL*/}
//               <input
//                 placeholder="Paste Google Drive image link"
//                 className="border p-2 w-full mb-2"
//                 onBlur={(e) => saveImageLink(t.id, "small", e.target.value)}
//               />

//               <select
//                 className="border p-2 w-full mb-2"
//                 value={t.imagePosition}
//                 onChange={(e) => updateSmallField(t.id, "imagePosition", e.target.value)}
//               >
//                 <option value="none">No Image</option>
//                 <option value="above">Above</option>
//                 <option value="below">Below</option>
//               </select>

//               <button
//                 className="px-3 py-1 bg-red-600 text-white rounded"
//                 onClick={() => deleteSmallTile(t.id)}
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BIG TILES */}
//       <div>
//         <div className="flex justify-between mb-3">
//           <h2 className="text-xl font-semibold">Big Tiles</h2>
//           <button onClick={addBigTile} className="px-3 py-1 bg-green-600 text-white rounded">
//             Add Big
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {bigTiles.map((t) => (
//             <div key={t.id} className="border p-3 rounded bg-white">
//               <input
//                 className="border p-2 w-full mb-2"
//                 placeholder="Title"
//                 value={t.title}
//                 onChange={(e) => updateBigField(t.id, "title", e.target.value)}
//               />
//               <textarea
//                 className="border p-2 w-full mb-2"
//                 rows={4}
//                 value={t.content}
//                 onChange={(e) => updateBigField(t.id, "content", e.target.value)}
//               />

//               <input
//                 placeholder="Paste Google Drive image link"
//                 className="border p-2 w-full mb-2"
//                 onBlur={(e) => saveImageLink(t.id, "big", e.target.value)}
//               />

//               <select
//                 className="border p-2 w-full mb-2"
//                 value={t.imagePosition}
//                 onChange={(e) => updateBigField(t.id, "imagePosition", e.target.value)}
//               >
//                 <option value="none">No Image</option>
//                 <option value="above">Above</option>
//                 <option value="below">Below</option>
//               </select>

//               <button
//                 className="px-3 py-1 bg-red-600 text-white rounded"
//                 onClick={() => deleteBigTile(t.id)}
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* TICKER + TIMER */}
//       <div>
//         <h2 className="text-xl font-semibold mb-2">Ticker</h2>
//         <textarea
//           value={tickerText}
//           onChange={(e) => setTickerText(e.target.value)}
//           className="border p-2 w-full mb-2"
//         />
//         <button onClick={saveTicker} className="px-3 py-1 bg-blue-600 text-white rounded mb-6">
//           Save Ticker
//         </button>

//         <h2 className="text-xl font-semibold mb-2">Timer Extra Text</h2>
//         <input
//           className="border p-2 w-full mb-2"
//           value={timerText}
//           onChange={(e) => setTimerText(e.target.value)}
//         />
//         <button onClick={saveTimer} className="px-3 py-1 bg-blue-600 text-white rounded">
//           Save Timer
//         </button>
//       </div>
//     </div>
//   );
// }