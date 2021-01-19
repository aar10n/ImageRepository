import { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import SearchService from 'core/SearchService';

interface Props {
  param: string;
  selected: number;
  label: string;
  min?: number;
  max?: number;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'column',
    },
    inputContainer: {
      width: '20%',
      paddingBottom: '24px',
      paddingTop: '4px',
      minHeight: '65px',
    },
    label: {
      width: '100%',
      fontSize: '12px',
    },
    input: {
      width: '100%',
      outline: 'none',
      border: 'none',
      color: 'white',
      padding: '0px',
      fontSize: '16px',
      backgroundColor: '#2e3035',

      '&::placeholder': {
        color: 'rgb(160,160,160)',
      },
    },
  })
);

export const NumberFilter = (props: Props) => {
  const { param, selected, label, min, max } = props;
  const [number, setNumber] = useState(selected);
  const [focused, setFocused] = useState(false);
  const history = useHistory();
  const classes = useStyles();

  const handleSelect = (val: number) => {
    setNumber(val);
    const {
      location: { pathname, search },
    } = history;
    const url = pathname + search;

    let updated: string;
    if (val === 0) {
      updated = SearchService.removeParam(url, param);
    } else {
      updated = SearchService.updateParam(url, param, val);
    }

    history.replace(updated);
  };

  return (
    <div className={classes.container}>
      <label className={classes.label} htmlFor={label}>
        {focused || number ? label : <div style={{ height: '17px' }} />}
      </label>
      <div className={classes.inputContainer}>
        <input
          type="number"
          name={label}
          className={classes.input}
          placeholder={focused ? '' : label}
          min={min ?? ''}
          max={max ?? ''}
          value={number || ''}
          onChange={event => handleSelect(Number(event.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
};
