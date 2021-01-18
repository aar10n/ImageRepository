import { useEffect, useState, useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { SearchOptions } from 'core/SearchService';
import { useHistory } from 'react-router-dom';

interface Props {
  options: SearchOptions;
}

const useStyles = makeStyles(() => {});

export const FilterPanel = (props: Props) => {
  const history = useHistory();
  const classes = useStyles();
  const { options } = props;

  return <div></div>;
};
