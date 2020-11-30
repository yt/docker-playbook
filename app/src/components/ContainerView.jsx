import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, List, ListItem, Grid, CircularProgress } from '@material-ui/core';
import AppContext from '../AppContext';


let networkSection = [];
const networkMapper = (networks) => {
  networkSection = []
  Object.keys(networks).forEach((network, i) => {
    networkSection.push(
      <>
        <TextField
          label={`Network[${i}]`}
          style={{ margin: 8, marginTop: i ? 40 : 30 }}
          value={network}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
        />
        <TextField
          label='Ip'
          style={{ margin: 8, width: '11ch' }}
          value={networks[network].IPAddress}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label='Aliases'
          style={{ margin: 8, flexGrow: 1 }}
          value={networks[network].Aliases ? networks[network].Aliases.join(', ') : ''}
          InputProps={{
            readOnly: true,
          }}
          multiline
        />
      </>
    )
  });

  return networkSection;
}
const ContainerView = () => {

  const { containerId, setContainerId } = useContext(AppContext);
  const [envListOpen, setEnvListOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    "cmd": '',
    "env": '',
    "image": '',
    "name": '',
    "networks": [],
    "ports": {},
    "status": '',
    "volumeBinds": [],
    "volumes": {}
  });

  useEffect(() => {
    if (!containerId) return;
    window.api.send("get_container", { "container_id": containerId });
  }, [containerId])

  useEffect(() => {
    window.api.receive("get_container", (resp) => {
      setData(JSON.parse(resp))
    });
    window.api.receiveError("get_container", (resp) => {
      // Remove on stop container may be fired
      setContainerId(null)
    });
    window.api.receive("remove_container", (resp) => {
      setLoading(false)
      setContainerId(null)
    });
    window.api.receive("stop_container", (resp) => {
      setLoading(false)
      window.api.send("get_container", { "container_id": containerId });
    });
    window.api.receive("start_container", (resp) => {
      setLoading(false)
      window.api.send("get_container", { "container_id": containerId });
    });

  }, [containerId])

  const removeContainer = () => {
    window.api.send("remove_container", { container_id: containerId });
    setLoading(true)
  }

  const stopContainer = () => {
    window.api.send("stop_container", { container_id: containerId });
    setLoading(true)
  }

  const startContainer = () => {
    window.api.send("start_container", { container_id: containerId });
    setLoading(true)
  }

  return containerId ? <div style={{
    maxHeight: '-webkit-fill-available',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'auto'
  }}>
    <h2 style={{ marginLeft: 8 }}>{data.name}</h2>
    {loading ? <CircularProgress /> :
      <Grid container style={{ margin: "20px 0px 40px 0px" }} spacing={3}>
        <Grid item>
          {data.status !== 'exited' ? <Button variant="outlined" onClick={stopContainer}>Stop</Button> :
            <Button variant="outlined" onClick={startContainer}>Start</Button>}
        </Grid>
        <Grid item>
          <Button variant="outlined" color="secondary" onClick={removeContainer}>
            Remove</Button>
        </Grid>
      </Grid>}
    <TextField
      id="image"
      label='Image'
      style={{ margin: 8 }}
      value={data.image}
      InputProps={{
        readOnly: true,
      }}
      fullWidth
    />
    <TextField
      id="cmd"
      label='Cmd'
      style={{ margin: 8 }}
      value={data.cmd ? data.cmd : '<empty>'}
      InputProps={{
        readOnly: true,
      }}
    />
    <TextField
      id="ports"
      label='Ports | host: container'
      style={{ margin: 8, width: '18ch' }}
      value={Object.keys(data.ports).reduce((acc, current) => data.ports[current] ? acc + `${acc && '\n'}${data.ports[current][0]['HostPort']}  ->  ${current.split('/')[0]}` : acc, '')}
      InputProps={{
        readOnly: true,
      }}
      multiline
    />
    <Button size="medium" style={{ flexGrow: 1, paddingTop: '12px', textTransform: 'none' }} onClick={() => setEnvListOpen(!envListOpen)}>Environments &darr;</Button>
    <List style={{ margin: 8, width: '100%' }}>
      {envListOpen && data.env.map((env, i) => {
        return <>
          <ListItem divider={true} style={{ wordBreak: 'break-all' }}>
            {env}
          </ListItem></>
      })}
    </List>
    <TextField
      id="volumeBindings"
      label='Volume Bindings | host : container'
      style={{ margin: 8 }}
      value={data.volumeBinds ? data.volumeBinds.join('\n').replaceAll(':', '  :  ') : ''}
      InputProps={{
        readOnly: true,
      }}
      multiline
      fullWidth
    />
    {networkMapper(data.networks)}
  </div> : null
}

export default ContainerView;