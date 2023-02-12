import {FC, useState, useEffect} from 'react';
import jwt_decode from 'jwt-decode'
import {Router,Routes,Route} from 'react-router-dom'
const App:FC=()=> {
  const [currentUser,setCurrentUser]= useState<string|null>(null)

  useEffect(()=>{
    const token:string|null = localStorage.getItem('jwt')
    token ? setCurrentUser(jwt_decode(token)): setCurrentUser(null)
  },[])

  const logOut = () =>{
    setCurrentUser!= null ? localStorage.removeItem('jwt') : null
    setCurrentUser(null)
  }

  return (
    <div>

    </div>
  );
}

export default App;
