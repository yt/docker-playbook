import React, { useEffect, useState } from 'react';
import './App.css';
import NetworkTree from './components/NetworkTree';
import ContainerView from './components/ContainerView';
import NetworkView from './components/NetworkView';
import LogView from './components/LogView';
import TopBar from './components/TopBar';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Paper';
import AppContext from './AppContext';

const TOP_BAR_HEIGHT = '70'

const App = () => {

  const [containerId, setContainerId] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [paperStyle, setPaperStyle] = useState({
    padding: '10px',
    height: window.innerHeight - TOP_BAR_HEIGHT - 40
  });

  useEffect(() => {
    window.addEventListener("resize", () => 
      setPaperStyle({
        padding: '10px',
        height: window.innerHeight - TOP_BAR_HEIGHT - 40
      }), true);
  }, [])

  return <AppContext.Provider value={{
    containerId,
    setContainerId,
    networkId,
    setNetworkId
  }}>
    <TopBar />
    <Grid container justify="space-evenly">
      <Container style={{ width: '20%' }}>
        <Paper elevation={3} style={paperStyle}><NetworkTree /></Paper>
      </Container>
      <Container style={{ width: '34%' }}>
        <Paper elevation={2} style={paperStyle}>{containerId || networkId ? <><ContainerView /><NetworkView /></> : 'Item details'}</Paper>
      </Container>
      <Container style={{ width: '44%' }}>
        <Paper elevation={1} style={paperStyle}>{containerId ? <LogView /> : 'Logs of last 24 hours will appear here.'}</Paper>
      </Container>
    </Grid>
  </AppContext.Provider>
}

export default App;
