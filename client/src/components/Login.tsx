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
                setMessage(err.submit.data.message)
            }
        }
    }
    useEffect(()=>{
        if(localStorage.getItem('jwt')){
            navigate('/')
        }
    },[])

    return(
        <div>
            {message}
            <form onSubmit={handleSubmit}>
                <label htmlFor='email'>Email: </label>
                <input
                    autoComplete='off'  
                    type='email'
                    id='email'
                    onChange={e=>setEmail(e.target.value)}
                    value={email}
                />
                <label htmlFor='password'>Password: </label>
                <input
                    autoComplete='off'
                    type='password'
                    id='password'
                    onChange={e=>setPassword(e.target.value)}
                    value={password}
                />
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login