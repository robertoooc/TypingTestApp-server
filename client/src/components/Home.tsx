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
    const [words,setWords]=useState<string>('')
    const [index,setIndex]=useState<number>(0)
    const [currentChar, setCurrentChar]=useState<string|null>('')
    const [mistakes,setMistakes]=useState<Array<string>|null>([])
    const [userKey, setUserKey]= useState<string|null>('')

    useEffect(()=>{
        const pingWords=async()=>{
            try{
                const response = await axios.get(`https://api.datamuse.com/words?sp=a*`)
                const listWords = response.data.map((word:{word: string, score:number})=>{
                    return `${word.word}`
                })
                const joined = listWords.join(' ')
                setWords(joined)
                setCurrentChar(words[index])
            }catch(err){
                console.log(err)
            }
        }
        pingWords()
    },[])

    useEffect(()=>{
        document.addEventListener('keydown',(e)=>{
            setUserKey(e.key)
        })
    },[])

    useEffect(()=>{
        console.log(userKey)
        if(words[index]=== userKey){
            console.log('true')
            let newIndex = index +1
            setIndex(newIndex)
        }else{
            console.log('noooo')
        }
    },[userKey])
    return(
        <>

        Home
        <br></br>
        {words}
        </>
    )
}
export default Home
