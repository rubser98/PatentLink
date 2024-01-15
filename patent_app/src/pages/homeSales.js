import Head from 'next/head'
import 'bulma/css/bulma.css'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import vmContract from '../../blockchain/vending'
const vendite = () =>  {
    
    const [error, setError] = useState('')
    const [totale,setTotale] = useState(0)
    const [conteggioPint,setConteggio] = useState('')
    const [buyCount, setBuyCount] = useState(0)
    const [etherCount, setEtherCount] = useState('')
    const [web3, setWeb3] = useState(null);
   

    useEffect(()=>{
        
         getTotaleHandler()
      
        
    })
    
    const getMyCountPintHandler = async (web3) => {
        console.log(web3)
        const accounts = await web3.eth.getAccounts() 
        console.log(accounts)
        console.log(accounts[0])
        var count = await vmContract.methods.balanceOf(accounts[0]).call()
        count = Number(count)
        count = count*0.000000000000000001
        console.log(count)
        setConteggio("this is your amount of pint : " + count)
    } 

    const updatePintQty = event => {
        //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
        setBuyCount((event.target.value * Math.pow(10, 12)).toFixed(0))
        setEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 12)).toFixed(0))
        
        
    }
    
    const buyPintHandler = async () => {
        console.log(web3)
        //web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts() 
        console.log(buyCount)
        console.log(etherCount)
        try{
        console.log(accounts[0])
        const transactionObject = {
            from: accounts[0],
            to:  "0x1729c516755eE568c59c5deb315971F24a3705fA", //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
            gas: '300000',  // Gas limit
            
            data: vmContract.methods.buyToken(Number(buyCount)).encodeABI(), // Includi il metodo e i suoi parametri
          };
          const result = await ethereum.request({
            value : web3.utils.toWei(etherCount, "ether"),
            method: 'eth_sendTransaction',
            params: [transactionObject],
          });
        /*await vmContract.methods.buyToken(Number(buyCount)).send({
            from : accounts[0],
            value : web3.utils.toWei(etherCount, "ether"),
            gas: 50000,
           // gasPrice: "30000000",

        })*/
        getMyCountPintHandler(web3)
        }
        catch(err)
        {
            console.log(err)
            setError(err +"")
        }


    }




    const getTotaleHandler = async() => {
        try
        {
        
        const totale2 = await vmContract.methods.totalSupply().call()
        
        setTotale((Number(totale2)/1000000000000000000).toFixed(0))
      
        }
        catch(e)
        {
            console.log(e)
        }

    }
    const connectWalletHandler = async() => {
       
        
        try{
        
           if (typeof window !== "undefined" && typeof window.ethereum !== "undefined")
             {
                
                await window.ethereum.request({method: "eth_requestAccounts"})
                var _web3 = new Web3(window.ethereum)
                setWeb3(_web3)
                console.log(web3)
                getMyCountPintHandler(_web3)
                
 
              }
                   
            else 
             {
               console.log("pls install metamask")
             }
        }
    catch(e)
    {   
        setError("l'utente ha rifiutato la connessione" )
    }
   

    }

    return (
        <div className={styles.main}>
        <Head>
        <title>Home app</title>
        <meta name="description" content="home" />
        </Head>
       
        <nav className = "navbar mt-4 mb-4">
            <div className='container'>
                <div className='navbar-brand'>
                    <h1>saleHome</h1>
                </div>
                <div className='navbar-end'>
                    <button onClick={connectWalletHandler} className='button is-primary'>connect wallet</button>

                </div>

            </div>

        </nav>
        <section>
            <div className='container'>
                <h2>totale supply pint: {totale}</h2>
            </div>
        </section>
        <section>
            <div className='container'>
                <p> {conteggioPint}</p>
            </div>
        </section>
        <section className='mt-5'>
            <div className='container'>
                <div className='field'>
                    <label className='label'> BUY PINT</label>
                    <div className='control'>
                        <input onChange = {updatePintQty} className='input' type='type' placeholder='Enter amount...'/>
                        <button 
                        onClick={buyPintHandler} 
                        className =  'button is-primary mt-3' > 
                        buy</button>

                       
                    </div>

                </div>
            </div>
        </section>
        <section>
            <div className='container has-text-danger'>
                <p>{error}</p>
            </div>
        </section>
      
        
        </div>
    ) 
}

export default vendite