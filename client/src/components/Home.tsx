import { FC ,useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate,NavigateFunction, useParams } from "react-router-dom";
import {TfiTimer} from 'react-icons/tfi'
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
    const [time, setTime] = useState<number>(60)
    const [started,setStarted] = useState<Boolean>(false)
    const [newTest, setNewTest] = useState<boolean>(false)
    const [seeResults,setSeeResults]=useState<boolean>(false)
    const [suggestionUrl,setSuggestionUrl]=useState<string>('')
    let navigate:NavigateFunction = useNavigate()
    let [results,setResults]=useState<any>()
    let {id} = useParams()

    const handleNewTest =()=>{
        // resetting the url based on suggested from test results then refreshes
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
                // pinging api to get array of words and join them to string to present text
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
                    // taking in the key pressed
                    if(e.key == ' '){
                        setUserKey('space')
                        document.getElementById('space')?.classList.add('bg-zinc-800')
                    }else{
                        setUserKey(e.key)
                        document.getElementById(e.key)?.classList.add('bg-zinc-800')
                    }
                })
                document.addEventListener('keyup',(e)=>{
                    // console.log(e.key)
                    if(e.key== ' '){
                        document.getElementById('space')?.classList.remove('bg-zinc-800')
                    }else{

                        document.getElementById(e.key)?.classList.remove('bg-zinc-800')
                    }
                    setUserKey(null)
                } )
        }
        },[load,time])


    useEffect(()=>{
        if((userKey!=null)&&(started)&&(!newTest)){
            // checking if user typed in correct char
            if(words[index]=== userKey|| (words[index]== ' ' && userKey== 'space')){
                // if the next index is the same as the current (ex: 'cc' ) the userKey isn't updated so changing the load calls the useEffect because of it's dependency and allows the reset to happen
                if(words[index+1]===words[index]){
                    setLoad(false)
                    setLoad(true)
                }
                let newIndex = index +1
                setIndex(newIndex)
            }else{
                // if wrong adding to mistakes
                if(userKey.length > 0){
                    setMistakes([...mistakes, userKey])
                }
            }
        }
    },[userKey,started])


    useEffect(()=>{
        if(started){
            // game timer that starts ticking as soon as the start button is clicked and ends test
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
                <div key={`${mistake.char}`} className='flex items-center my-1 bg-stone-200 rounded-lg space-x-4 place-content-around'>
                <p>character: {mistake.char}</p>
                <p>amount: {mistake.amount}</p>
                </div>
            )
        })

        display = (
            <div className="h-2/6 w-1/3 my-0 mx-auto overflow-y-auto">
                <div className=" h-16 bg-neutral-700 items-center rounded-lg">
                    <p className="font-mono text-lg font-semibold text-white text-center">WPM: {results.wpm} </p>
                    <p className="font-mono text-lg font-semibold text-white text-center">Mistakes you made: </p>
                </div>
                <div>
                    {innerDisplay}
                </div>
            </div>
        )

    }else{
        display=null
    }

    const typedText = words.substring(0,index)
    const untypedText = words.substring(index, words.length-1)
     
    const displayText = (
        <div className="bg-neutral-300 w-7/12 mx-auto rounded-xl ">
            <p className="inline text-gray-600 bg-zinc-400 leading-loose tracking-wider">{typedText}</p>
            <p className="inline leading-loose tracking-wider">{untypedText}</p>
        </div>
    )

    const keyboard = (
        <div className="w-8/12 min-h-min mx-auto grid grid-col-4 gap-1">

                <div className="grid gap-1 grid-cols-10">
                    <span className="border-2 border-black rounded-lg text-center" id="q">q</span>
                    <span className="border-2 border-black rounded-lg text-center"  id="w">w</span>
                    <span className="border-2 border-black rounded-lg text-center"  id="e">e</span>
                    <span className="border-2 border-black rounded-lg text-center" id="r">r</span>
                    <span className="border-2 border-black rounded-lg text-center" id="t">t</span>
                    <span className="border-2 border-black rounded-lg text-center" id="y">y</span>
                    <span className="border-2 border-black rounded-lg text-center" id="u">u</span>
                    <span className="border-2 border-black rounded-lg text-center" id="i">i</span>
                    <span className="border-2 border-black rounded-lg text-center" id="o">o</span>
                    <span className="border-2 border-black rounded-lg text-center" id="p">p</span> 
                </div>

                <div className="grid gap-1 grid-cols-10">
                    <span className="border-2 border-black rounded-lg text-center" id="a">a</span>
                    <span className="border-2 border-black rounded-lg text-center" id="s">s</span>
                    <span className="border-2 border-black rounded-lg text-center" id="d">d</span>
                    <span className="border-2 border-black rounded-lg text-center" id="f">f</span>
                    <span className="border-2 border-black rounded-lg text-center" id="g">g</span>
                    <span className="border-2 border-black rounded-lg text-center" id="h">h</span>
                    <span className="border-2 border-black rounded-lg text-center" id="j">j</span>
                    <span className="border-2 border-black rounded-lg text-center" id="k">k</span>
                    <span className="border-2 border-black rounded-lg text-center" id="l">l</span>
                    <span className="border-2 border-black rounded-lg text-center" id=";">;</span>
                </div>

                <div className="grid gap-1 grid-cols-10">
                    <span></span>
                    <span className="border-2 border-black rounded-lg text-center" id="z">z</span>
                    <span className="border-2 border-black rounded-lg text-center" id="x">x</span>
                    <span className="border-2 border-black rounded-lg text-center" id="c">c</span>
                    <span className="border-2 border-black rounded-lg text-center" id="v">v</span>
                    <span className="border-2 border-black rounded-lg text-center" id="b">b</span>
                    <span className="border-2 border-black rounded-lg text-center" id="n">n</span>
                    <span className="border-2 border-black rounded-lg text-center" id="m">m</span>
                    <span className="border-2 border-black rounded-lg text-center" id=",">,</span>
                </div>
                <div className="grid">
                    <span className="border-2 border-black rounded-lg text-center" id="space">space</span>
                </div>
        </div>
    )
    return(
        
        <div>
            <div className="h-20 flex  space-x-2 bg-stone-900 text-white w-full w-screen whitespace-normal place-content-around items-center">
                <span className="flex items-center">
                <TfiTimer className=" text-xl"/>
                <p className="font-mono text-xl font-semibold flex">:{time}</p>
                </span>
                <p className="font-mono text-xl font-semibold">Tested on: {words[0]}</p>
            </div>
            <br></br>
            <div>
                {displayText}
                {started == false? <button onClick={()=>setStarted(true)} className='text-white bg-[#24292F] font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center  mx-80'>Start</button>:null}
                {newTest ? <button onClick={handleNewTest} className='text-white bg-[#24292F] font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center  mx-80'>New Test</button> :null}
            </div>
            
            {!newTest? keyboard:null}
            
            {display}
        </div>


    )
}
export default Home