// export function convertDriveLink(url) {
//     // Extract Google Drive file ID
//     const match = url.match(/\/d\/([^/]+)/);
  
//     // If match found create direct link
//     if (match && match[1]) {
//       return `https://drive.google.com/uc?export=view&id=${match[1]}`;
//     }
  
//     // If link already direct or not drive — use original
//     return url;
//   }
// --------------
// export function convertDriveLink(link) {
//     const match = link.match(/[-\w]{25,}/);
//     if (!match) return link;
//     const fileId = match[0];
//     return `https://drive.google.com/uc?export=view&id=${fileId}`;
//   }
// --------------
// export function convertDriveLink(link) {
//   if (!link || typeof link !== "string") return link || "";
//   // match common drive file id patterns
//   const m1 = link.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
//   if (m1 && m1[1]) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
//   const m2 = link.match(/id=([a-zA-Z0-9_-]{10,})/);
//   if (m2 && m2[1]) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
//   // fallback: try to find long-ish token
//   const m3 = link.match(/[-\w]{25,}/);
//   if (m3 && m3[0]) return `https://drive.google.com/uc?export=view&id=${m3[0]}`;
//   return link;
// }
// --------------
export function convertDriveLink(link) {
  if (!link) return "";

  // Extract the file ID safely
  const idMatch = link.match(/[-\w]{25,}/);
  if (!idMatch) return link;

  const id = idMatch[0];

  // This avoids OpaqueResponseBlocking
  return `https://drive.google.com/thumbnail?id=${id}`;
}


  