import { ChangeEvent, memo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { ChangeType } from 'views/Search/FilterPanel';

interface Props {
  param: string;
  selected: number;
  label: string;
  min?: number;
  max?: number;
  onChange: (type: ChangeType, param: string, value: number) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'column',
    },
    inputContainer: {
      paddingBottom: '8px',
      paddingTop: '4px',
    },
    label: {
      width: '100%',
      fontSize: '12px',
      fontWeight: 'lighter',
      color: '#2196f3',
    },
    labelNonempty: {
      color: 'white',
    },
    input: {
      width: '100%',
      outline: 'none',
      border: 'none',
      color: 'white',
      padding: '0px',
      fontSize: '16px',
      backgroundColor: '#2e3035',
      borderBottom: '1px solid rgb(160,160,160)',

      '&::placeholder': {
        color: 'rgb(160,160,160)',
      },
    },
  })
);

export const NumberFilter = memo((props: Props) => {
  const { param, selected, label, min, max, onChange } = props;
  const [number, setNumber] = useState(selected);
  const [focused, setFocused] = useState(false);
  const classes = useStyles();

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setNumber(value);

    const type: ChangeType = value === 0 ? 'remove' : 'update';
    onChange(type, param, value);
  };

  return (
    <div className={classes.container}>
      <label
        className={classNames(
          classes.label,
          number === 0 ? '' : classes.labelNonempty
        )}
        htmlFor={label}
      >
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
          onChange={event => handleSelect(event)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
});
