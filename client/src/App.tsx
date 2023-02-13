import {FC, useState, useEffect} from 'react';
import jwt_decode from 'jwt-decode'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import NavBar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
const App:FC=()=> {
  interface user {
  name?: string;
  email?: string;
  id?: string;
  iat?: number
  }
  let [currentUser,setCurrentUser]= useState<user|null>(null)

  useEffect(()=>{
    const token:string|null = localStorage.getItem('jwt')
    
    token ? setCurrentUser(jwt_decode(token)): setCurrentUser(null)
  },[])

  // const logOut = () =>{
  //   currentUser!= null ? localStorage.removeItem('jwt') : null
  //   setCurrentUser(null)
  // }

  return (
    <BrowserRouter>
    <header>
      <NavBar
         currentUser= {currentUser}
         setCurrentUser={setCurrentUser}
      />
    </header>
    {/* <Login/> */}


      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route 
        path='/register' 
        element={
          <Register 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser}
          />
        }/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
