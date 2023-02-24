import { FC,useEffect, useState } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import axios from "axios";
import {GrUserSettings, GrClose} from 'react-icons/gr'
import {RiDeleteBin6Line} from 'react-icons/ri'
import TestAnalytics from './TestAnalytics';
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
        time: string;
    }
    interface accountInfo{
        name: string;
        wpm: number;
    }

    const [oldPassword,setOldPassword] = useState<string>('')
    const [newPassword,setNewPassword] = useState<string>('')
    const [seeSettings,setSeeSettings] = useState<Boolean>(false)
    const [userData, setUserData] = useState<Array<userData>>()
    const [userInfo,setUserInfo]=useState<accountInfo>()
    const [showAnalytics,setShowAnalytics]=useState<boolean>(false)
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
    const getTestAnalytics = async(id:string)=>{
        try{
            const token = localStorage.getItem('jwt')
            console.log(token)
            const specifcTest = await axios.get(`http://localhost:8000/tests/${id}`,{   
                headers: {
                  'Authorization': `${token}`
                }
        })
        console.log(specifcTest.data)
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
                setUserData(pingBackend.data.tests)
                const structureUserInfo={
                    name: pingBackend.data.name,
                    wpm: pingBackend.data.wpm
                }
                setUserInfo(structureUserInfo)

            }catch(err){
                console.log(err)
            }
        }
        getUserTests()
    },[])

    const edit =(
        
            <div>
                <form onSubmit={handleSubmit} className='max-w-[250px] w-full m-10 bg-zinc-800 p-8 px-8 rounded-lg'>
                    <div className="text-white font-semibold">
                    <GrClose onClick={()=>setSeeSettings(false)} />
                    </div>
                    <div className="flex flex-col text-gray-400 py-2">
                        <label htmlFor="oldPassword">Old Password: </label>
                        <input
                            id="oldPassword"
                            type='password'
                            onChange={(e)=>setOldPassword(e.target.value)}
                            value={oldPassword}
                            autoComplete='off' 
                            required
                            className="rounded-lg text-black"
                            />
                    </div>

                    <div className="flex flex-col text-gray-400 py-2">
                        <label htmlFor="newPassword">New Password: </label>
                        <input
                            id="NewPassword"
                            type='password'
                            onChange={(e)=>setNewPassword(e.target.value)}
                            value={newPassword}
                            autoComplete='off' 
                            required
                            className="rounded-lg text-black"
                            />
                    </div>
                    <button type='submit' className="w-full my-5 py-2 bg-zinc-700 text-white font-semibold rounded-lg">Submit</button>
                    <div className="flex items-center w-full my-2 py-2 bg-zinc-700 text-white font-semibold rounded-lg">
                        <span onClick={deleteAccount} className="pl-5">Delete Account </span>
                        <RiDeleteBin6Line onClick={deleteAccount} className='ml-1'/>
                    </div>
                </form>
            </div>
           
    )

    let viewData
    if(userData?.length ==0){
        viewData = (
            <>
            <p>No Test Results</p>
            </>
        )
    }else{
        viewData = userData?.map((test)=>{
            let mistakeMessage, date
            date=test.time.slice(0,10)
            // yyyy-mm-dd
            date = `${date.substring(5,7)}/${date.substring(8,10)}/${date.substring(0,4)}`
            if (test.mistakes.length > 0){
                let mistake = test.mistakes.reduce((prev,current)=>{
                    return (prev.amount > current.amount) ? prev :current
                })
                mistakeMessage= (
                <div className="text-center">
                    <p className="font-sans text-base">Most Frequent: {mistake.char}</p>
                    <p className="font-sans text-base">Amount :  {mistake.amount}</p>
                </div>
                )
            }else{
            mistakeMessage = (
                <div className="text-center">
                <p>Wow no Mistakes</p>
                </div>
                )
            } 
            return(

            <div key={`${test._id}`} className='flex place-content-around items-center my-1 bg-stone-200 rounded-lg' onClick={()=>getTestAnalytics(test._id)}>
                <div className="">
                    <p className="font-sans text-base">{test.wpm}</p>
                </div>
                    {mistakeMessage}    
                <div>
                    {date}
                </div>
            </div >
        )
    })
}

    let displayUserInfo = (
        <div className="h-20 flex  space-x-2 bg-stone-900 text-white w-full w-screen whitespace-normal place-content-around items-center">
        <p className="font-mono text-2xl font-semibold">Welcome, {userInfo?.name}</p>
        <p className="font-mono text-2xl font-semibold">WPM: {userInfo?.wpm}</p>
        </div>
    )




        let displayAnalytics 
        if(!showAnalytics){
            displayAnalytics=(
                <div className="h-4/6 w-9/12 mx-auto overflow-y-auto">
                <div className="flex place-content-around h-16 bg-neutral-700 items-center rounded-lg">
                    <p className="font-mono text-xl font-bold text-white">WPM</p>
                    <p className="font-mono text-xl font-bold text-white">Mistakes</p>
                    <p className="font-mono text-xl font-bold text-white">Date</p>
                </div>
                <div className="mt-5 flex flex-col-reverse divide-y divide-y-reverse">
                {viewData}
                </div>
            </div>   
            )   
        }else{
            displayAnalytics= (
                <TestAnalytics
                    userData={userData}
                />
            )
        }


    return(
        <div className="mx-auto">
        {displayUserInfo}
        <button onClick={()=>setShowAnalytics(!showAnalytics)}>Analytics</button>
        {seeSettings? edit:<div className="flex m-6"><GrUserSettings onClick={()=>setSeeSettings(true)} className='text-xl '/></div>}
        {displayAnalytics}
        </div>
    )
}
export default Profile