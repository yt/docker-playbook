import React, { useEffect, useState, useRef } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogActions, DialogContent, FormGroup, FormControlLabel, Checkbox, Grid, IconButton, Input, InputAdornment, CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DoneIcon from '@material-ui/icons/Done';
import Alert from '@material-ui/lab/Alert';
import CloseIcon from '@material-ui/icons/Close';
import "./dialogs.css"

const FORM_WIDTH = 900;


const NewContainer = (
  {
    presetTemplate, opened = false, buttonVisible = true, buttonText = 'Create container',
    confirmButtonText = 'Create', onlyCreateTemplate = false, templateSaveCallback = null
  }) => {

  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false);

  const [runOnCreate, setRunOnCreate] = useState(true);
  const [autoRemove, setAutoRemove] = useState(false);
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [environment, setEnvironment] = useState('');
  const [network, setNetwork] = useState('');
  const [ports, setPorts] = useState('');
  const [volumeHostFields, setVolumeHostFields] = useState(['']);
  const [volumeContainerFields, setVolumeContainerFields] = useState(['']);
  const [volumeModeFields, setVolumeModeFields] = useState(['rw']);

  const [newTemplateName, setNewTemplateName] = useState(['']);
  const [error, setError] = useState(null);

  const handleClose = () => setOpen(false);

  useEffect(() => {
    setOpen(opened)
  }, [opened])

  useEffect(() => {
    window.api.receive("create_container", (resp) => {
      setLoading(false);
      setOpen(false);
      window.api.send("get_networks")
    })
    window.api.receiveError("create_container", (resp) => {
      setError(resp)
      setLoading(false);
    })

    return function cleanup(){
      setTemplates([]);
      setImage('');
      setName('');
      setCommand('');
      setEnvironment('');
      setNetwork('');
      setPorts('');
      setVolumeHostFields(['']);
      setVolumeContainerFields(['']);
      setVolumeModeFields(['rw']);
      setNewTemplateName(['']);
    }
  }, [])

  const getData = () => {
    const volumes = {}
    volumeHostFields.forEach((hostPath, index) => {
      if (hostPath) {
        volumes[hostPath] = {
          "bind": volumeContainerFields[index],
          "mode": volumeModeFields[index] ? volumeModeFields[index] : 'rw',
        }
      }
    });
    const data = { // Keys must match with https://docker-py.readthedocs.io/en/stable/containers.html#docker.models.containers.ContainerCollection.run
      image: image,
      command: command,
      name: name,
      auto_remove: autoRemove,
      environment: environment ? environment.split(',').map(e => e.trim()) : null,
      network: network,
      ports: ports ? JSON.parse(ports) : '',
      volumes: volumes,
      detach: true
    }
    return data;
  }

  const createTemplate = () => {
    window.api.saveContainer(newTemplateName, getData())
    // TODO templates.push(newTemplateName) // make it the selected item
    setCreatingTemplate(false)
    return newTemplateName
  }

  const createContainer = () => {
    if (onlyCreateTemplate) {
      const newTemplateName = createTemplate();
      if (templateSaveCallback) {
        templateSaveCallback(newTemplateName, {...getData()})
      }
      setOpen(false);
      return
    }
    setError(null);
    setLoading(true);
    window.api.send("create_container", { "data": getData() })
  }

  useEffect(() => {
    window.api.send("get_images");
    window.api.receive("get_images", (resp) => {
      setImages(JSON.parse(resp)["images"])
    });
    setTemplates(window.api.getContainerTemplates())
    setError(null);
  }, [])

  useEffect(() => {
    if (presetTemplate) {
      applyTemplate(presetTemplate);
      setOpen(true);
    }
  }, [presetTemplate])


  const changeVolumeFields = (field, setter, key, event) => {
    const newValue = field;
    newValue[key] = event.target.value;
    setter([...newValue]);
  }

  const applyTemplate = (value) => {
    setNewTemplateName(value)
    if (value === null) {
      return
    }
    const data = window.api.getContainer(value)
    setImage(data['image'])
    setCommand(data['command'])
    setName(data['name'])
    setAutoRemove(data['auto_remove'])
    setEnvironment(data['environment'] ? data['environment'].join(', ') : '')
    setNetwork(data['network'])
    setPorts(JSON.stringify(data['ports']))

    const volumeObjects = Object.keys(data['volumes']);
    if (!volumeObjects.length) {
      setVolumeContainerFields([''])
      setVolumeModeFields(['rw'])
      setVolumeHostFields([''])
      return
    }
    const containerField = []
    const modeField = []
    setVolumeHostFields(volumeObjects)
    volumeObjects.forEach((hostPath, index) => {
      containerField[index] = data['volumes'][hostPath]['bind'];
      modeField[index] = data['volumes'][hostPath]['mode'];
    });
    setVolumeContainerFields(containerField);
    setVolumeModeFields(modeField)
  }

  const addVolumeRow = () => {
    setVolumeContainerFields([...volumeHostFields, ''])
    setVolumeModeFields([...volumeModeFields, 'rw'])
    setVolumeHostFields([...volumeHostFields, ''])
  }

  const removeVolumeRow = (key) => () => {
    const container = [...volumeContainerFields];
    const mode = [...volumeModeFields];
    const host = [...volumeHostFields];
    container.splice(key, 1);
    mode.splice(key, 1);
    host.splice(key, 1);
    setVolumeContainerFields(container)
    setVolumeModeFields(mode)
    setVolumeHostFields(host)
  }

  return (
    <>
      <Button style={{ display: buttonVisible ? undefined : 'none' }} variant="outlined" className="topBarButton" onClick={() => setOpen(true)}>
        {buttonText}</Button>
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>
          <Grid container justify="space-between">
            <div>Create container</div>
            <Autocomplete
              style={{ marginTop: "0px", width: "22ch" }}
              options={templates}
              onChange={(_, v) => applyTemplate(v)}
              getOptionLabel={(option) => option}
              defaultValue={presetTemplate}
              openOnFocus
              renderInput={(params) => <TextField autoFocus placeholder="Templates" {...params} />}
            />
          </Grid>
        </DialogTitle>
        <DialogContent>
          <form id="container-creation-form" onSubmit={(e) => { e.preventDefault(); createContainer() }}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={runOnCreate} onChange={() => setRunOnCreate(!runOnCreate)} />}
                label="Run on create"
              />
              <FormControlLabel
                control={<Checkbox checked={autoRemove} onChange={() => setAutoRemove(!autoRemove)} />}
                label="Remove the container when it has finished running"
              />
              <Autocomplete
                options={images}
                freeSolo={true}
                getOptionLabel={(option) => option["tags"] && option["tags"].join(',')}
                style={{ width: FORM_WIDTH }}
                onInputChange={(_, v) => setImage(v)}
                inputValue={image}
                renderInput={(params) => <TextField required {...params} label="Image" helperText="You can also enter remote images" />}
              />
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
              <TextField
                label="Environments"
                value={environment}
                placeholder="ENV_ONE=hmm, ANOTHER_ENV=3"
                onChange={(e) => setEnvironment(e.target.value)}
              />
              <TextField
                label="Network"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              />
              <TextField
                label="Ports"
                value={ports}
                placeholder={"Ex: {\"2222/tcp\": 3333} will expose port 2222 inside the container to 3333 on the host."}
                onChange={(e) => setPorts(e.target.value)}
              />
              {volumeHostFields.map((_, index) => (
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  key={index}
                >
                  <TextField
                    label="Create Volume"
                    placeholder="Host path or a volume name"
                    value={volumeHostFields[index]}
                    onChange={(e) => changeVolumeFields([...volumeHostFields], setVolumeHostFields, index, e)}
                    style={{ width: FORM_WIDTH / 2.5, marginRight: "12px" }}
                  />:
                  <TextField
                    label="Volume container path"
                    value={volumeContainerFields[index]}
                    onChange={(e) => changeVolumeFields([...volumeContainerFields], setVolumeContainerFields, index, e)}
                    style={{ width: FORM_WIDTH / 2.5, marginLeft: "12px" }}
                  />
                  <Autocomplete
                    value={volumeModeFields[index]}
                    onChange={(e) => changeVolumeFields([...volumeModeFields], setVolumeModeFields, index, e)}
                    options={['ro', 'rw']}
                    disableClearable
                    getOptionLabel={(option) => option}
                    renderInput={(params) => <TextField {...params} label="Mode" />}
                  />
                  {!index ? <IconButton className="addVolumeButton" onClick={addVolumeRow}>
                    <AddIcon /></IconButton> :
                    <IconButton className="addVolumeButton" onClick={removeVolumeRow(index)}>
                      <RemoveIcon /></IconButton>}
                </Grid>))}
            </FormGroup>
          </form>
          {error && <Alert severity="error" style={{ marginTop: "15px" }} action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setError(null)
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          {creatingTemplate ?
            <Input
              label="New template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              type='text'
              width={100}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={createTemplate}>
                    <DoneIcon />
                  </IconButton>
                </InputAdornment>
              }
              startAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setCreatingTemplate(false)}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              }
              style={{ marginRight: "auto" }}
            /> :
            <Button onClick={() => setCreatingTemplate(true)} color="secondary" style={{ marginRight: "auto" }}>
              Create a template
            </Button>}
          <Button onClick={handleClose} color="primary">
            {!loading && 'Cancel'}</Button>
          <Button color="primary" type="submit" disabled={loading} form="container-creation-form">
            {loading && <CircularProgress size={18} />}
            {!loading && confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>)
}

export default NewContainer;