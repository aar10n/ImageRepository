import { useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useLocation, useParams } from 'react-router-dom';
import SearchService, { SearchOptions } from 'core/SearchService';

interface Params {
  query: string | undefined;
}

const useStyles = makeStyles(() => createStyles({}));

const useQuery = (query: string): SearchOptions =>
  useMemo(() => SearchService.validateOptions(query), [query]);

export const Search = () => {
  const location = useLocation();
  const params = useParams<Params>();
  const options = useQuery(location.search);
  const styles = useStyles();

  console.log(params);
  console.log(options);
  // console.log(Object.fromEntries(query.entries()));
  console.log('');
  return <div>Search</div>;
};
