import React, { useEffect, useState } from 'react'


export default function TimeClock(){
const [now, setNow] = useState(new Date())
useEffect(()=>{
const t = setInterval(()=> setNow(new Date()), 1000)
return ()=> clearInterval(t)
},[])


const date = now.toLocaleDateString()
const time = now.toLocaleTimeString()


return (
<div>
<div className="text-sm">{date}</div>
<div className="text-2xl font-mono">{time}</div>
</div>
)
}