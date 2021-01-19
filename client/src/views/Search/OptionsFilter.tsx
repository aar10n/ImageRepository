import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import SearchService from 'core/SearchService';

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
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '20%',
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

export const OptionsFilter = (props: Props) => {
  const history = useHistory();
  const { param, options, selected, toggle } = props;
  const classes = useStyles(props);

  const handleSelect = (id: string) => {
    console.log(toggle);
    if (id === selected && !toggle) {
      return;
    }

    const {
      location: { pathname, search },
    } = history;
    const url = pathname + search;

    let updated: string;
    if (id === 'default' || (id === selected && toggle)) {
      updated = SearchService.removeParam(url, param);
    } else {
      updated = SearchService.updateParam(url, param, id);
    }

    history.replace(updated);
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
};
