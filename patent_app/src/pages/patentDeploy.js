import Head from 'next/head'
import { useState, useEffect,useRef } from 'react'
import Web3 from 'web3'
import Swal from 'sweetalert2';
import styles from '../styles/homeSale.module.css'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import styled from "styled-components";

const axios = require('axios')
const FormData = require('form-data')

const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZTVkNzJmYS1mYjQ4LTQzNTEtODg0Zi04MzM4ZWYxN2NjZTUiLCJlbWFpbCI6InJ1YnNlcjE3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlY2QzMzRiNWE5NmVkNzAyNmJlYyIsInNjb3BlZEtleVNlY3JldCI6IjI2OTYwYzVkYzBjOGMzM2IwZWRiOTViZjJlZWNjNDk4NGU0ZDNjNTg2NDI3NzAwMDU2ZWJmYTc4MGQxZTU5NTciLCJpYXQiOjE3MDU2MTQ3MDd9.foWHUEjEDthFx-rZyff6Rb7hPiLkfARkHtS4NKblKo4'


const patentDeploy = () =>  {
 
    
    const [error, setError] = useState('')
    const [totale,setTotale] = useState(0)
    const [conteggioPint,setConteggio] = useState('')
    const [web3, setWeb3] = useState(null)
    const [patentName, setPatentName] = useState(null)
    const [pdfFile, setPdfFile] = useState(null)
    const [patentList, setPatentList] = useState([])
    const [isConnectedToMetamask , setConnection] = useState(false)
    const loaded  = useRef(false);
  

   
    useEffect(() => {

      if (!loaded.current) {
          loaded.current = true
         
        
          getTotaleHandler()
          metamaskConnetcionHandler()
        }
  
  },[])


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

        
      } else {
        setConnection(true)
        changeConnectButton(true)
        getMyCountPintHandler(_web3)
      
      }

    window.ethereum.on('accountsChanged', (accounts) => {
        
        if (accounts.length === 0) {
          console.log('Metamask disconnesso');
          setConnection(false)
          changeConnectButton(false)
          setConteggio("")

          
        } else {
          setConnection(true)
          changeConnectButton(true)
          getMyCountPintHandler(_web3)
        
        }
    })

}


    const filePatentHandler = async () => {
        var _web3 = new Web3(window.ethereum)
        const accounts = await _web3.eth.getAccounts();
        
        
          try {
            const hash = await pinFileToIPFS()
            const transactionObject = {
              from: accounts[0],
              to: patentNFTContract.options.address, //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
              gas: '300000',  // Gas limit
              data: patentNFTContract.methods.filePatent(hash, patentName).encodeABI(), // Includi il metodo e i suoi parametri
          };
          _web3.eth.sendTransaction(transactionObject)
                .then(function (receipt) {
                    console.log(receipt)
                    // Gestione del successo
                    Swal.fire({
                        icon: 'success',
                        title: 'Operazione completata!',
                        text: 'Transazione confermata. hash della transazione: ' + receipt.transactionHash,
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
                        text: 'Errore durante l\'invio della transazione: ' + error,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                    })
                });
            /*
            await patentNFTContract.methods.filePatent(hash, patentName).send({
                from : accounts[0],
                //value : web3.utils.toWei(etherCount, "ether"),
                gas: 300000,
               // gasPrice: "30000000",
    
            });
            */
    
            console.log("Brevetto depositato con successo!");
            getMyCountPatentHandler(_web3)
            // Aggiorna lo stato o esegui altre azioni necessarie dopo il deposito del brevetto
          } catch (err) {
            console.error("Errore durante il deposito del brevetto:", err.message);
            setError(err + "");
          }
       
      }

      const getPatentHandler = async () => {
      
          try {
            for(let i=0; i < patentList.length; i++){
            const patent = await patentNFTContract.methods.getPatent(patentList[i]).call()
            console.log(patent)
            console.log(`PatentID: ${i}: ${patent.name}`)
            const patentURI = await patentNFTContract.methods.tokenURI(i).call()
            console.log(`PatentID: ${i}: ${patentURI}`)
            const patentPDF = await fetchFileFromIPFS(patentURI)
            console.log(patentPDF)
          }
    
            // Aggiorna lo stato o esegui altre azioni necessarie dopo il deposito del brevetto
          } catch (err) {
            console.error("Errore durante il deposito del brevetto:", err.message);
            setError(err + "");
          }
        }
      



    const pinFileToIPFS = async () => {
        const formData = new FormData();
        
        
        
        formData.append('file', pdfFile)
        
        const pinataMetadata = JSON.stringify({
        name: 'File name',
        });
        formData.append('pinataMetadata', pinataMetadata);
        
        const pinataOptions = JSON.stringify({
        cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions);

        try{
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT
            }
        
        })
        console.log('hash:',res.data.IpfsHash,':hash')
        return res.data.IpfsHash
        } catch (error) {
        console.log(error);
        throw error
        }
    }

    const fetchFileFromIPFS = async (ipfsHash) => {
      try {
        const response = await fetch(`https://plum-key-aardwolf-103.mypinata.cloud/ipfs/${ipfsHash}`);
        
        if (!response.ok) {
          throw new Error(`Errore durante il recupero del file da IPFS: ${response.status} - ${response.statusText}`);
        }
    
        // Assume che il file sia un blob e restituisci il blob
        const blob = await response.blob();
        return blob;
      } catch (error) {
        console.error("Errore durante il fetch del file da IPFS:", error.message);
        throw error; // Rilancia l'errore per gestirlo nella funzione chiamante
      }
    };

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
    
    const getMyCountPatentHandler = async (web3) => {
        const accounts = await web3.eth.getAccounts() 
        console.log(accounts)
        console.log(accounts[0])
        var patents = await patentNFTContract.methods.getPatentsByOwner(accounts[0]).call()
        setPatentList(patents)
        console.log(patentList)
        await getPatentHandler()
        await getMyCountPintHandler(web3)
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

    const connectWalletHandler = async() => {

        try{
        
           if (typeof window !== "undefined" && typeof window.ethereum !== "undefined")
             {
                
                await window.ethereum.request({method: "eth_requestAccounts"})
                var _web3 = new Web3(window.ethereum)
                setWeb3(_web3)
                console.log(web3)
                getMyCountPatentHandler(_web3)
 
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
      <>

      <Head>
        <title>Deploy</title>
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

      <div class = "container-fluid mt-5">

      <h4 id="explore">
        <header class="bg-dark" id="header">
        <div class="container-fluid mt-5">
          <div class="row gx-2">
              <div class="my-5 text-xl-start">
                <h1 class="display-5 fw-bolder text-purple mb-2 shadow p-4 " style={{"color": "#6f42c1"}}>Deploy your contract</h1>
              </div>
            </div>
          </div>
        </header>
      </h4>

      <section>
          <div className='container'>
          <h4 class = "fw-bold shadow p-4" style = {{ color: "#f400a1"}}>Current Filing fee: {totale} PNT </h4>
          </div>
      </section>
      </div>

      <section className='mt-5'>
        <div className='container'>
          <div className='field'>
            <h6 className='label .text-white'>File your patent:</h6>
            <div className='control'>
              <input
                onChange={(e) => setPatentName(e.target.value)}
                className='input form-control mb-2'
                type='text'
                placeholder='Enter patent name...'
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              </div>
              <button
                style = {{backgroundColor : "#6f42c1"}}
                onClick={filePatentHandler}
                className='btn btn-secondary mt-3 rounded-pill'
                disabled={(!patentName || !pdfFile) || !isConnectedToMetamask }
              >
                Submit
              </button>
          </div>
        </div>
      </section>

      <section>
        <div className='container has-text-danger'>
          <p>{error}</p>
        </div>
      </section>
    
    </main>
    </>
  )
    
}

export default patentDeploy