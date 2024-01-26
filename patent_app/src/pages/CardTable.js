// CardTable.js
import React from 'react';
import { Grid,Button, dividerClasses } from '@mui/material';
import {CardActionArea, CardActions} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import Swal from 'sweetalert2';
import Web3 from 'web3'
var prova = ""
import Head from 'next/head'

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
      window.location.reload()
      
      
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
    backgroundColor: '#373e41' ,// Colore di sfondo
    borderRadius: '12px', // Angoli arrotondati
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Ombra leggera
  };


  return (
    <div class="container-fluid mt-4">
    <Grid container spacing={2}>
    {
     
    data.map((item, index) => (
      <Grid  style={{ display: isVisiblePatents ? 'block' : 'none' }}  key={index} item xs={12} sm={100} md={4} lg={3} xl={2}>
          <Card sx={{ maxWidth: 345 }} style={cardStyle}>
      <CardActionArea color="text.secondary" onClick={() => buttonHandlerCard(item.link)}>
        <CardMedia
          component="img"
          height="140"
          image="https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5 fw-bold" component="div" color="">
          {item.title}
          </Typography>
          <Typography gutterBottom variant="body2" component="div" color="">
          <h6>Data di caricamento del brevetto: </h6>
          {item.timestamp + ""}
          </Typography>
          <Typography gutterBottom variant="body2" component="div" color="">
          <h6>Data di scadenza del brevetto: </h6>
          {item.deadline + ""}
          </Typography>
         
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button onClick={() => buttonHandlerBids(item.sender, item.id)} className='btn-sm btn-secondary rounded-pill' size="small" style={{ backgroundColor : "#6f42c1"}}>
          BIDS
        </Button>
      </CardActions>
    </Card>
    </Grid>

    ))}
    {   
      <div>
       <Button className = "btn-sm btn-secondary rounded-pill" style={{ display: isVisibleBids ? 'block' : 'none'  , backgroundColor : "#6f42c1", opacity:0.5} } variant="secondary" onClick={handleGoBack}>
       ⬅ back
       </Button>
       </div>
    }
    {
  
    dataBids.map((item, index) => (
      <Grid  style={{ display: isVisibleBids ? 'block' : 'none' }} key={index} item xs={12} sm={6} md={4} lg={3} xl={3}>
       
        <Card sx={{ width: 355 }} style={cardStyle}>
         
          <Button className = "btn-sm btn-secondary rounded-pill" style={{ display: Number(item.state == 2) ? 'block' : 'none' , backgroundColor : "#4d2e87"}} variant="contained" onClick={() => rejectBidHandler ( item.id, index, item.sender)}>
            X
          </Button>
          <CardContent style={{ opacity: item.state == 2 ? '1' : '0.2'}}>
            <Typography variant="h9"> Offerta N.{index + 1}</Typography>
            <Typography variant="h6"> id NFT : {Number(item.id)}</Typography>
            <Typography variant="h6"> Amount : {Number(item.amount)*Math.pow(10,-18)} PNT </Typography>
            <Typography variant="body2">Bidder : {item.bidder}</Typography>
          </CardContent>
          <div style={{display: "flex", gap: "160px" }}>
          <Button  className = "btn-sm btn-secondary rounded-pill ml-2" style={{ display: Number(item.state == 2) ? 'block' : 'none', backgroundColor : "#6f42c1"}} variant="contained" onClick={() => acceptBidHandler(item.id, index, item.sender)}>
            Accept
          </Button>
          {/* <Button className = "btn-sm btn-secondary rounded-pill" style={{ display: Number(item.state == 2) ? 'block' : 'none' , backgroundColor : "#4d2e87"}} variant="contained" onClick={() => rejectBidHandler ( item.id, index, item.sender)}>
            Reject
          </Button> */} 
          <span style={{ display: item.state == 1 ? 'block' : 'none' , color : '#D9027D'}}>ACCEPTED</span> 
          {/* <span style={{ display: item.state == 0 ? 'block' : 'none'}}>REJECTED</span>    */}
          </div>
        </Card>
      </Grid>
    ))}
    
  </Grid>
  </div>
  )
};

export default CardTable;



