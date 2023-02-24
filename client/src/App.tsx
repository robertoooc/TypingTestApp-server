import {FC, useState, useEffect} from 'react';
import jwt_decode from 'jwt-decode'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import NavBar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import TestAnalytics from './components/TestAnalytics';
const App:FC=()=> {
  interface user {
  name?: string;
  email?: string;
  _id?: string;
  iat?: number
  }
  let [currentUser,setCurrentUser]= useState<user|null>(null)
  const [token, setToken] = useState<string|null>(null)
  useEffect(()=>{
    const token:string|null = localStorage.getItem('jwt')
    setToken(token)
    token ? setCurrentUser(jwt_decode(token)): setCurrentUser(null)
  },[])


  return (
    <div className='flex flex-row bg-neutral-100 h-screen w-screen h-full w-full overflow-hidden'>
    <BrowserRouter >

      <NavBar
         currentUser= {currentUser}
         setCurrentUser={setCurrentUser}
         />



      <Routes>
        <Route path='/test/:id' element={<Home 
        currentUser={currentUser}
        token = {token}
        />}/>
        <Route 
        path='/register' 
        element={
          <Register 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser}
          />
        }/>
        <Route
          path='/login'
          element={
            <Login
            currentUser= {currentUser}
            setCurrentUser={setCurrentUser}
            />
          }
          />
        <Route
          path='/profile'
          element={
            <Profile
              currentUser={currentUser}
              />
            }
            />
        {/* <Route
          path='/test-analytics'
          element={
            <TestAnalytics
              currentUser={currentUser}
            />
          }
        /> */}

      </Routes>
    </BrowserRouter>
            </div>
  );
}

export default App;
