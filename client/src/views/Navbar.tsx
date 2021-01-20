import { KeyboardEvent, useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchService from 'core/SearchService';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      display: 'grid',
      // alignItems: 'center',
      gridTemplateAreas: `
      "a b"
    `,
      gridTemplateColumns: '304px 1fr',
    },
    links: {
      gridArea: 'a',
      display: 'flex',
      alignItems: 'center',
    },
    home: {
      marginLeft: '24px',
      fontWeight: 'bold',
      fontSize: '28px',
      fontFamily: 'Varela Round, Helvetica, Arial, sans-serif',
      cursor: 'pointer',
      color: 'white',
      textDecoration: 'none',
    },
    upload: {
      width: '100px',
      height: '46px',
      borderRadius: '8px',
      backgroundColor: '#01b96b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '14px',
      marginLeft: '24px',
      marginRight: '24px',
      cursor: 'pointer',
      color: 'white',
      textDecoration: 'none',
    },
    uploadText: {
      marginLeft: '4px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    search: {
      gridArea: 'b',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
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

export const Navbar = () => {
  const history = useHistory();
  const query = SearchService.getSearchPath(history.location.pathname);
  const [value, setValue] = useState(query);
  const classes = useStyles();

  const doSearch = () => {
    const { pathname, search } = history.location;
    let url: string;
    if (pathname.includes('/search')) {
      url = SearchService.updatePath(pathname, search, value);
    } else {
      url = `/search/${value}`;
    }
    history.push(url);
  };

  const handleKeypress = (event: KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (key === 'Enter') {
      doSearch();
    }
  };

  useEffect(() => {
    history.listen(location => {
      const { pathname } = location;
      if (!pathname.includes('/search')) {
        setValue('');
      }
    });
  }, [history]);

  return (
    <div className={classes.container}>
      <div className={classes.links}>
        <Link to="/" className={classes.home}>
          Images
        </Link>
        <Link to="/upload" className={classes.upload}>
          <FontAwesomeIcon icon="plus" />
          <span className={classes.uploadText}>Upload</span>
        </Link>
      </div>

      <div className={classes.search}>
        <div className={classes.searchBar}>
          <input
            className={classes.searchInput}
            placeholder="Search for images"
            value={value}
            onKeyPress={handleKeypress}
            onChange={event => setValue(event.target.value)}
          />
          <div className={classes.searchButton} onClick={doSearch}>
            <FontAwesomeIcon icon="search" />
          </div>
        </div>
      </div>
    </div>
  );
};
