import { Link } from "react-router-dom";
import { FC } from "react";
const NavBar:FC = () =>{

    const loggedIn = (
        <nav>
            <Link to='/'>Home</Link>
            <Link to='/'>Profile</Link>
            {/* <div onClick={handleLogout}> */}
            <div>
                Logout
            </div>
        </nav>
    )

    const loggedOut = (
        <nav>
            <Link to='/'>Home</Link>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
        </nav>
    )





    return(
        <>
        </>
    )
}
export default NavBar