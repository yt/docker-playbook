import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@material-ui/core';
import "./dialogs.css"


const NewNetwork = ({ buttonText = 'Create network', templateSaveCallback = null, confirmButtonText = 'Create', onlyCreateTemplate = false }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const createNetwork = () => {
    const name = document.getElementById("new-network-text-field").value;
    if (!onlyCreateTemplate) {
      window.api.send("create_network", { "name": name });
    }
    if (templateSaveCallback) {
      templateSaveCallback(name)
    }
    handleClose();
  }

  useEffect(function registerOnCreate(){
    window.api.receive("create_network", (resp) => {
      window.api.send("get_networks")
    })
  }, [])

  return (
    <>
      <Button variant="outlined" className="topBarButton" onClick={handleOpen}>
        {buttonText}</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create network</DialogTitle>
        <DialogContent>
          <form id="network-creation-form" onSubmit={(e) => { e.preventDefault(); createNetwork(); }}>
            <TextField
              autoFocus
              id="new-network-text-field"
              label="New network name"
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" type="submit" form="network-creation-form">
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>)
}

export default NewNetwork;