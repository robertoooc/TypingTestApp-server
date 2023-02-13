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
    const [mistakes,setMistakes]=useState<Array<string>|null>([])
    const [userKey, setUserKey]= useState<string|null>('')
    const [double, setDouble] = useState<Boolean>(false)

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
        // console.log(double, 'hehe')
        document.addEventListener('keydown',(e)=>{
            // if(e.key == userKey) console.log('maybe')
            setUserKey(e.key)
        })
    },[])

    useEffect(()=>{
        console.log(userKey)
        if(words[index]=== userKey){
            if(words[index+1]===words[index]){
                setDouble(true)
                // console.log('double')
            }
            // console.log('true')
            let newIndex = index +1
            setIndex(newIndex)
        }else{
            // console.log('noooo')
        }
    },[userKey])
    useEffect(()=>{
    if(double){
        document.addEventListener('keydown',(e)=>{
            if (e.key == words[index]){
                console.log(e.key)
                let newIndex = index +1
                setIndex(newIndex)
                setDouble(false) 
            }
        })
    }
    },[double])
    return(
        <>

        Home
        <br></br>
        {words}
        </>
    )
}
export default Home