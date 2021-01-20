import { useEffect, useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import SearchService, { SearchOptions } from 'core/SearchService';
import { FilterPanel } from 'views/Search/FilterPanel';
import { Gallery } from 'views/Gallery';
import { Thumbnail } from 'core/types';
import { useDispatch } from 'react-redux';
import { searchImages } from 'redux/image/actions';

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
        "a b"
      `,
      gridTemplateColumns: '304px 1fr',
    },
    filterTitle: {
      gridArea: 'a',
      display: 'flex',
      alignItems: 'center',
      marginLeft: '24px',
      fontSize: '14px',
      marginBottom: '16px',
    },
    filters: {
      gridArea: 'a',
    },
    results: {
      gridArea: 'b',
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
      backgroundColor: '#01b96b',
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
  const dispatch = useDispatch();
  const options = useQuery(history.location.search);
  const [images, setImages] = useState<Thumbnail[]>([]);
  const classes = useStyles();

  useEffect(() => {
    const doSearch = async (url: string) => {
      const images = (await dispatch(searchImages(url))) as any;
      setImages(images);
    };

    const { pathname, search } = history.location;
    const url = SearchService.updatePath(pathname, search, params.query ?? '');
    doSearch(url);
  }, [options, dispatch, params.query, history.location]);

  return (
    <div className={classes.container}>
      <div className={classes.filters}>
        <div className={classes.filterTitle}>
          <FontAwesomeIcon icon="filter" />
          <span className={classes.titleText}>Filters</span>
        </div>

        <FilterPanel options={options} />
      </div>

      <div className={classes.results}>
        <Gallery images={images} />
      </div>
    </div>
  );
};
