import React, { useEffect, useState } from 'react'


export default function AnnouncementsRotator({ items = [] }){
const [index, setIndex] = useState(0)
useEffect(()=>{
if(!items.length) return
const id = setInterval(()=> setIndex(i => (i+1) % items.length), 4000)
return ()=> clearInterval(id)
},[items])


const text = items[index] || ''


return (
<div className="max-w-4xl w-full text-center">
<div className="text-6xl font-extrabold leading-tight tracking-tight">{text}</div>
</div>
)
}