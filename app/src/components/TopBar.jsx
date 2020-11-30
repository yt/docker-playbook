import React from 'react';
import { Grid, } from '@material-ui/core';
import NewNetwork from "./dialogs/NewNetwork";
import NewContainer from "./dialogs/NewContainer";
import TemplateList from './dialogs/TemplateList';

const TOP_BAR_HEIGHT = '70'

const TopBar = () => {

  return (
    <Grid item sm={12} style={{ flexGrow: 1, height: `${TOP_BAR_HEIGHT}px` }}>
      <TemplateList />
      <NewContainer />
      <NewNetwork />
    </Grid>
  )
}

export default TopBar;