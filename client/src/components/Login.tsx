import {FC, useState, useEffect} from 'react';
import jwt_decode from 'jwt-decode'
import {Router,Routes,Route, useNavigate, NavigateFunction} from 'react-router-dom'
import axios, {AxiosResponse} from 'axios'
interface currentUser{
    name?: string;
    email?: string;
    _id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
    setCurrentUser: (val:currentUser)=>void;
 }
 const Login:FC<Props>=({currentUser,setCurrentUser})=>{
    const [email,setEmail] = useState<string>('')
    const [password,setPassword] = useState<string>('')
    const [message,setMessage]= useState<string>('')
    let navigate:NavigateFunction = useNavigate()

    const handleSubmit = async (e:any)=>{

        e.preventDefault()
        try{

            const reqBody:{email: string, password: string} = {
                email, 
                password
            }
            const submit
            = await axios.post('http://localhost:8000/users/login', reqBody)      
            const {token} = submit.data
            localStorage.setItem('jwt',token)
            const decoded = jwt_decode<currentUser>(token)
            setCurrentUser(decoded)
            navigate('/')
        }catch(err:any){
            console.log(err)
            if(err.response){
                setMessage(err.response.data.message)
            }
        }
    }
    useEffect(()=>{
        if(localStorage.getItem('jwt')){
            navigate('/profile')
        }
    },[])

    return(
        <div className=" m-auto">
            <form onSubmit={handleSubmit} className='max-w-[400px] w-full mx-auto bg-zinc-800 p-8 px-8 rounded-lg'>
                <div className="flex flex-col text-gray-400 py-2">
                    <label htmlFor='email'>Email: </label>
                    <input
                        autoComplete='off'  
                        type='email'
                        id='email'
                        onChange={e=>setEmail(e.target.value)}
                        required
                        value={email}
                        className="rounded-lg text-black"
                        />
                </div>
                <div className="flex flex-col text-gray-400 py-2">
                    <label htmlFor='password'>Password: </label>
                    <input
                        autoComplete='off'
                        type='password'
                        id='password'
                        onChange={e=>setPassword(e.target.value)}
                        value={password}
                        required
                        className="rounded-lg text-black"
                        />
                </div>
                <button type='submit' className="w-full my-5 py-2 bg-zinc-700 text-white font-semibold rounded-lg">Login</button>
            </form>
                        {message}
        </div>
    )
}

export default Login