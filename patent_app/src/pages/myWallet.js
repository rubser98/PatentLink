
import Head from 'next/head'
import styled from 'styled-components';
import { useState, useEffect,useRef } from 'react'
import Web3 from 'web3'
import styles from '../styles/homeSale.module.css'
import Swal from 'sweetalert2';
import CardTable from './CardTable';
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import  axios from'axios'
import  FormData from 'form-data'
import Home from '.';



const myWallet = () =>  {
    const [conteggioPint,setConteggio] = useState('')
    var cardList = []
    const [cardData, setCard]  = useState([]);
    const pathBasePinata = "https://gateway.pinata.cloud/ipfs/"
    const [error, setError] = useState('')
    const [isConnectedToMetamask , setConnection] = useState(false)
    const [web3, setWeb3] = useState(null);
    const loaded  = useRef(false);

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

    
    const changeConnectButton = async(bool) => {
      
      const connectbutton = document.getElementById("connectbutton")

      if(bool===true){
        connectbutton.textContent = "MyWallet"
        connectbutton.style.backgroundColor = "#6f42c1"
        connectbutton.href = "/myWallet"
      }
      else{
        connectbutton.textContent = "connect wallet"
        connectbutton.style.backgroundColor = "bg-secondary"
      }
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
        changeConnectButton(false)
        setConteggio("")
        localStorage.setItem("conteggio","");

      }
      else
      {
        setConnection(true)
        cardList = []
        setCard([])
        changeConnectButton(true)
        getPatentHandler(_web3)
        getMyCountPintHandler(_web3)


      }

      window.ethereum.on('accountsChanged', (accounts) => {

          if (accounts.length === 0) {
            var _web3 = new Web3(window.ethereum)
            console.log('Metamask disconnesso');
            cardList = []
            setCard([])
            setConnection(false)
            setConteggio("")
            localStorage.setItem("conteggio","");

          } else {
            setConnection(true)
            cardList = []
            setCard([])
            changeConnectButton(true)
            var _web3 = new Web3(window.ethereum)
            getPatentHandler(_web3)
            getMyCountPintHandler(_web3)

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
        <>
        <Head>

                <title>My Wallet</title>
                <meta name="description" content="home" />
                <link rel="icon" href="miniCiccio.png" />
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></link>
        </Head>

        <main class="vh-100 bg bg-dark">
        <div class = "bg-dark">
        
        <nav id="mynavbar" class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow p-3 mb-5 rounded">
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

      <h4 id="explore">
        <header class="bg-dark" id="header">
        <div class="container-fluid mt-5">
          <div class="row gx-2">
              <div class="my-5 text-xl-start">
                <h1 class="display-5 fw-bolder text-purple mb-2 shadow p-4" style={{"color": "#6f42c1"}}>Your Patents</h1>
                <CardTable data={cardData} />
              </div>
            </div>
          </div>
        </header>
      </h4>

      <div class="container d-flex align-items-center justify-content-center">
        <p  style={(cardData.length == 0   ?  {display : 'block'} : {display : 'none'})}> You have no patents :-/ </p>
      </div>
      </div>

{/*          
      <div class = "bg-dark mt-5">
          <h1>Your Cards</h1>
          <CardTable  data={cardData} />
      </div>
      </div> */}
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
      </main>
     </>
    )
}

export default myWallet