import { FC ,useState, useEffect } from "react";
import axios from 'axios'
interface currentUser{
    name?: string;
    email?: string;
    id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
 }
const Home:FC<Props>=({currentUser})=>{
    const [words,setWords]=useState([])
    const [commonMistake,setCommonMistake]=useState<string|null>('')
    useEffect(()=>{
        const pingWords=async()=>{
            try{
                const response = await axios.get(`https://api.datamuse.com/words?sp=a*`)
                console.log(response.data)
                
            }catch(err){
                console.log(err)
            }
        }
        pingWords()
    },[])
    return(
        <>

        Home
        </>
    )
}
export default Home
