import React, { useState } from 'react'


export default function Login({ onSuccess }){
const [pw, setPw] = useState('')
const [err, setErr] = useState('')


function handle(){
// This is intentionally simple: replace with real auth if needed.
const PASSPHRASE = localStorage.getItem('DISPLAY_PW') || 'admin123'
if(pw === PASSPHRASE){
onSuccess()
} else {
setErr('Wrong password')
}
}


return (
<div className="p-4 max-w-md mx-auto">
<h2 className="text-2xl mb-4">Controller Login</h2>
<input value={pw} onChange={e=>setPw(e.target.value)} type="password" className="w-full p-2 mb-2 rounded" placeholder="Enter password" />
<button onClick={handle} className="w-full p-2 bg-blue-600 rounded text-white">Unlock</button>
{err && <div className="mt-2 text-red-400">{err}</div>}
<div className="mt-4 text-sm text-gray-400">Default password: <code>admin123</code>. To change it persist a new passphrase in <code>localStorage.setItem('DISPLAY_PW', 'yourpass')</code></div>
</div>
)
}