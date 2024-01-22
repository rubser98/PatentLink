// CardTable.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button, dividerClasses } from '@mui/material';
import { useState, useEffect } from 'react'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import Swal from 'sweetalert2';
import Web3 from 'web3'
var prova = ""

const CardTable = ({ data }) => {

 
  const [isVisiblePatents, setIsVisiblePatents] = useState(true);
  const [isVisibleBids, setIsVisibleBids] = useState(false);
  const [dataBids, setBids] = useState( [])


  const acceptBidHandler = async(id, index, sender) => {
    var _web3 = new Web3(window.ethereum)
    const transactionObject = {
      from: sender,
      to: patentNFTContract.options.address, //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
      gas: '300000',  // Gas limit
      data: patentNFTContract.methods.acceptBid(BigInt(id),BigInt(index)).encodeABI(), // Includi il metodo e i suoi parametri
     }
   
   
    _web3.eth.sendTransaction(transactionObject)
    .then(receipt => {
    
      Swal.fire({
        icon: 'success',
        title: 'Operazione completata!',
        text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then(result => {
      
      window.location.reload()
    })
    handleGoBack()
      
    })
    .catch(error => {
      
      Swal.fire({
        icon: 'error',
        title: 'Operazione andata in errore!',
        text: 'Errore durante l\'invio della transazione: ' + (error.data === undefined ? error : error.data.message) + "",
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    })
   
      
    });


  }
  const rejectBidHandler = async(id, index, sender) => {
    console.log(id, index, sender)
    await patentNFTContract.methods.rejectBid(BigInt(id),BigInt(index)).send( {from: sender,gas: '300000'})
    .then(receipt => {
      var appoggio = dataBids
      appoggio[index].state = 0
      setBids(appoggio)
      console.log(appoggio)
      console.log(dataBids)
      Swal.fire({
        icon: 'success',
        title: "hai rifiutato l'operazione!",
        text: 'Transazione confermata. Hash della transazione: ' + receipt.transactionHash,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then(result => {
      
      
    })
      
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: "errore!",
        text: "qualcosa è andato storto durante l'operazione" ,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    })
    });

  }


  const buttonHandlerCard = (link) => {
    window.open(link)
  }

 

 
  const handleGoBack = () =>  {
    setIsVisibleBids(false)
    setIsVisiblePatents(true)
    
    

  }

  const test = "oooooooooo"
  const buttonHandlerBids = async (sender, id) =>{
    console.log('id ',id, 'sender ', sender)
    try {
      
      var owner = await patentNFTContract.methods.ownerOf(id).call()
      console.log('owner:',owner)
      var bid = await patentNFTContract.methods.getBids(BigInt(id), {from: sender}).call()
      for (let i = 0; i < bid.length; i++) {
        console.log(bid[i])
        bid[i]["id"] = Number(id)
        bid[i]["sender"] = sender
        console.log(bid[i])
      }
      console.log('bids:', bid[0])
      setBids(bid)
      setIsVisiblePatents(false)
      setIsVisibleBids(true)
      


  } catch (error) {
      console.error('Error fetching bids:', error.message)
  }

  }
   
  
 
    const cardStyle = {
        backgroundColor: '#98fb98', // Colore di sfondo
        borderRadius: '12px', // Angoli arrotondati
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombra leggera
        transition: 'transform 0.3s ease-in-out', // Effetto di transizione al passaggio del mouse
        '&:hover': {
          transform: 'scale(1.05)', // Ingrandimento al passaggio del mouse
        },
      };


  return (
    
    <Grid container spacing={2}>
    {
     
    data.map((item, index) => (
      <Grid  style={{ display: isVisiblePatents ? 'block' : 'none' }}  key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
       
        <Card style={cardStyle}>
          <CardContent>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body2">{item.description}</Typography>
          </CardContent>
          <Button variant="contained" color="primary"onClick={() => buttonHandlerCard(item.link)}>
            Vai al link
          </Button>
          <Button variant="contained" color="primary"onClick={() => buttonHandlerBids(item.sender, item.id)}>
            Vedi offerte
          </Button>
        </Card>
      </Grid>

    ))}
    {
       <Button style={{ display: isVisibleBids ? 'block' : 'none' }} variant="secondary" onClick={handleGoBack}>
         Torna indietro
       </Button>
    }
    {
  
    dataBids.map((item, index) => (
      <Grid  style={{ display: isVisibleBids ? 'block' : 'none' }} key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
       
        <Card style={cardStyle}>
          <CardContent>
            <Typography variant="h6"> Offerta N.{index + 1}</Typography>
            <Typography variant="h6"> id NFT : {Number(item.id)}</Typography>
            <Typography variant="h6"> Amount : {Number(item.amount)*Math.pow(10,-18)} PNT </Typography>
            <Typography variant="body2">Bidder : {item.bidder}</Typography>
          </CardContent>
          <div style={{display: "flex",gap: "160px" }}>
          <Button  style={{ display: Number(item.state == 2) ? 'block' : 'none' }}variant="contained" color="primary"onClick={() => acceptBidHandler(item.id, index, item.sender)}>
            Accept
          </Button>
          <Button style={{ display: Number(item.state == 2) ? 'block' : 'none' }} variant="contained" color="primary"onClick={() => rejectBidHandler ( item.id, index, item.sender)}>
            Reject
          </Button>
          <span style={{ display: item.state == 0 ? 'block' : 'none' , color : 'red'}}>REJECTED</span> 
          <span style={{ display: item.state == 1 ? 'block' : 'none' , color : 'green'}}>ACCEPTED</span> 

          </div>
          
        </Card>
      </Grid>

    ))}
    
  </Grid>
  )
};

export default CardTable;



