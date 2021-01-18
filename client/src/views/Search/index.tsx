import { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import SearchService, { SearchOptions } from 'core/SearchService';

interface Params {
  query: string | undefined;
}

const useStyles = makeStyles(() => createStyles({}));

const useQuery = (query: string): SearchOptions =>
  useMemo(() => SearchService.validateOptions(query), [query]);

export const Search = () => {
  const history = useHistory();
  const params = useParams<Params>();
  const options = useQuery(history.location.search);
  const [search, setSearch] = useState(params.query ?? '');
  const styles = useStyles();

  console.log(params);
  console.log(options);
  // console.log(Object.fromEntries(query.entries()));
  console.log('');

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
    </div>
  );
};
