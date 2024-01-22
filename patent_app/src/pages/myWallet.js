
import Head from 'next/head'
import 'bulma/css/bulma.css'
import styled from 'styled-components';
import { useState, useEffect,useRef } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import Swal from 'sweetalert2';
import CardTable from './CardTable';
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import  axios from'axios'
import  FormData from 'form-data'


const myWallet = () =>  {
    const loaded  = useRef(false);
    var cardList = []
    const [cardData, setCard]  = useState([]);
    const pathBasePinata = "https://gateway.pinata.cloud/ipfs/"
    const [error, setError] = useState('')
    const [isConnectedToMetamask , setConnection] = useState(false)
    const [web3, setWeb3] = useState(null);


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
      {
        setConnection(true)
        cardList = []
        setCard([])
        getPatentHandler(_web3)
      

      }

      window.ethereum.on('accountsChanged', (accounts) => {
          
          if (accounts.length === 0) {
            var _web3 = new Web3(window.ethereum)
            console.log('Metamask disconnesso');
            cardList = []
            setCard([])
            setConnection(false)
    
          } else {
            setConnection(true)
            cardList = []
            setCard([])
            var _web3 = new Web3(window.ethereum)
            getPatentHandler(_web3)
          
          }
      })

  }
 
    useEffect(() => {
      if (!loaded.current) {
        loaded.current = true
        metamaskConnetcionHandler()
      }


  }, [])
  

  
    const connectWalletHandler = async () => {
      console.log("test")

      try {

          if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            
             
              await window.ethereum.request({ method: "eth_requestAccounts" })
              var _web3 = new Web3(window.ethereum)
              setConnection(true)
              setWeb3(_web3)
             
              

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
        try {

          for(let i=0; i < patentList.length; i++){
         
       
          const patent = await patentNFTContract.methods.getPatent(patentList[i]).call()
          console.log(patent)
          const patentURI = await patentNFTContract.methods.tokenURI(patentList[i]).call()
          var brevetto =   { title: patent.name, description: 'Descrizione della card 1' , link : pathBasePinata +  patentURI, id: patentList[i], sender: accounts[0]}
          cardList.push(brevetto)
          
        

          console.log(patent)
          console.log(`PatentID: ${i}: ${patent.name}`)
          
          console.log(`PatentID: ${i}: ${patentURI}`)
         
        }
        setCard(cardList)
  
          // Aggiorna lo stato o esegui altre azioni necessarie dopo il deposito del brevetto
        } catch (err) {
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
                        <h1>myWallet</h1>
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
                      <form action="/patentGalleryHome">
                       <button className='button is-primary'> patentGallery</button>
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
            
          
          
           
           <div  className={styles.div} >
              <h1>Tabella di Card</h1>
             <CardTable  data={cardData} />
           </div>
        </div>
        
    )
}

export default myWallet