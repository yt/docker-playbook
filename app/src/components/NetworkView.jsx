import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Grid } from '@material-ui/core';

import AppContext from '../AppContext';

const NetworkView = () => {

  const { networkId, setNetworkId } = useContext(AppContext);
  const [data, setData] = useState({
    'addressConfig': [{
      'Gateway': undefined,
      'Subnet': undefined
    }],
    'name': undefined
  });

  useEffect(() => {
    if (!networkId) return;
    window.api.send("get_network", { network_id: networkId });
  }, [networkId])

  useEffect(() => {
    window.api.receive("get_network", (resp) => {
      setData(JSON.parse(resp))
    })
    window.api.receive("remove_network", (resp) => {
      setNetworkId(null)
    })
  }, [setData])

  const removeNetwork = () => { // TODO listen response
    window.api.send("remove_network", { network_id: networkId });
  }

  return networkId ? <div style={{
    maxHeight: '-webkit-fill-available',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'auto'
  }}>
    <h2 style={{ marginLeft: 8, width: '-webkit-fill-available' }}>{data.name}</h2>
    <Grid container alignContent='center' style={{ margin: "20px 4px 40px 4px" }}>
      <Button variant="outlined" color="secondary" onClick={removeNetwork}>
        Remove Network
    </Button>
    </Grid>
    <TextField
      id="addressConfig"
      label='IPAM Config'
      style={{ margin: 8 }}
      value={JSON.stringify(data.addressConfig)}
      InputProps={{
        readOnly: true,
      }}
      multiline
      fullWidth
    />
  </div> : null
}

export default NetworkView;