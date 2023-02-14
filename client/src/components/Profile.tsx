import { FC,useEffect } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import axios from "axios";
interface currentUser{
    name?: string;
    email?: string;
    _id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
 }
const Profile:FC<Props> = ({currentUser})=>{
    const navigate:NavigateFunction = useNavigate()

    useEffect(()=>{
        if(!localStorage.getItem('jwt')){
            navigate('/')
        }
        const getUserTests=async()=>{
            try{
                const token = localStorage.getItem('jwt')
                const pingBackend = await axios.get('http://localhost:8000/users',{   
                        headers: {
                          'Authorization': `${token}`
                        }
                })
                console.log(pingBackend.data)
            }catch(err){
                console.log(err)
            }
        }
        getUserTests()
    },[])

    return(
        <>
        </>
    )
}
export default Profile