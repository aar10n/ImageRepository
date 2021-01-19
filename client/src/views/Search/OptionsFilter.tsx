import { createStyles, makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { memo } from 'react';

import { ChangeType } from 'views/Search/FilterPanel';

interface FilterOption {
  id: string;
  value: string;
}

interface Props {
  param: string;
  options: FilterOption[];
  numPerRow: number;
  selected: string;
  toggle?: boolean;
  onChange: (type: ChangeType, param: string, value: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'grid',
      gap: '8px',
      gridTemplateColumns: (props: Props) => `repeat(${props.numPerRow}, 1fr)`,
    },
    item: {
      height: '40px',
      borderRadius: '4px',
      backgroundColor: '#F3F4F5',
      color: 'rgba(12, 18, 28, .87)',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '12px',
      textAlign: 'center',
      lineHeight: '40px',
      cursor: 'pointer',

      '&:hover': {
        backgroundColor: '#CACDD2',
      },
    },
    selected: {
      backgroundColor: '#CACDD2',
    },
  })
);

export const OptionsFilter = memo((props: Props) => {
  const { param, options, selected, toggle, onChange } = props;
  const classes = useStyles(props);

  const handleSelect = (id: string) => {
    if (id === selected && !toggle) return;

    const type: ChangeType =
      id === 'default' || (id === selected && toggle) ? 'remove' : 'update';
    onChange(type, param, id);
  };

  return (
    <div className={classes.container}>
      {options.map(({ id, value }) => (
        <div
          key={id}
          className={classNames(
            classes.item,
            id === selected ? classes.selected : null
          )}
          onClick={() => handleSelect(id)}
        >
          {value}
        </div>
      ))}
    </div>
  );
});
