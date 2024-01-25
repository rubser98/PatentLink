import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
const inter = Inter({ subsets: ['latin'] })
import Swal from 'sweetalert2';
import { useState, useEffect,useRef } from 'react'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import Web3 from 'web3'
import { purple } from '@mui/material/colors'
import styled from "styled-components";
import { ST } from 'next/dist/shared/lib/utils'



const Home = () =>  {
  const [conteggioPint,setConteggio] = useState('')
  const loaded  = useRef(false)
  const [error, setError] = useState('')
  const [totale, setTotale] = useState(0)
  const [web3, setWeb3] = useState(null)
  const [patentName, setPatentName] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [patentList, setPatentList] = useState([])
  const [buyCount, setBuyCount] = useState(0)
  const [etherCount, setEtherCount] = useState('')
  const [etherSellCount, setSellEtherCount] = useState('')
  const [sellCount, setsellCount] = useState(0)
  const [isBottoneBuyAbilitato, setIsBottoneBuyAbilitato] = useState(false);
  const [isBottoneSellAbilitato, setIsBottoneSellAbilitato] = useState(false);
  const [isConnectedToMetamask , setConnection] = useState(false)



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

  const metamaskConnetcionHandler = async() => {

    var _web3 = new Web3(window.ethereum)
    const accounts = await _web3.eth.getAccounts() 

    if (accounts.length === 0) {
        console.log('Metamask disconnesso');
        setConnection(false)
        changeConnectButton(false)
        setConteggio("")
        localStorage.setItem("conteggio","");


      } else {
        setConnection(true)
        changeConnectButton(true)
        console.log(1)
        getMyCountPintHandler(_web3)

      }

    window.ethereum.on('accountsChanged', (accounts) => {

        if (accounts.length === 0) {
          console.log('Metamask disconnesso');
          setConnection(false)
          changeConnectButton(false)
          setConteggio("")
          localStorage.setItem("conteggio","");


        } else {
          setConnection(true)
          changeConnectButton(true)
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

  const updatePintQty = event => {
    
      //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
      setBuyCount((event.target.value * Math.pow(10, 18)).toFixed(0))
      //inserimento del costo in ETH
      setEtherCount(event.target.value)
      console.log((event.target.value * Math.pow(10, 18)).toFixed(0))
      


  }
  const updatePintQtySell = event => {
      //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
      setsellCount((event.target.value * Math.pow(10, 18)).toFixed(0))
      setSellEtherCount(event.target.value)
      console.log((event.target.value * Math.pow(10, 18)).toFixed(0))

  }
  const sellPintHandler = async () => {
      var _web3 = new Web3(window.ethereum)
      console.log(_web3)
      //web3 = new Web3(window.ethereum)
      const accounts = await _web3.eth.getAccounts()
    

      console.log(etherSellCount)
      console.log(sellCount)
      Swal.fire({
          title: 'Vuoi procedere?',
          text: 'Stai per vendere ' + etherSellCount + ' PNT al prezzo di ' + etherSellCount + ' ETH!',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sì, procedi!'
      })
          .then(async (result) => {
              if (result.isConfirmed) {
                  // Azione quando l'utente clicca su "Sì, procedi!"
                  try {

                      console.log(accounts[0])


                      await patentTokenContract.methods.sellToken(sellCount).send({ from: accounts[0] })
                          .then(function (receipt) {
                              // Gestione del successo
                              Swal.fire({
                                  icon: 'success',
                                  title: 'Operazione completata!',
                                  text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
                                  confirmButtonColor: '#3085d6',
                                  confirmButtonText: 'OK'
                              })
                              getMyCountPintHandler(_web3)
                          })
                          .catch(function (error) {
                              // Gestione dell'errore
                              console.log(error)
                              Swal.fire({
                                  icon: 'error',
                                  title: 'Operazione andata in errore!',
                                  text: 'Errore durante l\'invio della transazione: ' + (error.data === undefined ? error : error.data.message) + "\n: insert a lower number of token",
                                  confirmButtonColor: '#3085d6',
                                  confirmButtonText: 'OK'
                              })
                          });

                  }
                  catch (err) {
                      console.log(err)
                      setError(err + "")
                  }

              } else if (result.dismiss === Swal.DismissReason.cancel) {
                  // Azione quando l'utente clicca su "Annulla"
                  Swal.fire('Annullato', 'La tua azione è stata annullata.', 'info');
              }
          });



  }


  const buyPintHandler = async () => {
     
      //web3 = new Web3(window.ethereum)
      var _web3 = new Web3(window.ethereum)
      const accounts = await _web3.eth.getAccounts()
      console.log(buyCount)
      console.log(etherCount)

      try {

          console.log(accounts[0])
          const transactionObject = {
              from: accounts[0],
              to: patentTokenContract.options.address, //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
              gas: '300000',  // Gas limit
              value: _web3.utils.toWei(etherCount, "ether"),
              data: patentTokenContract.methods.buyToken(Number(buyCount)).encodeABI(), // Includi il metodo e i suoi parametri
          };
          _web3.eth.sendTransaction(transactionObject)
              .then(function (receipt) {
                  // Gestione del successo
                  Swal.fire({
                      icon: 'success',
                      title: 'Operazione completata!',
                      text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'OK'
                  })
                  getMyCountPintHandler(_web3)

              })
              .catch(function (error) {
                  // Gestione dell'errore
                  console.log(error)
                  Swal.fire({
                      icon: 'error',
                      title: 'Operazione andata in errore!',
                      text: 'Errore durante l\'invio della transazione: ' + error.data.message,
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'OK'
                  })
              });



      }
      catch (err) {
          console.log(err)
          setError(err + "")
      }


  }

  const getTotaleHandler = async () => {
      try {

          const totale2 = await patentTokenContract.methods.totalSupply().call()

          setTotale((Number(totale2) / Math.pow(10, 18)).toFixed(0))

      }
      catch (e) {
          console.log(e)
      }

  }

  const StyledHeading = styled.h1`
  font-weight: bold;
  font-size: 60px;
  background: linear-gradient(176deg, #6f42c1, #32e1ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  text-shadow: none;
`;

const StyledHeading2 = styled.h1`
font-weight: bold;
font-size: 45px;
background: linear-gradient(176deg, #6f42c1, #ee438e);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
-webkit-box-decoration-break: clone;
box-decoration-break: clone;
text-shadow: none;
`;


  const connectWalletHandler = async () => {

      try {
          if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
              await window.ethereum.request({ method: "eth_requestAccounts" })
              var _web3 = new Web3(window.ethereum)
              setConnection(true)
              setWeb3(_web3)
              getMyCountPintHandler(_web3)
              setIsBottoneBuyAbilitato(true)
              setIsBottoneSellAbilitato(true)
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
    return ( 
        <>
        <Head>
          <title>♥BlockchainProject♥</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="miniCiccio.png" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></link>
        </Head>
  
  
        <main class="bg-dark">
        <nav id="mynavbar" class="navbar navbar-expand-lg navbar-dark bg-dark shadow p-3 mb-5 fixed-top">
        <div class="container-fluid">
        <img width="30px" height="auto" src="https://cdn-icons-png.flaticon.com/512/8757/8757988.png"></img>
          <a class="navbar-brand " href="#Home">PatentLink</a>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="nav nav-pills navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" href="#home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#tokens">Tokens</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#explore">Explore</a>
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
  
      
            
      <div data-spy="scroll" data-target="#navbar-example2" data-offset="0">
          <h4 id="home"><header class="py-5" id="header">
          <div class="container px-5">
            <div class="row gx-5 align-items-center justify-content-center">
              <div class="col-lg-8 col-xl-7 col-xxl-6">
                  <div class="my-5 text-center text-xl-start">
                    <StyledHeading>A Blockchain platform to buy and sell patents</StyledHeading>
                    <p class="lead fw-normal text-white-50 mb-4">Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit!</p>
                    <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                        <a class="btn btn-secondary btn-lg rounded-pill px-4 me-sm-3" href="/patentDeploy" style = {{backgroundColor : "#6f42c1"}}>Get Started</a>
                    
                    </div>
                  </div>
                </div>
                <div class="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
                <img width="700" height="auto" class="img-fluid rounded-3 my-5" src="logoHome3.png" alt="...">
                  </img>
                </div>
              </div>
            </div>
        </header>
      </h4>
        
  
  
      <h4 id="tokens" class="pt-5">   
        <div class="container">
          <div class="row gx-5 align-items-center justify-content-center">
            <div class="col-lg-8 col-xl-7 col-xxl-6">
                <div class="my-5 text-center text-xl-start">
                   <StyledHeading2> What is a PNT token? </StyledHeading2>
                  <p class="lead fw-normal text-white-50 mb-4"> --Credits to Polygon Technology-- Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit!</p>
                  <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                  
                    <a href="/tokens" style = {{backgroundColor : "#6f42c1"}} type="button" onClick={connectWalletHandler} class="btn btn-secondary btn-lg rounded-pill px-4 me-sm-3">
                      Buy or sell
                    </a>
  
                    <div class="modal fade" id="mymodal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div class="modal-dialog" role="document">
                        <div class="modal-content bg-dark">
                          <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                            <button type="button is-secondary" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                            
                          <section className='mt-5'>
                            <div className='container'>
                                <div className='field'>
                                <label className='label'> BUY PNT</label>
                                <div className='control'>
                                <input onChange={updatePintQty} className='input form-control mb-2' type='type' placeholder='Enter amount...' />
                                <button 
                                    onClick={buyPintHandler}
                                    className='btn btn-secondary'
                                    disabled={!isBottoneSellAbilitato} >
                                    buy</button>
                                    </div>
                                </div>
                            </div>
                            </section>

                            <section className='mt-5'>
                            <div className='container'>
                            <div className='field'>
                            <label className='label'> SELL PNT</label>
                            <div className='control'>
                            <input onChange={updatePintQtySell} className='input form-control mb-2' type='type' placeholder='Enter amount...' />
                            <button
                                onClick={sellPintHandler}
                                disabled={!isBottoneBuyAbilitato}
                                className='btn btn-secondary' >
                                sell</button>


                            </div>
                            </div>
                            </div>
                            </section>




                          </div>
                          <div class="modal-footer">
                          </div>
                        </div>
                      </div>
                    </div>
        
                  </div>
                </div>
              </div>
              
              <div class="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
              <img width="400" height="auto" class="img-fluid rounded-3 my-5" src="token.png" alt="...">
              </img>
              </div>
            </div>
          </div>
        </h4>
        
  
        <h4 id="explore">
        <header class="py-5" id="header">
        <div class="container px-5">
          <div class="row gx-5 align-items-center justify-content-center">
            <div class="col-lg-8 col-xl-7 col-xxl-6">
                <div class="my-5 text-center text-xl-start">
                  <StyledHeading2>..Start to explore!</StyledHeading2>
                  {/* <h1 class="display-5 fw-bolder text-white mb-2">...Start to explore!</h1> */}
                  <p class="lead fw-normal text-white-50 mb-4"> See what new on PatentLink</p>
                  <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                      <a style = {{backgroundColor : "#6f42c1"}} class="btn btn-secondary btn-lg rounded-pill px-4 me-sm-3" href="/patentGalleryHome">More</a>
                  
                  </div>
                </div>
              </div>
              <div class="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
              <img width="700" height="auto" class="img-fluid rounded-3 my-5" src="explore.png" alt="...">
                </img>
              </div>
            </div>
          </div>
        </header>
  
        </h4>
        
        </div>
  
      
  
  
  
      </main>
      </>
    )
}

export default Home




