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
        // const [userData, setUserData] = useState<Array<userData>>()
        // const [submit,setSubmit]=useState<boolean>(false)
        // const [test2Clicked,setTest2Clicked]=useState<boolean>(false)
        // const [test1Clicked,setTest1Clicked]=useState<boolean>(false)
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
        const [test1,setTest1]=useState<test>()
        const [test2,setTest2]=useState<test>()


        const handleTest1=(wpm:number,mistakeAmount:number,accuracy:number,test:test)=>{
            // console.log(wpm)
            // setTest1Clicked(true)
            setTest1Wpm(wpm)
            setTest1Accuracy(accuracy)
            setTest1MistakeAmount(mistakeAmount)
            setTest1(test)

        }
        const handleTest2=(wpm:number,mistakeAmount:number,accuracy:number,test:test)=>{
            // setTest2Clicked(true)
            setTest2Wpm(wpm)
            setTest2Accuracy(accuracy)
            setTest2MistakeAmount(mistakeAmount)
            setTest2(test)
        }
        const handleCompare=()=>{
            console.log('test')
            let wpmPercentage, wpmDifference, mistakeAmountPercentage,mistakeAmountDifference, accuracyDifference,accuracyPercentage
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

            if(test1Accuracy==test2Accuracy){
                accuracyPercentage = 0
                accuracyDifference=0
            }else{
                test2Accuracy==0 ? accuracyPercentage=parseFloat((((test1Accuracy-0 )/Math.abs(1))*100).toFixed(2)):accuracyPercentage=parseFloat((((test1Accuracy-test2Accuracy )/Math.abs(test2Accuracy))*100).toFixed(2))
                accuracyDifference = test1Accuracy-test2Accuracy
            }
            setWpmDifference(wpmDifference)
            setWpmPercentage(wpmPercentage)
            setMistakeDifference(mistakeAmountDifference)
            setMistakePercentage(mistakeAmountPercentage)
            setAccuracyDifference(accuracyDifference)
            setAccuracyPercentage(accuracyPercentage)
            console.log(typeof(mistakeAmountPercentage))
            console.log(mistakeAmountPercentage,mistakeAmountDifference)
        }

        useEffect(()=>{
            handleCompare()
        },[test1Accuracy,test1MistakeAmount,test1Wpm,test2Accuracy,test2MistakeAmount,test2Wpm])


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
            <div key={`${test._id}`} className='flex place-content-around items-center my-1 bg-stone-200 rounded-lg' onClick={()=>handleTest1(test.wpm,mistakeAmount,test.accuracy,test)}>
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
            <div key={`${test._id}`} className='flex place-content-around items-center my-1 bg-stone-200 rounded-lg' onClick={()=>handleTest2(test.wpm,mistakeAmount,test.accuracy,test)}>
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

    let display1,display2
    if(test1!=null){
        display1 = (
            <div className="bg-zinc-700">
                <p>Test 1</p>
                <p>Date: {test1.date}</p>
                
            </div>
        )
    }else{
        display1=(
            <div>
                no show
            </div>
        )
    }
    if(test2!=null){
        display2=(
            <div>
                show
            </div>
        )
    }else{
        display2=(
            <div>
                no show
            </div>
        )
    }

    let displaySelectedTests = (
        <div>
            <p className="text-center">Selected Tests</p>
            <div className="flex place-content-center space-x-5">
                {display1}
                {display2}
            </div>
        </div>
    )
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
            {displaySelectedTests}
            <div className="flex place-content-evenly">
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
                        <p className="text-center">Test-1 compared to Test-2: WPM</p>
                    <div>
                        {wpmDifference < 0 ? <p className="text-center">{wpmDifference*-1} less WPM</p>:<p className="text-center">{wpmDifference} more WPM</p>}
                    </div>
                    <div>
                        {wpmPercentage < 0 ? <p className="text-center">{wpmPercentage*-1}% decline</p>:<p className="text-center">{wpmPercentage}% increase</p>}
                    </div>
                </div>
                <div>
                        <p className="text-center">Test-1 compared to Test-2: Spelling Accuray</p>
                    <div>
                        {accuracyPercentage < 0 ? <p className="text-center">{accuracyPercentage*-1}% decreased spelling accuracy</p>:<p className="text-center">{accuracyPercentage}% increased spelling accuracy</p>}
                    </div>
                </div>
                <div>
                        <p className="text-center">Test-1 compared to Test-2: Total Mistakes</p>
                    <div>
                        {mistakeDifference < 0 ? <p className="text-center">{mistakeDifference*-1} less mistakes</p>:<p className="text-center">{mistakeDifference} more mistakes</p>}
                    </div>
                    <div>
                        {mistakePercentage < 0 ? <p className="text-center">{mistakePercentage*-1}% decrease</p>:<p className="text-center">{mistakePercentage}% increase</p>}
                    </div>
                </div>
            </div>


        </div>
    )
}
export default TestAnalytics