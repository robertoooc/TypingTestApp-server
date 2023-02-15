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
    interface results {
        wpm: number;
        char: string;
        amount: number;
    }
    const [words,setWords]=useState<string>('')
    const [index,setIndex]=useState<number>(0)
    const [mistakes,setMistakes]=useState<string[]>([])
    const [userKey, setUserKey]= useState<string|null>('')
    const [load,setLoad] = useState<Boolean>(false)
    const [time, setTime] = useState<number>(60)
    const [started,setStarted] = useState<Boolean>(false)
    const [stop, setStop] = useState<boolean>(false)
    const [seeResults,setSeeResults]=useState<boolean>(false)
    const [results,setResults]=useState<results>()
    const handleSubmit=async(mistakes:string[])=>{
        try{
            let findWPM:number
            // let accuracy:number
            // if (index==0){
            //     findWPM=0
            //     accuracy=0
            // } else{
            //     findWPM = words.substring(0,index).split(' ').length
            //     if(mistakes.length == 0){
            //         accuracy =100
            //     }else{
            //         accuracy = Math.round(((index+mistakes.length)/index)*100)
            //     }
            // }
            // console.log(findWPM, accuracy)

            index==0?  findWPM = 0: findWPM = words.substring(0,index).split(' ').length
            
            // index==0 ? accuracy=0: accuracy = index/mistakes.length
            let count:any = {}
            mistakes.forEach((idx)=>{
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
            console.log(container)
            // setResults({
            //     wpm: findWPM,
            //     char: container.char,
            //     amount:container.amount
            // })
            let token = localStorage.getItem('jwt')
            if(!token){
                //count everthing up display result 
                
            }
            //else carry on with user
            if(!token) throw new Error('User not logged in')
            console.log('success?')
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
            console.log(token)

            return 'got it'
        }catch(err){
            console.log(typeof(err))
            return false
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
        if((userKey!=null)&&started){
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
    },[userKey,started])


    useEffect(()=>{
        if(started){
                const seconds = setInterval(()=>{
                    if(time==0){
                        const check = handleSubmit(mistakes)
                        console.log(check)
                        
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

    // let results 
    // if(seeResults){
    //     results=(
    //         <>
    //         </>
    //     )
    // }

    const typedText = words.substring(0,index)
    const untypedText = words.substring(index, words.length-1)
    return(
        <>

        Home

        <div>

        {time}
            <br></br>
            <div style={{backgroundColor: "grey"}} onClick={()=>setStarted(true)}>
                {started == false? <p>click on me to start</p>:null}
                {/* {started == false? <p>click on me to start</p>:<button onClick={()=>handleSubmit(mistakes)}>Submit</button>} */}
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