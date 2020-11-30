import React, { useState, useEffect, useContext } from 'react';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Divider from '@material-ui/core/Divider';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import AppContext from '../AppContext';

const getStatusDotClassName = (status) => {
  switch (status) {
    case 'running':
      return 'green-dot'
    case 'paused':
      return 'red-dot'
    case 'exited':
      return 'red-dot'
    case 'restarting':
      return 'blue-dot'
    default:
      return 'red-dot'
  }
}


const NetworkTree = () => {
  const [data, setData] = useState([]);
  const { setContainerId, setNetworkId, networkId, containerId } = useContext(AppContext);

  const openContainerView = (containerId) => {
    setNetworkId(null)
    setContainerId(containerId)
  }

  const openNetworkView = (networkId) => {
    setNetworkId(networkId)
    setContainerId(null)
  }

  useEffect(() => {

    window.api.receive("get_networks", (resp) => {
      const expandedNetworks = []
      const treeItems = [];
      JSON.parse(resp).networks.forEach((network, i) => {
        expandedNetworks.push(network.id)
        treeItems.push(<TreeItem key={network.id} nodeId={network.id} label={network.name} onLabelClick={(event) => { event.preventDefault(); openNetworkView(network.id) }}>
          {
            network.containers.map(container => <TreeItem key={container.id} name={container.name} nodeId={container.id}
              label={<><span className={getStatusDotClassName(container.status)}></span>{container.name}</>}
              onLabelClick={() => openContainerView(container.id)} />)
          }
        </TreeItem>)
        treeItems.push(<Divider key={i} />)
      });
      setData(<TreeView
        defaultExpanded={expandedNetworks}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {treeItems}
      </TreeView>)
    })
  }, [setContainerId])

  useEffect(() => {
    if (!networkId || !containerId) {
      window.api.send("get_networks");
    }
  }, [networkId, containerId])

  return <div style={{
    maxHeight: '-webkit-fill-available',
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'auto'
  }}>
    <h2 style={{ marginLeft: 8, width: '-webkit-fill-available' }}>Networks</h2>
    {data}</div>
}

export default NetworkTree;