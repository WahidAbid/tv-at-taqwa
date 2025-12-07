import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/index.css'

import DisplayScreen from './components/DisplayScreen'
import ControllerPanel from './components/ControllerPanel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/display" replace />} />
        <Route path="/display" element={<DisplayScreen />} />
        <Route path="/control" element={<ControllerPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
