
import Head from 'next/head'
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
    
    const changeConnectButton = async(bool) => {
      
      const connectbutton = document.getElementById("connectbutton")

      if(bool==true){
        connectbutton.textContent = "MyWallet"
        connectbutton.style.backgroundColor = "#6f42c1"
        connectbutton.href = "/myWallet"
      }
      else{
        connectbutton.textContent = "connect wallet"
        connectbutton.style.backgroundColor = "bg-secondary"
      }
    }

    const getMyCountPintHandler = async (web3) => {
      console.log(web3)
      const accounts = await web3.eth.getAccounts()
      console.log(accounts)
      console.log(accounts[0])
      var count = await patentTokenContract.methods.balanceOf(accounts[0]).call()
      count = Number(count)
      count = count / Math.pow(10, 18).toFixed(0)
      console.log(count)
      setConteggio(count)
      localStorage.setItem("conteggio",count);
  }

    const metamaskConnetcionHandler = async() => {

      var _web3 = new Web3(window.ethereum)
      const accounts = await _web3.eth.getAccounts() 
      setWeb3(_web3)

      if (accounts.length === 0) {
          console.log('Metamask disconnesso');
          setConnection(false)
          changeConnectButton(false)
          setConteggio("")
          localStorage.setItem("conteggio","");
          cardList = []
          setCard([])
  
          
        } else {
          setConnection(true)
          changeConnectButton(true)
          console.log(1)
          getMyCountPintHandler(_web3)
          cardList = []
          setCard([])
          loadHandler()
        
        }

      window.ethereum.on('accountsChanged', (accounts) => {
          
          if (accounts.length === 0) {
            console.log('Metamask disconnesso');
            setConnection(false)
            changeConnectButton(false)
            setConteggio("")
            localStorage.setItem("conteggio", "");
            cardList = []
            setCard([])
  
            
          } else {
            setConnection(true)
            changeConnectButton(true)
            getMyCountPintHandler(_web3)
            cardList = []
            setCard([])
            loadHandler()
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
      <> 
            <Head>
                <title>Explore</title>
                <meta name="description" content="home" />
                <link rel="icon" href="miniCiccio.png" />
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></link> 
            </Head>
            
           
      <main class="vh-100 bg bg-dark">  

        <nav id="mynavbar" class="navbar navbar-expand-lg navbar-dark bg-dark shadow p-3 mb-5 fixed-top">
        <div class="container-fluid">
        <img width="30px" height="auto" src="https://cdn-icons-png.flaticon.com/512/8757/8757988.png"></img>
          <a class="navbar-brand " href="/">PatentLink</a>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="nav nav-pills navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" href="/">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/tokens">Tokens</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/patentGalleryHome">Explore</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/patentDeploy">Deploy</a>
              </li>
              <li>
              <a id = "connectbutton" type="button" class="btn btn-secondary rounded-pill" 
                onClick={connectWalletHandler}
               >connect wallet
                </a>
              </li>
              <li class="nav-item">
                <button class="nav-link fw-bolder white"  href="/patentDeploy"> {conteggioPint}</button>
              </li>
              <li class="nav-item mt-1">
                <img width="30px" style={isConnectedToMetamask==false ? {opacity:0} : {opacity:1}} src="https://altcoinsbox.com/wp-content/uploads/2023/03/matic-logo.webp"></img>
              </li>
            </ul>
          </div>
        </div>
      </nav> 
    
      <section>
        <div class="container-fluid mt-5">
        <div class="row gx-2">
            <div class="my-5 text-xl-start">
                <h1 class="display-5 fw-bolder text-purple mb-2 shadow p-4" style={{"color": "#6f42c1"}}>Explore patents</h1>
                <PatentGalleryFormat data={cardData} />
            </div>
        </div>
        </div>
     </section> 
            
        
      
      </main>
      </>
        
    )
}

export default patentGallery