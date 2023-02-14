import { FC ,useState, useEffect } from "react";
import axios from 'axios'
interface currentUser{
    name?: string;
    email?: string;
    _id?: string;
    iat?: number
}
interface Props {
    currentUser: currentUser|null;
    token: string|null
 }
const Home:FC<Props>=({currentUser,token})=>{
    const [words,setWords]=useState<string>('')
    const [index,setIndex]=useState<number>(0)
    const [mistakes,setMistakes]=useState<string[]>([])
    const [userKey, setUserKey]= useState<string|null>('')
    const [load,setLoad] = useState<Boolean>(false)
    const [time, setTime] = useState<number>(0)
    const [started,setStarted] = useState<Boolean>(false)

    const handleSubmit=async(mistakes:string[])=>{
        try{
            let count:any = {}
            const condensedMistakes = mistakes.forEach((idx)=>{
                count[idx] = (count[idx]||0)+1
            })
            let container = []
            for(const [key,value] of Object.entries(count)){
                let newEntry={
                    char:key,
                    amount:value
                }
                container.push(newEntry)
            }
            const payload={
                id: currentUser?._id,
                wpm: 10,
                mistakes: container
            }
            let token = localStorage.getItem('jwt')
            const sendData = await axios.post('http://localhost:8000/tests',payload,{
                headers: {
                  'Authorization': `${token}`
                }
            })
            console.log(token)
        }catch(err){
            console.log(err)
        }
    }


    useEffect(()=>{
        const pingWords=async()=>{
            try{
                const response = await axios.get(`https://api.datamuse.com/words?sp=a*`)
                const listWords = response.data.map((word:{word: string, score:number})=>{
                    return `${word.word}`
                })
                const joined = listWords.join(' ')
                setWords(joined)
            }catch(err){
                console.log(err)
            }
        }
        pingWords()
        setLoad(true)
    },[])

    useEffect(()=>{
        if(load&& started){
                document.addEventListener('keydown',(e)=>{
                    setUserKey(e.key)
                })
                document.addEventListener('keyup',()=>{
                    setUserKey(null)
                } )
        }
        },[load,time])


    useEffect(()=>{
        if(userKey!=null){
            console.log(userKey)
            if(words[index]=== userKey){
                if(words[index+1]===words[index]){
                    setLoad(false)
                    setLoad(true)
                }
                let newIndex = index +1
                setIndex(newIndex)
            }else{
                if(userKey.length > 0){
                    console.log(`wrong, ${userKey} supposed to be ${words[index]}`)
                    setMistakes([...mistakes, userKey])
                }
            }
        }
    },[userKey])

useEffect(()=>{
    if(started){
        setInterval(()=>{
            if(time == 60){
                setTime(-1)
            }else{
                let newTime: number = time +1
                setTime(newTime)
            }
        },1000)
    }
},[started,time])

    const typedText = words.substring(0,index)
    const untypedText = words.substring(index, words.length-1)
    return(
        <>

        Home

        <div>
            {time}
            <br></br>
            <div style={{backgroundColor: "grey"}} onClick={()=>setStarted(true)}>
                {started == false? <p>click on me to start</p>:<button onClick={()=>handleSubmit(mistakes)}>Submit</button>}
                <br></br>
            <span style={{color: "grey"}}>
            {typedText}
            </span>
            <span>
            {untypedText}
            </span>
            </div>
        </div>

        </>
    )
}
export default Home