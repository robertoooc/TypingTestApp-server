import {FC, useState, useEffect} from 'react';
import jwt_decode from 'jwt-decode'
import {Router,Routes,Route, useNavigate, NavigateFunction} from 'react-router-dom'
import axios, {AxiosResponse} from 'axios'

 const Login:FC=()=>{
    const [email,setEmail] = useState<string>(' ')
    const [password,setPassword] = useState<string>(' ')
    const [message,setMessage]= useState<string>(' ')
    let navigate:NavigateFunction = useNavigate()

    const handleSubmit = async (e:Event)=>{
        e.preventDefault()
        try{

            const reqBody:{email: string, password: string} = {
                email, 
                password
            }
            const submit: AxiosResponse<string, object>
            = await axios.post('http:localhost:8000/users/login', reqBody)
            
            localStorage.setItem('jwt', submit.data)
            const decoded = jwt_decode(submit.data)
            // setCurrentUser(decoded)
        }catch(err:any){
            console.log(err)
            if(err.response){
                setMessage(err.submit.data.message)
            }
        }
    }
    // currentUser? navigate('/'): null
    return(
        <div>
            <form onSubmit={e=>handleSubmit}>
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