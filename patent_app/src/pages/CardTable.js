// CardTable.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react'
import {patentTokenContract, patentNFTContract} from '../../blockchain/contract_pinning'

const CardTable = ({ data }) => {
  const buttonHandlerCard = (link) => {
    console.log(link)
    window.open(link)
  }

  const buttonHandlerBids = async (sender, id) =>{
    console.log('id ',id, 'sender ', sender)
    try {
      var owner = await patentNFTContract.methods.ownerOf(id).call()
      console.log('owner:',owner)
      var bid = await patentNFTContract.methods.getBids(BigInt(id), {from: sender}).call()
      console.log('bids:', bid[0])
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
    {data.map((item, index) => (
      <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
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
  </Grid>)
};

export default CardTable;



