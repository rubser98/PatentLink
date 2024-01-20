// CardTable.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react'

const CardTable = ({ data }) => {
  const buttonHandlerCard = (link) => {
    console.log(link)
    window.open(link)
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
        </Card>
      </Grid>
    ))}
  </Grid>)
};

export default CardTable;



