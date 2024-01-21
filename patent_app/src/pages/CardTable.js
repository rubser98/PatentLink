// CardTable.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button, dividerClasses } from '@mui/material';
import { useState, useEffect } from 'react'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import Swal from 'sweetalert2';
var prova = ""
const CardTable = ({ data }) => {


  const [isVisiblePatents, setIsVisiblePatents] = useState(true);
  const [isVisibleBids, setIsVisibleBids] = useState(false);
  const [dataBids, setBids] = useState( [])


  const acceptBidHandler = async(id, index, sender) => {
    console.log(id, index, sender)
    await patentNFTContract.methods.acceptBid(BigInt(id),BigInt(index)).send( {from: sender,gas: '300000'})
    .then(receipt => {
      // La transazione è stata inviata con successo
      console.log('Transazione avvenuta con successo:', receipt);
      // Puoi eseguire altre azioni qui con la risposta della transazione
    })
    .catch(error => {
      // Si è verificato un errore durante l'invio della transazione
      console.error('Errore durante l\'invio della transazione:', error);
      // Puoi gestire l'errore qui o eseguire azioni specifiche in base al tipo di errore
    });


  }
  const rejectBidHandler = async(id, index, sender) => {
    console.log(id, index, sender)
    await patentNFTContract.methods.rejectBid(BigInt(id),BigInt(index)).send( {from: sender,gas: '300000'})
    .then(receipt => {
      // La transazione è stata inviata con successo
      console.log('Transazione avvenuta con successo:', receipt);
      // Puoi eseguire altre azioni qui con la risposta della transazione
    })
    .catch(error => {
      // Si è verificato un errore durante l'invio della transazione
      console.error('Errore durante l\'invio della transazione:', error);
      // Puoi gestire l'errore qui o eseguire azioni specifiche in base al tipo di errore
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
            <Typography variant="h6"> State : {Number(item.state)}</Typography>
            <Typography variant="body2">Bidder : {item.bidder}</Typography>
          </CardContent>
          <div style={{display: "flex",gap: "160px" }}>
          <Button variant="contained" color="primary"onClick={() => acceptBidHandler(item.id, index, item.sender)}>
            Accept
          </Button>
          <Button variant="contained" color="primary"onClick={() => rejectBidHandler ( item.id, index, item.sender)}>
            Reject
          </Button>

          </div>
          
        </Card>
      </Grid>

    ))}
    
  </Grid>
  )
};

export default CardTable;



