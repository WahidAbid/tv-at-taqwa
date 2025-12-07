import React, { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase/firebaseConfig'
import TimeClock from '../components/TimeClock'
import Ticker from '../components/Ticker'
import AnnouncementsRotator from '../components/AnnouncementsRotator'


export default function Display(){
const [data, setData] = useState({ headline: '', announcements: [], ticker: [] })


useEffect(()=>{
const r = ref(db, '/')
return onValue(r, snap => {
const val = snap.val() || {}
setData({
headline: val.headline || '',
announcements: val.announcements || [],
ticker: val.ticker || []
})
})
},[])


return (
<div className="w-screen h-screen bg-gray-900 text-white flex flex-col tv-safe-area">
<div className="flex items-center justify-between">
<h1 className="text-4xl font-semibold">{data.headline || 'Welcome'}</h1>
<TimeClock className="text-right" />
</div>


<div className="flex-1 flex items-center justify-center">
<AnnouncementsRotator items={data.announcements} />
</div>


<div className="h-16">
<Ticker items={data.ticker} />
</div>
</div>
)
}