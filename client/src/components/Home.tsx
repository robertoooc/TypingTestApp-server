import { FC ,useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate,NavigateFunction, useParams } from "react-router-dom";

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
    interface mistakes{
            char:string;
            amount:number; 
    }
    interface results {
        wpm: number;
        mistakes: [mistakes]
    }
    const [words,setWords]=useState<string>('')
    const [index,setIndex]=useState<number>(0)
    const [mistakes,setMistakes]=useState<string[]>([])
    const [userKey, setUserKey]= useState<string|null>('')
    const [load,setLoad] = useState<Boolean>(false)
    const [time, setTime] = useState<number>(5)
    const [started,setStarted] = useState<Boolean>(false)
    const [newTest, setNewTest] = useState<boolean>(false)
    const [seeResults,setSeeResults]=useState<boolean>(false)
    const [suggestionUrl,setSuggestionUrl]=useState<string>('')
    let navigate:NavigateFunction = useNavigate()
    let [results,setResults]=useState<any>()
    let {id} = useParams()

    const handleNewTest =()=>{
        navigate(suggestionUrl) 
        navigate(0)
    }

    const handleSubmit=async(mistakes:string[])=>{
        try{
            let findWPM:number
            index==0?  findWPM = 0: findWPM = words.substring(0,index).split(' ').length
            let count:any={}
            mistakes.forEach((idx)=>{
                count[idx] = (count[idx]||0)+1
            })
            let container = []
            for(const [key,value] of Object.entries<number>(count)){
                let newEntry={
                    char:key,
                    amount:value
                }
                container.push(newEntry)
            }
            let token = localStorage.getItem('jwt')
            const structureResults = {
                wpm: findWPM,
                mistakes:container
            }
            setResults(structureResults)
            setSeeResults(true)

            if(token){
                const payload={
                    id: currentUser?._id,
                    wpm: findWPM,
                    mistakes: container
                }
                const sendData = await axios.post('http://localhost:8000/tests',payload,{
                    headers: {
                        'Authorization': `${token}`
                    }
                })
                console.log(sendData.data)
            }
                
            if(container.length==0){
                setNewTest(true)
                const alphabet ="abcdefghijklmnopqrstuvwxyz"
                const randomSuggestion = alphabet[Math.floor(Math.random()*26)]
                setSuggestionUrl(`/test/${randomSuggestion}`)
            }else{
                const suggestion = container.reduce((prev,current)=>{
                    return (prev.amount > current.amount) ? prev : current
                })
                setNewTest(true)
                setSuggestionUrl(`/test/${suggestion.char}`)
            }
            return 'got it'
        }catch(err){
            console.log(typeof(err))
            return false
        }
    }


    useEffect(()=>{
        const pingWords=async()=>{
            try{
                if(id?.length == undefined){
                    id = 'a'
                }else{
                    if(id.length > 1){
                        id = id[0]
                    }
                }
                const response = await axios.get(`https://api.datamuse.com/words?sp=${id}*`)
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
        if((userKey!=null)&&(started)&&(!newTest)){
            if(words[index]=== userKey){
                if(words[index+1]===words[index]){
                    setLoad(false)
                    setLoad(true)
                }
                let newIndex = index +1
                setIndex(newIndex)
            }else{
                if(userKey.length > 0){
                    setMistakes([...mistakes, userKey])
                }
            }
        }
    },[userKey,started])


    useEffect(()=>{
        if(started){
                const seconds = setInterval(()=>{
                    if(time==0){
                        const check = handleSubmit(mistakes)      
                        clearInterval(seconds)
                        return time 
                } 
                setTime((prev)=>prev-1)
            },1000)
            return ()=>{
                clearInterval(seconds)
            }

        }
    },[time,started])

    let display
    if(seeResults){
        let innerDisplay = results.mistakes.map((mistake:{char:string, amount:number})=>{

            return(
                <p key={`${mistake.char}`} style={{display:'inline-block',padding:'10px'}}>character: {mistake.char}, amount: {mistake.amount}</p>
            )
        })
        display = (
            <span style={{textAlign:'center'}}>
            <p>WPM: {results.wpm}</p>
            <p>Mistakes you made: </p>
                {innerDisplay}
            </span>
        )
    }else{
        display=null
    }

    const typedText = words.substring(0,index)
    const untypedText = words.substring(index, words.length-1)
    return(
        <>


        <div>

        {time}
            {newTest ? <button onClick={handleNewTest}>New Test</button> :null}
            <br></br>
            <div style={{backgroundColor: "grey"}} onClick={()=>setStarted(true)}>
                {started == false? <p>click on me to start</p>:null}
                <br></br>
            <span style={{color: "grey"}}>
            {typedText}
            </span>
            <span>
            {untypedText}
            </span>
            </div>
            {display}
        </div>

        </>
    )
}
export default Home