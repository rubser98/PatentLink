import Head from 'next/head'
import 'bulma/css/bulma.css'
import { useState, useEffect,useRef } from 'react'
import Web3 from 'web3'
import Swal from 'sweetalert2';



import styles from '../styles/homeSale.module.css'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'

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
  const metamaskConnetcionHandler = async() => {

    var _web3 = new Web3(window.ethereum)
    const accounts = await _web3.eth.getAccounts() 

    if (accounts.length === 0) {
        console.log('Metamask disconnesso');
        setConnection(false)
        setConteggio("")

        
      } else {
        setConnection(true)
        getMyCountPintHandler(_web3)
      
      }

    window.ethereum.on('accountsChanged', (accounts) => {
        
        if (accounts.length === 0) {
          console.log('Metamask disconnesso');
          setConnection(false)
          setConteggio("")

          
        } else {
          setConnection(true)
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
      setConteggio("this is your amount of pint : " + count)
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
                      <form action="/myWallet">
                       <button className='button is-primary'> myWallet</button>
                      </form>
           </div>
          <div  className='navbar-item'>
                      <form action="/patentGalleryHome">
                       <button className='button is-primary'> patentGallery</button>
                      </form>
          </div>
          <div className='navbar-end'>
            <button onClick={connectWalletHandler} 
                    className='button is-primary'
                    disabled={isConnectedToMetamask }>
                    Connect Wallet</button>
          </div>
        </div>
      </nav>
      <section>
                <div className='container'>
                    <p> {conteggioPint}</p>
                </div>
      </section>

      <section>
        <div className='container'>
          <h2>Filing fee: {totale} PTNT </h2>
        </div>
      </section>
      <section>
        <div className='container'>
          <h2>Token List</h2>
          <ul>
            {patentList.map((patent, index) => (
              <li key={index}>{patent}</li>
            ))}
          </ul>
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
                disabled={(!patentName || !pdfFile) || !isConnectedToMetamask }
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

export default patentDeploy