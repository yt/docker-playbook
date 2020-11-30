import React, { useCallback, useEffect, useState } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, IconButton, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Alert from '@material-ui/lab/Alert';
import NewContainer from './NewContainer';
import RemoveIcon from '@material-ui/icons/Remove';
import NewNetwork from './NewNetwork';
import "./dialogs.css"

const creationLogs = [];
let addToNetworkQueue = [];
let addToContainerQueue = [];

const NewPlaybook = ({ opened = false, presetTemplate }) => {

  const [open, setOpen] = useState(opened);
  const [templates, setTemplates] = useState([])
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [creationProgressData, setCreationProgressData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [dataMap, setDataMap] = useState({});
  const [addedNetworks, setAddedNetworks] = useState([]);
  const [addedContainers, setAddedContainers] = useState([]);
  const [emptyContainerQueueNow, setEmptyContainerQueueNow] = useState(false);
  const [emptyNetworkQueueNow, setEmptyNetworkQueueNow] = useState(false);

  useEffect(() => {
    window.api.receive("create_container", (resp) => {
      creationLogs.push(`Created container ${resp}`)
      setCreationProgressData(creationLogs)
      setLoading(false);
    })
    window.api.receiveError("create_container", (resp) => {
      setError(resp)
      setLoading(false);
    })
    window.api.receive("create_network", (resp) => {
      creationLogs.push(`Created network ${resp}`)
      setCreationProgressData(creationLogs)
      setLoading(false);
    })
    window.api.receiveError("create_network", (resp) => {
      setError(resp);
      setLoading(false);
    })
    setTemplates(window.api.getPlaybooks());
    setError(null);
  }, [])

  const getData = () => {
    const networkSteps = addedNetworks.map(network => ({
      "action": "createNetwork",
      "data": network
    }))
    const containerSteps = addedContainers.map(container => ({
      "action": "createContainer",
      "data": dataMap[container]
    }))
    return [...networkSteps, ...containerSteps]
  }

  const createAndRunPlaybook = () => {
    window.api.savePlaybook(name, { data: getData() });
    setCreationDialogOpen(true)
    getData().forEach((element) => {
      if (element.action === 'createNetwork') {
        window.api.send("create_network", { "name": element.data });
      }
      if (element.action === 'createContainer') {
        window.api.send("create_container", { "data": element.data });
      }
    })
  }

  const addContainer = useCallback((name, data) => {
    const prevData = { ...dataMap };
    const incrementDataName = (name, i = 1) => {
      if (!prevData[`${name}_${i}`]) {
        return `${name}_${i}`;
      }
      return incrementDataName(name, ++i)
    }

    let dataName = name;
    if (prevData[name]) {
      dataName = incrementDataName(dataName);
    }
    prevData[dataName] = data;
    setDataMap(prevData)
    return setAddedContainers([...addedContainers, dataName])
  }, [addedContainers, dataMap])

  const removeContainer = (name) => {
    const rep = [...addedContainers];
    rep.splice(rep.indexOf(name), 1);
    setAddedContainers(rep)
  }

  const addNetwork = useCallback((name) => {
    setAddedNetworks([...addedNetworks, name])
  }, [addedNetworks])

  useEffect(function emptyNetworkQueue() {
    if (!addToNetworkQueue.length) {
      setEmptyNetworkQueueNow(false)
      return
    }
    addNetwork(addToNetworkQueue[0])
    addToNetworkQueue.splice(0, 1)
  }, [addedNetworks, emptyNetworkQueueNow, addNetwork])

  useEffect(function empryContainerQueue() {
    if (!addToContainerQueue.length) {
      setEmptyContainerQueueNow(false)
      return
    }
    addContainer('preset', addToContainerQueue[0])
    addToContainerQueue.splice(0, 1)
  }, [addedNetworks, emptyContainerQueueNow, addContainer])

  const applyTemplate = useCallback((value) => {
    if (value === null) {
      return
    }
    setName(value);
    setAddedContainers([]);
    setAddedNetworks([]);
    const data = window.api.getPlaybook(value).data;
    for (const step of data) {
      if (step.action === 'createNetwork') {
        addToNetworkQueue.push(step.data);
      }
      if (step.action === 'createContainer') {
        addToContainerQueue.push(step.data);
      }
    }
    setEmptyContainerQueueNow(true);
    setEmptyNetworkQueueNow(true);
  }, [])

  const removeNetwork = (name) => {
    const rep = [...addedNetworks];
    rep.splice(rep.indexOf(name), 1);
    setAddedNetworks(rep)
  }

  useEffect(() => {
    if (presetTemplate) {
      applyTemplate(presetTemplate);
      setOpen(true);
    }
  }, [presetTemplate, applyTemplate])

  useEffect(() => {
    setOpen(opened);
  }, [opened])

  const handleClose = () => setOpen(false);

  const createPlaybook = () => {
    window.api.savePlaybook(name, { data: getData() });
    setOpen(false);
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle style={{ minWidth: "600px" }}>
          <Grid container justify="space-between">
            <div>Create a playbook</div>
            <Autocomplete
              style={{ marginTop: "0px", width: "20ch" }}
              options={templates}
              onChange={(_, v) => applyTemplate(v)}
              getOptionLabel={(option) => option}
              placeholder="New template"
              renderInput={(params) => <TextField placeholder="New template" {...params} />}
            />
          </Grid>
        </DialogTitle>
        <DialogContent>
          <TextField
            required
            label="Playbook name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "25px" }}
          />
          {addedNetworks.map((network, i) =>
            <Grid key={i} container justify="space-between">
              <div>{i + 1}. Create network: <b>{network}</b></div>
              <IconButton className="addVolumeButton" onClick={() => removeNetwork(network)}><RemoveIcon /></IconButton>
            </Grid>
          )}
          <Divider style={{ margin: '10px' }} />
          {addedContainers.map((container, i) =>
            <Grid key={i} container justify="space-between">
              <div>{i + 1}. Create container <b>{container}</b> with name {dataMap[container]['name'] ? dataMap[container]['name'] : 'randomly generated'}</div>
              <IconButton className="addVolumeButton" onClick={() => removeContainer(container)}><RemoveIcon /></IconButton>
            </Grid>
          )}
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
            style={{ marginTop: "20px" }}
          >
            <h4>Action:</h4>
            <NewNetwork buttonText='Add Network' confirmButtonText='Add' onlyCreateTemplate={true} templateSaveCallback={addNetwork} />
            <NewContainer buttonText='Add Container' confirmButtonText='Add' onlyCreateTemplate={true} templateSaveCallback={addContainer} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ marginLeft: "10px" }} color="primary">
            Cancel
          </Button>
          <Button color="primary" style={{ marginLeft: "10px" }} onClick={createPlaybook}>
            Create
          </Button>
          <Button color="primary" style={{ marginLeft: "10px" }} onClick={createAndRunPlaybook}>
            Create and run
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={creationDialogOpen} onClose={() => setCreationDialogOpen(false)} maxWidth="lg">
        <DialogTitle style={{ textAlign: "center" }}>
          {loading ? <CircularProgress /> : null}
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            direction="row"
            justify="space-between"
            style={{ marginTop: "20px" }}
          >
            {creationProgressData.map((res) => {
              return <div>{res}</div>
            })}
            {error && <Alert severity="error" style={{ marginTop: "15px" }}>{error}</Alert>}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => { setCreationDialogOpen(false); !error && setOpen(false) }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>)
}

export default NewPlaybook;