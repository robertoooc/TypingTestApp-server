// import { FC ,useState, useEffect } from "react";
// import axios from 'axios'
// interface currentUser{
//     name?: string;
//     email?: string;
//     id?: string;
//     iat?: number
// }
// interface Props {
//     currentUser: currentUser|null;
//  }
// const Home:FC<Props>=({currentUser})=>{
//     const [words,setWords]=useState<string>('')
//     const [index,setIndex]=useState<number>(0)
//     const [currentChar, setCurrentChar]=useState<string|null>('')
//     const [mistakes,setMistakes]=useState<Array<string>|null>([])
//     const [userKey, setUserKey]= useState<string|null>('')
//     const [start, setStart] = useState<Boolean>(false)
    
//     const check=(char:string)=>{
//         if(start){
//             console.log(char, words[index])
//             if(words[index]===char){
//                 console.log('true')
//                 let newIndex = index +1
//                 setIndex(newIndex)
//             }else{
//                 console.log('noooo')
//             }
//         }
//     }

//     useEffect(()=>{
//         console.log(start)
//         const pingWords=async()=>{
//             try{
//                 const response = await axios.get(`https://api.datamuse.com/words?sp=a*`)
//                 const listWords = response.data.map((word:{word: string, score:number})=>{
//                     return `${word.word}`
//                 })
//                 const joined = listWords.join(' ')
//                 setWords(joined)
//                 setCurrentChar(words[index])
//             }catch(err){
//                 console.log(err)
//             }
//         }
//         pingWords()
//     },[start])

//     useEffect(()=>{
//         if(start){
//             document.addEventListener('keydown',(e)=>{
//                 console.log('in')
//                 setUserKey(e.key)
//                 check(e.key)
//             })
//         }
//     },[])

//     // useEffect(()=>{
//     //     console.log(userKey)
//     //     if(words[index]=== userKey){
//     //         console.log('true')
//     //         let newIndex = index +1
//     //         setIndex(newIndex)
//     //     }else{
//     //         console.log('noooo')
//     //     }
//     // },[userKey])
//     return(
//         <>

//         Home
//         <br></br>
//         {words}
//         <button onClick={()=>setStart(true)}>Start</button>
//         </>
//     )
// }
// export default Home
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
    const [mistakes,setMistakes]=useState<string[]>([])
    const [userKey, setUserKey]= useState<string|null>('')
    const [double, setDouble] = useState<Boolean>(false)
    const [load,setLoad] = useState<Boolean>(false)
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
        setLoad(true)
    },[])

    useEffect(()=>{
        if(load){
                document.addEventListener('keydown',(e)=>{
                    setUserKey(e.key)
                })
                document.addEventListener('keyup',()=>{
                    setUserKey(null)
                } )
        }
        },[load])

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
    // useEffect(()=>{
    //     if(double){
    //         console.log('in hte loop')
    //         document.addEventListener('keydown',(e)=>{
    //         if(e.key == words[index]){
    //             console.log(e.key)
    //             let newIndex = index +1
    //             setIndex(newIndex)
    //             setDouble(false) 
    //             return 
    //         }else{
    //             console.log(`wrong, : ${e.key} shouldve been ${words[index]}`)
    //             setDouble(false) 
    //             setUserKey(e.key)
    //         console.log('exit loop')
    //         return 
    //         }
    //     })
    //     document.addEventListener('keyup',()=>{
    //         console.log('leave')
    //         return 
    //     })
    // }
    // },[double==true])

    const typedText = words.substring(0,index)
    const untypedText = words.substring(index, words.length-1)
    return(
        <>

        Home

        <div>
            <br></br>
            <span style={{color: "grey"}}>
            {typedText}
            </span>
            <span>
            {untypedText}
            </span>
        </div>

        </>
    )
}
export default Home