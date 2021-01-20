import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import SearchService, { SearchOptions } from 'core/SearchService';
import { FilterPanel } from 'views/Search/FilterPanel';
import { Gallery } from 'views/Gallery';
import { Thumbnail } from 'core/types';
import RestService from 'core/RestService';

interface Params {
  query: string | undefined;
}

library.add(faFilter, faSearch);

const useQuery = (query: string): SearchOptions =>
  useMemo(() => SearchService.validateOptions(query), [query]);

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateAreas: `
        "a c"
        "b d"
      `,
      gridTemplateColumns: '304px 1fr',
      gridTemplateRows: '58px 1fr',
    },
    filterTitle: {
      gridArea: 'a',
      display: 'flex',
      alignItems: 'center',
      marginLeft: '24px',
      fontSize: '14px',
    },
    filters: {
      gridArea: 'b',
    },
    search: {
      gridArea: 'c',
      display: 'flex',
      alignItems: 'center',
    },
    results: {
      gridArea: 'd',
      // backgroundColor: 'red',
      width: '100%',
      height: '100%',
    },

    titleText: {
      marginLeft: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    searchBar: {
      width: '98%',
      backgroundColor: '#424242',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      lineHeight: '18px',
    },
    searchInput: {
      backgroundColor: 'transparent',
      width: '100%',
      height: '100%',
      padding: '14px',
      color: 'white',
      outline: 'none',
      border: 'none',
      fontSize: '16px',

      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
      },
    },
    searchButton: {
      padding: '14px',
      width: '56px',
      backgroundColor: '#F54336',
      fontSize: '18px',
      cursor: 'pointer',
      '& *': {
        transform: 'translateX(2px)',
      },
    },
  })
);

export const Search = () => {
  const history = useHistory();
  const params = useParams<Params>();
  const options = useQuery(history.location.search);
  const [value, setValue] = useState(params.query ?? '');
  const [images, setImages] = useState<Thumbnail[]>([]);
  const classes = useStyles();

  const doSearch = async () => {
    const { pathname, search } = history.location;
    const url = SearchService.updatePath(pathname, search, value);
    history.push(url);

    const images = await RestService.searchImages(url);
    setImages(images);
  };

  const handleKeypress = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (key === 'Enter') {
      doSearch();
    }
  };

  // useEffect(() => {
  //   doSearch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <div className={classes.container}>
      <div className={classes.filterTitle}>
        <FontAwesomeIcon icon="filter" />
        <span className={classes.titleText}>Filters</span>
      </div>
      <div className={classes.filters}>
        <FilterPanel options={options} />
      </div>
      <div className={classes.search}>
        <div className={classes.searchBar}>
          <input
            className={classes.searchInput}
            value={value}
            placeholder="Search for images"
            onKeyPress={handleKeypress}
            onChange={event => setValue(event.target.value)}
          />
          <div className={classes.searchButton} onClick={doSearch}>
            <FontAwesomeIcon icon="search" />
          </div>
        </div>
      </div>
      <div className={classes.results}>
        <Gallery images={images} />
      </div>
    </div>
  );
};
