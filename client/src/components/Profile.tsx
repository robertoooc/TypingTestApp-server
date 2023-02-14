import { FC,useEffect, useState } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import axios from "axios";
import { off } from "process";
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
    const [oldPassword,setOldPassword] = useState<string>('')
    const [newPassword,setNewPassword] = useState<string>('')
    const navigate:NavigateFunction = useNavigate()

    const deleteAccount = async()=>{
        try{
            const token = localStorage.getItem('jwt')
            const changePassword = await axios.delete('http://localhost:8000/users',{   
                headers: {
                  'Authorization': `${token}`
                }
        })
        if(changePassword.data.message == 'user deleted'){
            localStorage.removeItem('jwt')
            navigate('/')
        }
        }catch(err){
            console.log(err)
        }
    }

    const handleSubmit=async()=>{
        try{
            const token = localStorage.getItem('jwt')
            const changePassword = await axios.put('http://localhost:8000/users',{
                oldPassword:oldPassword,
                newPassword:newPassword
            },{   
                headers: {
                  'Authorization': `${token}`
                }
        })
        console.log(changePassword.data)
        }catch(err){
            console.log(err)
        }
    }

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
        <form onSubmit={handleSubmit}>
        <label htmlFor="oldPassword">Old Password: </label>
        <input
            id="oldPassword"
            type='password'
            onChange={(e)=>setOldPassword(e.target.value)}
            value={oldPassword}
            autoComplete='off' 
            required
            />
        <label htmlFor="newPassword">New Password: </label>
        <input
            id="NewPassword"
            type='password'
            onChange={(e)=>setNewPassword(e.target.value)}
            value={newPassword}
            autoComplete='off' 
            required
            />
            <button type="submit">Submit</button>
            </form>
            <button onClick={deleteAccount}>Delete Account</button>
        </>
    )
}
export default Profile