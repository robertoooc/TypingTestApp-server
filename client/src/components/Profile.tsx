import { FC,useEffect, useState } from "react";
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
    interface mistakes{
        char: string;
        amount: number;
        _id: string
    }
    interface userData{
        wpm: number;
        mistakes: [mistakes];
        _id: string;
    }

    const [oldPassword,setOldPassword] = useState<string>('')
    const [newPassword,setNewPassword] = useState<string>('')
    const [seeSettings,setSeeSettings] = useState<Boolean>(false)
    const [userData, setUserData] = useState<Array<userData>>()
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
                console.log(pingBackend.data.tests)
                setUserData(pingBackend.data.tests)
                // const userInfo = pingBackend.data.tests.map((test:any)=>{
                    
                // })
            }catch(err){
                console.log(err)
            }
        }
        getUserTests()
    },[])

    const edit =(
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
            <button onClick={()=>setSeeSettings(false)} >Close</button>
            </>
    )


    console.log(userData)
    const viewData = userData?.map((test)=>{
        let mistakeMessage
        if (test.mistakes.length > 0){
            let mistake = test.mistakes.reduce((prev,current)=>{
                return (prev.amount > current.amount) ? prev :current
            })
            mistakeMessage= (
                <>
                <p>most common Mistake : {mistake.char}</p>
                <p>Mistake Amount :  {mistake.amount}</p>
                </>
                )
        }else{
            mistakeMessage = (
                <>
                <p>Wow no Mistakes</p>
                </>
                )
        }
        return(
            <div key={`${test._id}`} style={{border:'1px solid black',marginTop:'3px', padding: '10px'}}>
            <p>WPM: {test.wpm}</p>
            {mistakeMessage}
            </div >
        )
    })
    return(
        <>
        {seeSettings? edit:<button onClick={()=>setSeeSettings(true)}>Settings</button>}
        {viewData}
        </>
    )
}
export default Profile