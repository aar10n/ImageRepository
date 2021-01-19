import { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import SearchService, { SearchOptions } from 'core/SearchService';
import { ColorFilter } from 'views/Search/ColorFilter';
import { OptionsFilter } from 'views/Search/OptionsFilter';
import { NumberFilter } from 'views/Search/NumberFilter';

interface Params {
  query: string | undefined;
}

const useStyles = makeStyles(() => createStyles({}));

const useQuery = (query: string): SearchOptions =>
  useMemo(() => SearchService.validateOptions(query), [query]);

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

export const Search = () => {
  const history = useHistory();
  const params = useParams<Params>();
  const options = useQuery(history.location.search);
  const [search, setSearch] = useState(params.query ?? '');
  const styles = useStyles();

  const handleKeypress = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (key === 'Enter') {
      console.log('search!');
    }
  };

  return (
    <div>
      Search
      <div>
        <input
          onKeyPress={handleKeypress}
          onChange={event => setSearch(event.target.value)}
          value={search}
        ></input>
      </div>
      <ColorFilter
        param="color"
        colors={colors}
        selected={options.color ?? 'default'}
      />
      <OptionsFilter
        param="orientation"
        numPerRow={2}
        options={orientations}
        selected={options.orientation ?? 'default'}
      />
      <OptionsFilter
        param="people"
        numPerRow={2}
        options={people}
        selected={String(options.people ?? '')}
        toggle
      />
      <NumberFilter
        param="min_width"
        selected={options.min_width ?? 0}
        label="Min width"
        min={1}
      />
    </div>
  );
};
