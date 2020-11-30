import React, { useState, useEffect } from 'react';
import { IconButton, Button, Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, DialogActions } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteSharpIcon from '@material-ui/icons/DeleteSharp';
import NewContainer from "./NewContainer";
import NewPlaybook from "./NewPlaybook";
import './dialogs.css'

// TODO handle when there is no data
const TemplateList = () => {

  const [open, setOpen] = useState(false);
  const [newContainerDialogOpen, setNewContainerDialogOpen] = useState(false);
  const [newPlaybookDialogOpen, setNewPlaybookDialogOpen] = useState(false);
  const [playbookTemplates, setPlaybookTemplates] = useState([]);
  const [containerTemplates, setContainerTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(false);

  useEffect(() => {
    const allContainerTemplateNames = window.api.getContainerTemplates()
    const cTemplates = []
    allContainerTemplateNames.forEach(template => {
      const container = window.api.getContainer(template)
      cTemplates.push({
        template: template,
        image: container['image'],
        name: container['name'],
        cmd: container['command'],
        network: container['network']
      })
    });

    const pTemplates = []
    const allPlaybookNames = window.api.getPlaybooks()
    allPlaybookNames.forEach(template => {
      pTemplates.push({
        name: template,
      })
    });
    setPlaybookTemplates(pTemplates)
    setContainerTemplates(cTemplates)
  }, []);

  const deletePlaybook = (name, index) => {
    window.api.deletePlaybook(name);
    const templates = [...playbookTemplates]
    templates.splice(index, 1)
    setPlaybookTemplates(templates)
  };

  const deleteContainerTemplate = (name, index) => {
    window.api.deleteContainer(name);
    const templates = [...containerTemplates]
    templates.splice(index, 1)
    setContainerTemplates(templates)
  };

  return (<>
    <Button variant="outlined" className="topBarButton" onClick={() => { setOpen(true); setEditingTemplate(null); }}>
      Templates</Button>
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
      <DialogTitle>Templates</DialogTitle>
      <DialogContent>
        <h3>Playbooks</h3>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Template</TableCell>
              <TableCell align="right">Del</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playbookTemplates.map((row) => (
              <TableRow key={row.name}>
                <TableCell>
                  <IconButton aria-label="edit template" size="small" onClick={() => { }}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="left">{row.name ? row.name : '_'}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit template" size="small" onClick={() => deletePlaybook(row.name)}>
                    <DeleteSharpIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h3>Containers</h3>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Template</TableCell>
              <TableCell align="right">Name</TableCell>
              <TableCell align="right">Image</TableCell>
              <TableCell align="right">Cmd</TableCell>
              <TableCell align="right">Network</TableCell>
              <TableCell align="center">Del</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {containerTemplates.map((row, i) => (
              <TableRow key={row.template}>
                <TableCell>
                  <IconButton aria-label="edit template" size="small" onClick={() => { setEditingTemplate(row.template); setNewContainerDialogOpen(true); setOpen(false); }}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{row.template ? row.template : '_'} </TableCell>
                <TableCell align="right">{row.name ? row.name : '_'}</TableCell>
                <TableCell align="right">{row.image ? row.image : '_'}</TableCell>
                <TableCell align="right">{row.cmd ? row.cmd : '_'}</TableCell>
                <TableCell align="right">{row.network ? row.network : '_'}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit template" size="small" onClick={() => deleteContainerTemplate(row.template, i)}>
                    <DeleteSharpIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" fullWidth style={{ margin: "20px 0px" }} onClick={() => { setOpen(false); setNewPlaybookDialogOpen(true) }}>New playbook</Button>
      </DialogActions>
    </Dialog>
    <NewPlaybook opened={newPlaybookDialogOpen} />
    <NewContainer presetTemplate={editingTemplate} opened={newContainerDialogOpen} buttonVisible={false} />
  </>
  );
}
export default TemplateList