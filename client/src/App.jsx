import React from 'react'
import Navbar from './components/Navbar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'

const App = () => {
  return (
    <>
      <div className='overflow-hidden'>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" index element={<Login />} />
            <Route path="/home" index element={<Home />} />
          </Routes>
        </BrowserRouter>
      </div>

    </>
  )
}

export default App
