import { useCallback } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import SearchService, { SearchOptions } from 'core/SearchService';
import { useHistory } from 'react-router-dom';

import { ColorFilter } from 'views/Search/ColorFilter';
import { OptionsFilter } from 'views/Search/OptionsFilter';
import { NumberFilter } from 'views/Search/NumberFilter';

export type ChangeType = 'update' | 'remove';
interface Props {
  options: SearchOptions;
}

interface FilterProps {
  name: string;
  children: React.ReactNode;
}

const orientations = [
  { id: 'default', value: 'All orientations' },
  { id: 'landscape', value: 'Landscape' },
  { id: 'portrait', value: 'Portrait' },
  { id: 'square', value: 'Square' },
];

const colors = [
  {
    id: 'default',
    value: '#CACDD2',
    icon: 'times',
  },
  {
    id: 'grayscale',
    value:
      'linear-gradient(135deg, rgb(202, 205, 210) 0%,' +
      'rgb(202, 205, 210) 49%, rgb(22, 25, 30) 50%,' +
      'rgb(22, 25, 30) 100%)',
    background: '#CACDD2',
  },
  { id: 'red', value: '#E72525' },
  { id: 'orange', value: '#F48700' },
  { id: 'amber', value: '#ECA71D' },
  { id: 'yellow', value: '#F1F12A' },
  { id: 'lime', value: '#A9E418' },
  { id: 'green', value: '#06D506' },
  { id: 'teal', value: '#0ECB9C' },
  { id: 'turquoise', value: '#1AE0E0' },
  { id: 'aqua', value: '#0BBBF5' },
  { id: 'azure', value: '#2055F8' },
  { id: 'blue', value: '#0000FF' },
  { id: 'purple', value: '#7F00FF' },
  { id: 'orchid', value: '#BF00FF' },
  { id: 'magenta', value: '#EA06B1' },
];

const people = [
  { id: 'true', value: 'With people' },
  { id: 'false', value: 'Without people' },
];

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    filter: {
      marginLeft: '24px',
      marginRight: '24px',
      marginBottom: '18px',
    },
    filterLabel: {
      fontWeight: 'bold',
      marginBottom: '7px',
    },
  })
);

const Filter = (props: FilterProps) => {
  const { name, children } = props;
  const classes = useStyles();
  return (
    <div className={classes.filter}>
      <div className={classes.filterLabel}>{name}</div>
      {children}
    </div>
  );
};

export const FilterPanel = (props: Props) => {
  const history = useHistory();
  const classes = useStyles();
  const { options } = props;

  const handleChange = useCallback(
    (type: ChangeType, param: string, value: any) => {
      const { pathname, search } = history.location;
      const url = pathname + search;

      let updated: string;
      if (type === 'remove') {
        updated = SearchService.removeParam(url, param);
      } else {
        updated = SearchService.updateParam(url, param, value);
      }

      history.replace(updated);
    },
    [history]
  );

  return (
    <div className={classes.container}>
      <Filter name="Color">
        <ColorFilter
          param="color"
          colors={colors}
          selected={options.color ?? 'default'}
          onChange={handleChange}
        />
      </Filter>
      <Filter name="Orientation">
        <OptionsFilter
          param="orientation"
          numPerRow={2}
          options={orientations}
          selected={options.orientation ?? 'default'}
          onChange={handleChange}
        />
      </Filter>
      <Filter name="People">
        <OptionsFilter
          param="people"
          toggle
          numPerRow={2}
          options={people}
          selected={String(options.people ?? '')}
          onChange={handleChange}
        />
      </Filter>
      <Filter name="Image Size">
        <NumberFilter
          param="min_width"
          selected={options.min_width ?? 0}
          label="Min width"
          min={1}
          onChange={handleChange}
        />
        <NumberFilter
          param="min_height"
          selected={options.min_height ?? 0}
          label="Min height"
          min={1}
          onChange={handleChange}
        />
      </Filter>
    </div>
  );
};
