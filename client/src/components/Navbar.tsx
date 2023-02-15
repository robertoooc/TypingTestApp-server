import { Link } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { appendFile } from "fs";
interface currentUser{
    name?: string;
    email?: string;
    _id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
    setCurrentUser: (val:currentUser|null)=>void;
}
const NavBar:FC<Props>=({currentUser,setCurrentUser}) =>{
    // const [letter,setLetter] = useState('a')
    const handleLogout=()=>{
        if (localStorage.getItem('jwt')){
            localStorage.removeItem('jwt')
            setCurrentUser(null)
        }
    }
    // useEffect(()=>{
        const alphabet ="abcdefghijklmnopqrstuvwxyz"
        const randomSuggestion = alphabet[Math.floor(Math.random()*26)]
        // console.log(randomSuggestion)
    // },[])
    const loggedIn = (
        <nav>
            <Link to={`/test/${randomSuggestion}`}>Home</Link><br></br>
            <Link to='/profile'>Profile</Link><br></br>
            {/* <div onClick={handleLogout}> */}
            <div onClick={handleLogout}>
                Logout
            </div>
        </nav>
    )

    const loggedOut = (
        <nav>
            <Link to={`/test/${randomSuggestion}`}>Home</Link><br></br>
            {/* <Link to='/login'>Login</Link> */}
            <Link to='/register'>Register</Link><br></br>
            <Link to='/login'>Login</Link><br></br>
        </nav>
    )





    return(
        <>
        {currentUser ? loggedIn: loggedOut}
        </>
    )
}
export default NavBar