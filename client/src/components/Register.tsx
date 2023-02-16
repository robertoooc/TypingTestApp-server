import { useState,FC } from "react";
import axios from "axios";
import jwt_decode from 'jwt-decode'
import { useNavigate, NavigateFunction } from "react-router-dom";
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
const Register:FC<Props> = ({currentUser,setCurrentUser})=>{
	const [name, setName] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [message, setMessage] = useState<string>('')
    const navigate: NavigateFunction = useNavigate()

    const handleSubmit = async(e:any)=>{
        e.preventDefault()
        try{
            const reqBody = {
                name, 
                email,
                password
            }
            const submit = await axios.post('http://localhost:8000/users/register', reqBody)

            const {token} = submit.data
            localStorage.setItem('jwt',token)
            const decoded = jwt_decode<currentUser>(token)
            console.log(decoded,'🐥')
            setCurrentUser(decoded)
            navigate('/profile')
        }catch(err:any){
            console.log(err)
            if (err.response) setMessage(err.response.data.message)
        }
    }
    return(

        <div className=" m-auto">

                <form onSubmit={handleSubmit} className='max-w-[400px] w-full mx-auto bg-zinc-800 p-8 px-8 rounded-lg'>
                    <h2 className="text-4xl dark:text-white font-bold text-center">Register</h2>
                    <div className="flex flex-col text-gray-400 py-2">
                        <label htmlFor="name">Name: </label>
                        <input
                            autoComplete='off'
                            id='name'
                            onChange={e=> setName(e.target.value)}
                            value={name}
                            required
                            className="rounded-lg text-black"
                            />
                    </div>
                    <div className="flex flex-col text-gray-400 py-2">
                        <label htmlFor="email">Email: </label>
                        <input
                            autoComplete='off'
                            id='email'
                            onChange={e=> setEmail(e.target.value)}
                            value={email}
                            required
                            className="rounded-lg text-black"
                            />
                    </div>
                    <div className="flex flex-col text-gray-400 py-2">
                        <label htmlFor="password">Password: </label>
                        <input
                            autoComplete='off'
                            id='password'
                            type='password'
                            onChange={e=> setPassword(e.target.value)}
                            value={password}
                            required
                            className="rounded-lg text-black"
                            />
                    </div>
                    <button type="submit" className="w-full my-5 py-2 bg-zinc-700 text-white font-semibold rounded-lg">Submit</button>
                </form>
                <p className='text-center text-red-600 mt-2'>{message}</p>
        </div>

    )
}
export default Register