
import Head from 'next/head'
import 'bulma/css/bulma.css'
import styled from 'styled-components';
import { useState, useEffect,useRef } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import Swal from 'sweetalert2';
import PatentGalleryFormat from './patentGalleryFormat';
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import  axios from'axios'
import  FormData from 'form-data'
import CardTable from './CardTable';



const patentGallery = () =>  {
    const loaded  = useRef(false);
    var cardList = []
    const [cardData, setCard]  = useState([]);
    const pathBasePinata = "https://gateway.pinata.cloud/ipfs/"
    const [error, setError] = useState('')
    const [conteggioPint, setConteggio] = useState('')
    const [web3, setWeb3] = useState(null);
    const [isConnectedToMetamask , setConnection] = useState(false)
  
   
    useEffect(() => {
      if (!loaded.current) {
        loaded.current = true
       
          metamaskConnetcionHandler()
          
      }


  }, [])
    const loadHandler = async () => 
    {
      var _web3 = new Web3(window.ethereum)
      setWeb3(_web3)
      cardList = []
      setCard([])
      getPatentHandler(_web3)

    }
    
    const metamaskConnetcionHandler = async() => {
      var _web3 = new Web3(window.ethereum)
      const accounts = await _web3.eth.getAccounts() 
      setWeb3(_web3)
      
      if (accounts.length === 0) {
        console.log('Metamask disconnesso');
        setConnection(false)
        cardList = []
        setCard([])

      }
      else
      { console.log("reload")
        setConnection(true)
        cardList = []
        setCard([])
        loadHandler()
      

      }
      window.ethereum.on('accountsChanged', async (accounts) => {
            
        var _web3 = new Web3(window.ethereum)
        setWeb3(_web3)
      
      
        if (accounts.length === 0) {
         console.log('Metamask disconnesso');
         setConnection(false)
         cardList = []
         setCard([])

         }
        else
        {
          setConnection(true)
          cardList = []
          setCard([])
          loadHandler()
        }
    })

    }
  
    const connectWalletHandler = async () => {

      try {

          if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            console.log("connessione")
            await window.ethereum.request({ method: "eth_requestAccounts" })
            var _web3 = new Web3(window.ethereum)
            setConnection(true)
            setWeb3(web3)

          }
          else {
              Swal.fire({
                  icon: 'error',
                  title: 'Operazione andata in errore!',
                  text: 'it is required to install metamask ' + error.data.message,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'OK'
              })
          }
      }
      catch (e) {
          setError("l'utente ha rifiutato la connessione")
      }
  }
   
  const getPatentHandler = async (web3) => {
    const accounts = await web3.eth.getAccounts() 
    console.log(accounts)
    console.log(accounts[0])
    var patentList = await patentNFTContract.methods.getPatentsByOwner(accounts[0]).call()
    console.log(patentList)
    var patentCount = await patentNFTContract.methods.getTokenCount().call()

    
      try {

        for(let i=0; i < patentCount; i++){
        console.log(patentList, BigInt(i) , !patentList.includes(BigInt(i)))
        if (!patentList.includes(BigInt(i))){
          const patent = await patentNFTContract.methods.getPatent(i).call()
          const patentURI = await patentNFTContract.methods.tokenURI(i).call()
          var brevetto =   { title: patent.name, description: 'Descrizione della card 1' , link : pathBasePinata +  patentURI, id: i}
          cardList.push(brevetto)
        }
      
        
      }
      console.log(cardList)
      setCard(cardList)
      console.log(cardData)
    

        // Aggiorna lo stato o esegui altre azioni necessarie dopo il deposito del brevetto
      } catch (err) {
        console.log(cardList)
        setCard(cardList)
        console.log(cardData)
        console.error("Errore durante il deposito del brevetto:", err.message);
        setError(err + "");
      }
     
    }
    return (
        <div className={styles.main}>
            <Head>
                <title>My Wallet</title>
                <meta name="description" content="home" />
            </Head>

            <nav className="navbar mt-4 mb-4">
                <div className='container'>
                    <div className='navbar-brand ml-15'>
                        <h1>saleHome</h1>
                    </div>
                    <div  className='navbar-item'>
                      <form action="/homeSales">
                       <button className='button is-primary'> buyPNT</button>
                      </form>

                    </div>
                    <div  className='navbar-item'>
                      <form action="/">
                       <button className='button is-primary'> home</button>
                      </form>

                    </div>
                    
                    <div  className='navbar-item'>
                      <form action="/patentDeploy">
                       <button className='button is-primary'> patentDeployHome</button>
                      </form>

                    </div>
                    <div  className='navbar-item'>
                      <form action="/myWallet">
                       <button className='button is-primary'> myWallet</button>
                      </form>

                    </div>
                    <div className='navbar-end'>
                        <button
                            disabled={isConnectedToMetamask}
                            onClick={connectWalletHandler}
                            className='button is-primary'>connect wallet
                            
                        </button>

                    </div>

                </div>
                

            </nav>
          
            <section>
                <div >
                    <p> {conteggioPint}</p>
                </div>
            </section>
            <div className={styles.div} >
              <h1>Tabella di Card</h1>
             <PatentGalleryFormat data={cardData} />
           </div>
        </div>
        
    )
}

export default patentGallery