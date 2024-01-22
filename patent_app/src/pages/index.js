import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
const inter = Inter({ subsets: ['latin'] })
import Swal from 'sweetalert2';
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import Web3 from 'web3'
import { useState, useEffect } from 'react'


const Home = () =>  {
    const [error, setError] = useState('')
    const [totale, setTotale] = useState(0)
    const [conteggioPint, setConteggio] = useState('')
    const [buyCount, setBuyCount] = useState(0)
    const [etherCount, setEtherCount] = useState('')
    const [web3, setWeb3] = useState(null);
    const [etherSellCount, setSellEtherCount] = useState('')
    const [sellCount, setsellCount] = useState(0)
    const [isBottoneBuyAbilitato, setIsBottoneBuyAbilitato] = useState(false);
    const [isBottoneSellAbilitato, setIsBottoneSellAbilitato] = useState(false);


    useEffect(() => {

        getTotaleHandler()


    })

    const getMyCountPintHandler = async (web3) => {
        console.log(web3)
        const accounts = await web3.eth.getAccounts()
        console.log(accounts)
        console.log(accounts[0])
        var count = await patentTokenContract.methods.balanceOf(accounts[0]).call()
        count = Number(count)
        count = count / Math.pow(10, 18).toFixed(0)
        console.log(count)
        setConteggio("this is your amount of pint : " + count)
    }

    const updatePintQty = event => {
        //function needed to  the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
        setBuyCount((event.target.value * Math.pow(10, 12)).toFixed(0))
        setEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 12)).toFixed(0))


    }
    const updatePintQtySell = event => {
        //function needed to save the amount of tokens written on the input form by the user (this value will be usefull in the buyPintHandler)
        setsellCount((event.target.value * Math.pow(10, 12)).toFixed(0))
        setSellEtherCount(event.target.value)
        console.log((event.target.value * Math.pow(10, 12)).toFixed(0))

    }
    const sellPintHandler = async () => {
        console.log(web3)
        //web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
      

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
                                getMyCountPintHandler(web3)
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
        console.log(web3)
        //web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
        console.log(buyCount)
        console.log(etherCount)

        try {

            console.log(accounts[0])
            const transactionObject = {
                from: accounts[0],
                to: patentTokenContract.options.address, //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
                gas: '300000',  // Gas limit
                value: web3.utils.toWei(etherCount, "ether"),
                data: patentTokenContract.methods.buyToken(Number(buyCount)).encodeABI(), // Includi il metodo e i suoi parametri
            };
            web3.eth.sendTransaction(transactionObject)
                .then(function (receipt) {
                    // Gestione del successo
                    Swal.fire({
                        icon: 'success',
                        title: 'Operazione completata!',
                        text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                    getMyCountPintHandler(web3)

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
    const connectWalletHandler = async () => {

        try {
            if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
                var _web3 = new Web3(window.ethereum)
                document.getElementById("connectbutton").disabled=true
                document.getElementById("connectbutton").textContent=accounts[0]
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
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></link>
        </Head>
  
  
        <main class="bg-dark">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
          <a class="navbar-brand " href="#">PatentLink</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#home">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#tokens">Tokens</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#explore">Explore</a>
              </li>
              <li>
              <button id = "connectbutton" type="button" class="btn btn-secondary"
                onClick={connectWalletHandler}
               >connect wallet
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      
            
      <div data-spy="scroll" data-target="#navbar-example2" data-offset="0">
          <h4 id="home"><header class="py-5 bg-dark" id="header">
          <div class="container px-5">
            <div class="row gx-5 align-items-center justify-content-center">
              <div class="col-lg-8 col-xl-7 col-xxl-6">
                  <div class="my-5 text-center text-xl-start">
                    <h1 class="display-5 fw-bolder text-white mb-2">A Bloackchain platform buying and selling your Patents</h1>
                    <p class="lead fw-normal text-white-50 mb-4">Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit!</p>
                    <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                        <a class="btn btn-secondary btn-lg px-4 me-sm-3" href="#features">Get Started</a>
                    
                    </div>
                  </div>
                </div>
                <div class="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
                <img class="img-fluid rounded-3 my-5" src="https://cdn-icons-png.flaticon.com/512/8757/8757988.png" alt="...">
                  </img>
                </div>
              </div>
            </div>
        </header>
      </h4>
        
  
  
      <h4 id="tokens">   
        <div class="container">
          <div class="row gx-5 align-items-center justify-content-center">
            <div class="col-lg-8 col-xl-7 col-xxl-6">
                <div class="my-5 text-center text-xl-start">
                  <h1 class="display-5 fw-bolder text-white mb-2">What is a PNT token?</h1>
                  <p class="lead fw-normal text-white-50 mb-4">ADD DESCRIPTION Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit!</p>
                  <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                    
                  
                    <button type="button" class="btn btn-secondary btn-lg px-4 me-sm-3" data-toggle="modal" data-target="#exampleModal">
                      Buy or sell
                    </button>
  
                    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
              <img class="img-fluid rounded-3 my-5" src="https://altcoinsbox.com/wp-content/uploads/2023/03/matic-logo.webp" alt="...">
              </img>
              </div>
            </div>
          </div>
        </h4>
        
  
        <h4 id="explore">
        <header class="py-5 bg-dark" id="header">
        <div class="container px-5">
          <div class="row gx-5 align-items-center justify-content-center">
            <div class="col-lg-8 col-xl-7 col-xxl-6">
                <div class="my-5 text-center text-xl-start">
                  <h1 class="display-5 fw-bolder text-white mb-2">A Bloackchain platform buying and selling your Patents</h1>
                  <p class="lead fw-normal text-white-50 mb-4">Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit!</p>
                  <div class="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-xl-start">
                      <a class="btn btn-secondary btn-lg px-4 me-sm-3" href="#features">Get Started</a>
                  
                  </div>
                </div>
              </div>
              <div class="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
              <img class="img-fluid rounded-3 my-5" src="https://cdn-icons-png.flaticon.com/512/8757/8757988.png" alt="...">
                </img>
              </div>
            </div>
          </div>
        </header>
  
        </h4>
        
        </div>
  
      
  
  
      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
      </main>
      </>
    )
}

export default Home




