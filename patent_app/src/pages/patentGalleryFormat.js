// CardTable.js
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2';
import Web3 from 'web3'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Grid} from '@mui/material';

const PatentGalleryFormat = ({ data }) => {
  const buttonHandlerCardLink = (link) => {
    console.log(link)
    window.open(link)
  }
  console.log(data)
  const bidHandler = async(id) => {


      var web3 = new Web3(window.ethereum)
      console.log(id)
      const accounts = await web3.eth.getAccounts()
      var address = await patentNFTContract.methods.ownerOf(id).call() 
      console.log(address)
      console.log('make bid: ', accounts[0], id)
      
      Swal.fire({
        title: 'Inserisci una cifra in PNT:',
        input: 'number',
        showCancelButton: true,
        confirmButtonText: 'Conferma',
        cancelButtonText: 'Annulla',
      }).then( async(result) => {
        if (result.isConfirmed) {
          const cifraInserita = result.value;
          if (cifraInserita !== undefined) {
            const cifra = Number(cifraInserita)*Math.pow(10,18)
            console.log(`Hai inserito la cifra: ${cifra}`);
            // Puoi fare qualcos'altro con la cifra inserita
            var address = await patentNFTContract.methods.ownerOf(id).call()
            console.log(address)
            await patentNFTContract.methods.makeBid(id,cifra).send({from : accounts[0], gas:300000})
            .then(function (value){

              Swal.fire({
                icon: 'success',
                title: 'Operazione si è conclusa con successo!',
                text: "hai fatto un'offerta dal valore di: " + result.value + " PNT",
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
              })
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
         
          
          
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Operazione annullata!',
            text: "hai annulato l'operazione",
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        })
        }
        
      });
      
     
      


  }

  
 
    const cardStyle = {
        backgroundColor: '#373e41' ,// Colore di sfondo
        borderRadius: '12px', // Angoli arrotondati
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Ombra leggera
      };


  return (
    <Grid container spacing={2}>
    {data.map((item, index) => (
      <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
         <Card sx={{ maxWidth: 345 }} style={cardStyle}>
      <CardActionArea color="text.secondary" onClick={() => buttonHandlerCardLink(item.link)}>
        <CardMedia
          component="img"
          height="140"
          image="https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5 fw-bold" component="div">
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
        <Button onClick={() => bidHandler(item.id)} className='btn-sm btn-secondary rounded-pill' size="small" style={{ backgroundColor : "#6f42c1"}}>
          bid
        </Button>
      </CardActions>
    </Card>
      </Grid>
    ))}
  </Grid>)
};

export default PatentGalleryFormat;



