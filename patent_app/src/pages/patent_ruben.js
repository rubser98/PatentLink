import Head from 'next/head'
import 'bulma/css/bulma.css'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
const vendite = () =>  {
    
    const [error, setError] = useState('')
    const [totale,setTotale] = useState(0)
    const [conteggioPint,setConteggio] = useState('')
    const [buyCount, setBuyCount] = useState(0)
    const [etherCount, setEtherCount] = useState('')
    const [web3, setWeb3] = useState(null)
    const [patentName, setPatentName] = useState(null)
    const [pdfFile, setPdfFile] = useState(null);

   

    useEffect(()=>{
        
         getTotaleHandler()
      
        
    })

    const filePatentHandler = async () => {
        const accounts = await web3.eth.getAccounts();
        const confirmation = window.confirm("Confermi il deposito del brevetto?")
        if (confirmation) {
          try {

            await patentNFTContract.methods.filePatent('provaURI1', patentName).send({
                from : accounts[0],
                //value : web3.utils.toWei(etherCount, "ether"),
                gas: 300000,
               // gasPrice: "30000000",
    
            });
    
            console.log("Brevetto depositato con successo!");
            // Aggiorna lo stato o esegui altre azioni necessarie dopo il deposito del brevetto
          } catch (err) {
            console.error("Errore durante il deposito del brevetto:", err.message);
            setError(err + "");
          }
        } else {
          console.log("Deposito del brevetto annullato");
        }
      }

    
    
    const getMyCountPintHandler = async (web3) => {
        console.log(web3)
        const accounts = await web3.eth.getAccounts() 
        console.log(accounts)
        console.log(accounts[0])
        var count = await patentTokenContract.methods.balanceOf(accounts[0]).call()
        count = (Number(count)*Math.pow(10,-18)).toFixed(1)
        //count = count*0.000000000000000001
        console.log(count)
        setConteggio("Balance: " + count + ' PTNT')
    } 

    const updatePintQty = event => {
        //function needed to save the amount of tokens written on the input form by the user (this value will be useful in the buyPintHandler)
        setBuyCount((event.target.value * Math.pow(10, 18)).toFixed(0))
        setEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 18)).toFixed(0))
        
        
    }
    
    const getTotaleHandler = async() => {
        try
        {
        
        const totale2 = await patentTokenContract.methods.getFilingFee().call()
        
        setTotale((Number(totale2)*Math.pow(10,-18)).toFixed(1))
      
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
        <title>PatentLink</title>
        <meta name="description" content="home" />
      </Head>

      <nav className="navbar mt-4 mb-4">
        <div className='container'>
          <div className='navbar-brand'>
            <h1>PatentLink</h1>
          </div>
          <div className='navbar-end'>
            <button onClick={connectWalletHandler} className='button is-primary'>Connect Wallet</button>
          </div>
        </div>
      </nav>

      <section>
        <div className='container'>
          <h2>Filing fee: {totale} PTNT </h2>
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
            <label className='label'>FILE PATENT</label>
            <div className='control'>
              <input
                onChange={(e) => setPatentName(e.target.value)}
                className='input'
                type='text'
                placeholder='Enter patent name...'
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              <button
                onClick={filePatentHandler}
                className='button is-primary mt-3'
                disabled={!patentName || !pdfFile}
              >
                Submit
              </button>
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