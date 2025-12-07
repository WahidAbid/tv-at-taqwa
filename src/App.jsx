import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DisplayScreen from "./components/DisplayScreen";
import ControllerPanel from "./components/ControllerPanel";
import { useEffect, useState } from "react";

export default function App() {
  return (
    <div className="w-screen h-screen bg-green-950 text-white overflow-hidden">
      <DisplayScreen />
    </div>
  );
}
