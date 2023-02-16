import { Link } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { useNavigate,NavigateFunction } from "react-router-dom";
import {FaKeyboard} from 'react-icons/fa'
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
    let navigate:NavigateFunction =useNavigate()
    const handleLogout=()=>{
        if (localStorage.getItem('jwt')){
            localStorage.removeItem('jwt')
            setCurrentUser(null)
            navigate(0)
        }
    }
        const alphabet ="abcdefghijklmnopqrstuvwxyz"
        const randomSuggestion = alphabet[Math.floor(Math.random()*26)]

    const loggedIn = (
        <div className="bg-neutral-900 w-60 p-3 flex flex-col text-white min-h-full">
            <div className="flex items-center gap-3 px-1 py-3">
            <FaKeyboard fontSize={24}/>
            <span className="text-neutral-100 text-lg">Typing Test App</span>
            </div>
            <div className="flex-1">
            <Link to={`/test/${randomSuggestion}`} className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'}>
            <span className="text-xl">Home</span>
            </Link>

            <Link to='/profile' className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'}>
            <span className="text-xl">Profile</span>
            </Link>
            </div>
            <span className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'} onClick={handleLogout}>
                <span className="text-xl">Logout</span>
            </span>
        </div>
    )

    const loggedOut = (

        <div className="bg-neutral-900 w-60 p-3 flex flex-col text-white min-h-full h-full">
            <div className="flex items-center gap-3 px-1 py-3">
            <FaKeyboard fontSize={24}/>
            <span className="text-neutral-100 text-lg">Typing Test App</span>
            </div>
            <div className="flex-1">
            <Link to={`/test/${randomSuggestion}`} className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'}>
            <span className="text-xl">Home</span>
            </Link>

            <Link to='/register' className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'}>
            <span className="text-xl">Register</span>
            </Link>
            <Link to='/login' className={'flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'}>
            <span className="text-xl">Login</span>
            </Link>
            </div>
        </div>

    )

    return(
        <>
        {currentUser ? loggedIn: loggedOut}
        </>
    )
}
export default NavBar