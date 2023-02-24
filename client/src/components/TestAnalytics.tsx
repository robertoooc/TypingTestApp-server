import {FC,useEffect, useState} from "react"
import { useNavigate, NavigateFunction } from "react-router-dom";
import axios from 'axios'
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory'
interface currentUser{
    name?: string;
    email?: string;
    _id?: string;
    iat?: number
}

interface mistakes{
    char: string;
    amount: number;
    _id: string
}
interface userData{
    wpm: number;
    mistakes: [mistakes];
    _id: string;
    time: string;
    accuracy: number;
}
interface Props {
    // currentUser: currentUser|null;
    userData: any
 }
const TestAnalytics:FC<Props> =({userData})=>{
        // const [userData, setUserData] = useState<Array<userData>>()
        const [submit,setSubmit]=useState<boolean>(false)
        const [test2Clicked,setTest2Clicked]=useState<boolean>(false)
        const [test1Clicked,setTest1Clicked]=useState<boolean>(false)
        const [test1Wpm,setTest1Wpm]=useState<number>(0)
        const [test2Wpm,setTest2Wpm]=useState<number>(0)
        const [test1Accuracy,setTest1Accuracy]=useState<number>(0)
        const [test2Accuracy,setTest2Accuracy]=useState<number>(0)
        const [test1MistakeAmount,setTest1MistakeAmount]=useState<number>(0)
        const [test2MistakeAmount,setTest2MistakeAmount]=useState<number>(0)
        const [wpmPercentage,setWpmPercentage]=useState<number>(0)
        const [accuracyPercentage,setAccuracyPercentage]=useState<number>(0)
        const [mistakePercentage,setMistakePercentage]=useState<number>(0)
        const [wpmDifference,setWpmDifference]=useState<number>(0)
        const [accuracyDifference,setAccuracyDifference]=useState<number>(0)
        const [mistakeDifference,setMistakeDifference]=useState<number>(0)


        const navigate:NavigateFunction=useNavigate()

        const handleTest1=(wpm:number,mistakeAmount:number,accuracy:number)=>{
            // console.log(wpm)
            setTest1Clicked(true)
            setTest1Wpm(wpm)
            setTest1Accuracy(accuracy)
            setTest1MistakeAmount(mistakeAmount)

        }
        const handleTest2=(wpm:number,mistakeAmount:number,accuracy:number)=>{
            setTest2Clicked(true)
            setTest2Wpm(wpm)
            setTest2Accuracy(accuracy)
            setTest2MistakeAmount(mistakeAmount)
        }
        const handleCompare=()=>{
            console.log('test')
            let wpmPercentage, wpmDifference, mistakeAmountPercentage,mistakeAmountDifference
            if(test1Wpm==test2Wpm){
                wpmPercentage = 0
                wpmDifference=0
            }else{
                test2Wpm==0 ? wpmPercentage=parseFloat((((test1Wpm-0 )/Math.abs(1))*100).toFixed(2)):wpmPercentage=parseFloat((((test1Wpm-test2Wpm )/Math.abs(test2Wpm))*100).toFixed(2))
                wpmDifference = test1Wpm-test2Wpm
            }


            if(test1MistakeAmount==test2MistakeAmount){
                mistakeAmountPercentage = 0
                mistakeAmountDifference=0
            }else{
                test2MistakeAmount==0 ? mistakeAmountPercentage=parseFloat((((test1MistakeAmount-0 )/Math.abs(1))*100).toFixed(2)):mistakeAmountPercentage=parseFloat((((test1MistakeAmount-test2MistakeAmount )/Math.abs(test2MistakeAmount))*100).toFixed(2))
                mistakeAmountDifference = test1MistakeAmount-test2MistakeAmount
            }
            setWpmDifference(wpmDifference)
            setWpmPercentage(wpmPercentage)
            setMistakeDifference(mistakeAmountDifference)
            setMistakePercentage(mistakeAmountPercentage)
            console.log(typeof(mistakeAmountPercentage))
            console.log(mistakeAmountPercentage,mistakeAmountDifference)
        }

        useEffect(()=>{
            handleCompare()
        },[test1Accuracy,test1MistakeAmount,test1Wpm,test2Accuracy,test2MistakeAmount,test2Wpm])

interface mistakes{
    amount: number;
    char: string;
}
interface test{
    date: string;
    _id: string;
    wpm: number;
    time: string;
    mistakes: [mistakes];
    accuracy:number
}

let viewData
    if(userData?.length ==0){
        viewData = (
            <>
            <p>No Test Results</p>
            </>
        )
    }else{
        viewData = userData?.map((test:test)=>{
            let mistakeMessage, date,mistakeAmount:number
            test.mistakes.length > 0? mistakeAmount=test.mistakes.map(item => item.amount).reduce((prev, next) => prev + next): mistakeAmount =0
            date=test.time.slice(0,10)
            date = `${date.substring(5,7)}/${date.substring(8,10)}/${date.substring(0,4)}`
            if (test.mistakes.length > 0){
                let mistake = test.mistakes.reduce((prev,current)=>{
                    return (prev.amount > current.amount) ? prev :current
                })
                mistakeMessage= (
                <div className="text-center">
                    <p className="font-sans text-base">Most Frequent: {mistake.char}</p>
                    <p className="font-sans text-base">Amount :  {mistake.amount}</p>
                </div>
                )
            }else{
            mistakeMessage = (
                <div className="text-center">
                <p>Wow no Mistakes</p>
                </div>
                )
            } 
            return(
            <div key={`${test._id}`} className='flex place-content-around items-center my-1 bg-stone-200 rounded-lg' onClick={()=>handleTest1(test.wpm,mistakeAmount,test.accuracy)}>
                <div className="">
                    <p className="font-sans text-base">{test.wpm}</p>
                </div>
                    {mistakeMessage}    
                <div>
                    <p>
                        {`${test.accuracy}%`}
                    </p>
                </div>
                <div>
                    {date}
                </div>
            </div >
        )
    })
}
let viewData2
    if(userData?.length ==0){
        viewData2 = (
            <>
            <p>No Test Results</p>
            </>
        )
    }else{
        viewData2 = userData?.map((test:test)=>{
            let mistakeMessage,date,mistakeAmount:number
            test.mistakes.length > 0? mistakeAmount=test.mistakes.map(item => item.amount).reduce((prev, next) => prev + next): mistakeAmount =0
            date=test.time.slice(0,10)
            date = `${date.substring(5,7)}/${date.substring(8,10)}/${date.substring(0,4)}`
            if (test.mistakes.length > 0){
                let mistake = test.mistakes.reduce((prev,current)=>{
                    return (prev.amount > current.amount) ? prev :current
                })
                mistakeMessage= (
                <div className="text-center">
                    <p className="font-sans text-base">Most Frequent: {mistake.char}</p>
                    <p className="font-sans text-base">Amount :  {mistake.amount}</p>
                </div>
                )
            }else{
            mistakeMessage = (
                <div className="text-center">
                <p>Wow no Mistakes</p>
                </div>
                )
            } 
            return(
            <div key={`${test._id}`} className='flex place-content-around items-center my-1 bg-stone-200 rounded-lg' onClick={()=>handleTest2(test.wpm,mistakeAmount,test.accuracy)}>
                <div className="">
                    <p className="font-sans text-base">{test.wpm}</p>
                </div>
                    {mistakeMessage}    
                <div>
                    <p>
                        {`${test.accuracy}%`}
                    </p>
                </div>
                <div>
                    {date}
                </div>
            </div >
        )
    })
}
    return(
        <div>
            <br></br>
            <div className="flex place-content-center space-x-5">
                <div className="h-4/6 w-4/12 overflow-y-auto">
                    <div className=" place-content-around h-16 items-center rounded-lg">
                    <div className="flex flex-col-reverse divide-y divide-y-reverse">
                         {viewData}
                        </div>
                    </div>
                </div>
                <div className="h-4/6 w-4/12 overflow-y-auto">
                    <div className=" place-content-around h-16 items-center rounded-lg ">
                        <div className="flex flex-col-reverse divide-y divide-y-reverse">
                         {viewData2}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex place-content-center">
                <div>
                    <div className="flex">
                    <p className="">WPM</p>
                        <div>
                            <VictoryChart domainPadding={25} width={200} height={200}>
                                <VictoryBar
                                    categories={{ x: ["test 1", "test 2"] }}
                                    data={[
                                    {x: "test 1", y: test1Wpm},
                                    {x: "test 2", y: test2Wpm},
                                    ]}
                                    labels={({datum})=> `${datum.y} wpm`}
                                />
                            </VictoryChart>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex">
                    <p className="">Accuracy</p>
                        <div>
                            <VictoryChart domainPadding={25} width={200} height={200}>
                                <VictoryBar
                                    categories={{ x: ["test 1", "test 2"] }}
                                    data={[
                                    {x: "test 1", y: test1Accuracy},
                                    {x: "test 2", y: test2Accuracy},
                                    ]}
                                    labels={({datum})=> `${datum.y}%`}
                                />
                            </VictoryChart>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex">
                    <p className="">Mistakes</p>
                        <div>
                            <VictoryChart domainPadding={25} width={200} height={200}>
                                <VictoryBar
                                    categories={{ x: ["test 1", "test 2"] }}
                                    data={[
                                    {x: "test 1", y: test1MistakeAmount},
                                    {x: "test 2", y: test2MistakeAmount},
                                    ]}
                                    labels={({datum})=> `${datum.y}`}
                                />
                            </VictoryChart>
                        </div>

                    </div>
                </div>
            </div>
            <div className="flex place-content-evenly">
                <div>
                    <div>
                        <p>{wpmDifference}</p>
                    </div>
                    <div>
                        <p>{wpmPercentage}%</p>
                    </div>
                </div>
                <div>
                    <div>
                        <p>{accuracyDifference}</p>
                    </div>
                    <div>
                        <p>{accuracyPercentage}%</p>
                    </div>
                </div>
                <div>
                    <div>
                        <p>{mistakeDifference}</p>
                    </div>
                    <div>
                        <p>{mistakePercentage}%</p>
                    </div>
                </div>
            </div>


        </div>
    )
}
export default TestAnalytics