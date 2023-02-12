import { useState,FC } from "react";
import axios from "axios";
import jwt_decode from 'jwt-decode'
import { useNavigate, NavigateFunction } from "react-router-dom";
const Register:FC = ()=>{
	const [name, setName] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [message, setMessage] = useState<string>('')
    const navigate: NavigateFunction = useNavigate()

    const handleSubmit = async(e:Event)=>{
        e.preventDefault()
        try{
            const reqBody = {
                name, 
                email,
                password
            }
            const submit = await axios.post('http:localhost:8000/users/register', reqBody)

            const {token} = submit.data
            localStorage.setItem('jwt',token)
            const decoded = jwt_decode(token)
            // setCurrentUser(decoded)
        }catch(err:any){
            console.log(err)
            if (err.response) setMessage(err.response.data.message)
        }
    }
    // currentUser ? navigate('/') : null
    return(
        <div>
            <form onSubmit={e=>handleSubmit}>
                <label htmlFor="name">Name: </label>
                <input
                    autoComplete='off'
                    id='name'
                    onChange={e=> setName(e.target.value)}
                    value={name}
                    required
                />
                <label htmlFor="email">Email: </label>
                <input
                    autoComplete='off'
                    id='email'
                    onChange={e=> setEmail(e.target.value)}
                    value={email}
                    required
                />
                <label htmlFor="password">Password: </label>
                <input
                    autoComplete='off'
                    id='password'
                    type='password'
                    onChange={e=> setPassword(e.target.value)}
                    value={password}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}