import React from 'react'


export default function Ticker({ items = [] }){
const text = items.join(' \u00A0 \u2022 \u00A0 ')


return (
<div className="w-full overflow-hidden bg-black/50 py-2">
<div className="whitespace-nowrap animate-marquee text-lg">
{text || 'No announcements'}
</div>


<style>{`
@keyframes marquee { from { transform: translateX(100%) } to { transform: translateX(-100%) } }
.animate-marquee { display:inline-block; animation: marquee 20s linear infinite; }
`}</style>
</div>
)
}