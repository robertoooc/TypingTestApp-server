import { Link } from "react-router-dom";
import { FC } from "react";
interface currentUser{
    name?: string;
    email?: string;
    id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
    setCurrentUser: (val:currentUser|null)=>void;
}
const NavBar:FC<Props>=({currentUser,setCurrentUser}) =>{
    const handleLogout=()=>{
        if (localStorage.getItem('jwt')){
            localStorage.removeItem('jwt')
            setCurrentUser(null)
        }
    }

    const loggedIn = (
        <nav>
            <Link to='/'>Home</Link>
            <Link to='/'>Profile</Link>
            {/* <div onClick={handleLogout}> */}
            <div onClick={handleLogout}>
                Logout
            </div>
        </nav>
    )

    const loggedOut = (
        <nav>
            <Link to='/'>Home</Link>
            {/* <Link to='/login'>Login</Link> */}
            <Link to='/register'>Register</Link>
            <Link to='/login'>Login</Link>
        </nav>
    )





    return(
        <>
        {currentUser ? loggedIn: loggedOut}
        </>
    )
}
export default NavBar