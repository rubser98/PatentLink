// CardTable.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2';
import Web3 from 'web3'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'

const PatentGalleryFormat = ({ data }) => {
  const buttonHandlerCardLink = (link) => {
    console.log(link)
    window.open(link)
  }
  console.log(data)
  const bidHandler = async(id) => {


      var web3 = new Web3(window.ethereum)
      const accounts = await web3.eth.getAccounts()
      var address = await patentNFTContract.methods.ownerOf(id).call() 
      console.log(address)
      console.log('make bid: ', accounts[0], id)
      //var test = await patentNFTContract.methods.getBids(id).call({from : accounts[0], gas:300000})
      //console.log(test)
      
     /*
      const transactionObject = {
        from: accounts[0],
        to: patentNFTContract.options.address, //sepolia patent NFT : "0x663b027771c4c3e77d2AB35aE7eF44024C5C68B7",
        gas: '300000',  // Gas limit
        data: patentNFTContract.methods.makeBid(,1).encodeABI(), // Includi il metodo e i suoi parametri
    }; */
      Swal.fire({
        title: 'Inserisci una cifra:',
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
            await patentNFTContract.methods.makeBid(id,cifra).send({from : accounts[0], gas:300000}).catch(function (error) {
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
          console.log('Operazione annullata');
        }
        
      });
      
     
      


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
    {data.map((item, index) => (
      <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Card style={cardStyle}>
          <CardContent>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body2">{item.description}</Typography>
            <Button variant="contained" color="primary"onClick={() => buttonHandlerCardLink(item.link)}>
             vai al link 
            </Button>
          </CardContent>
          <Button variant="contained" color="primary"onClick={() => bidHandler(item.id)}>
            make a bid
          </Button>
        </Card>
      </Grid>
    ))}
  </Grid>)
};

export default PatentGalleryFormat;



