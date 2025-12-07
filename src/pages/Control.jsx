import React, { useEffect, useState } from 'react'
import { ref, set, push } from 'firebase/database'
import { db } from '../firebase/firebaseConfig'
import Login from '../components/Login'

export default function Control(){
    const [unlocked, setUnlocked] = useState(false)
    const [headline, setHeadline] = useState('')
    const [annText, setAnnText] = useState('')
    const [tickerText, setTickerText] = useState('')
    
    
    useEffect(()=>{
    // Optionally prefill from DB
    },[])
    
    
    async function saveHeadline(){
    await set(ref(db, 'headline'), headline)
    setHeadline('')
    }
    
    
    async function addAnnouncement(){
    const r = ref(db, 'announcements')
    // push will add to list, but for simplicity we'll read/overwrite in many cases
    await push(r, annText)
    setAnnText('')
    }
    
    
    async function addTicker(){
    const r = ref(db, 'ticker')
    await push(r, tickerText)
    setTickerText('')
    }
    
    


    return (
        <div className="min-h-screen bg-gray-50 p-6">
        {!unlocked ? (
            <Login onSuccess={()=> setUnlocked(true)} />
        ) : (
            <div className="max-w-3xl mx-auto space-y-6">
                    <section className="bg-white p-4 rounded shadow">
                        <h3 className="font-semibold">Headline</h3>
                        <div className="flex gap-2 mt-2">
                            <input value={headline} onChange={e=>setHeadline(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type headline" />
                            <button onClick={saveHeadline} className="px-4 bg-blue-600 text-white rounded">Save</button>
                        </div>
                </section>

                
                <section className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">Announcements (Rotator)</h3>
                    <div className="flex gap-2 mt-2">
                        <input value={annText} onChange={e=>setAnnText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Add announcement" />
                        <button onClick={addAnnouncement} className="px-4 bg-green-600 text-white rounded">Add</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Announcements get pushed into the list. To remove or reorder, you can later add simple UI for management.</p>
                </section>
                
                
                <section className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold">Ticker (Scrolling)</h3>
                    <div className="flex gap-2 mt-2">
                        <input value={tickerText} onChange={e=>setTickerText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ticker entry" />
                        <button onClick={addTicker} className="px-4 bg-orange-600 text-white rounded">Add</button>
                    </div>
                </section>
            </div>
            )}
        </div>
    )
}