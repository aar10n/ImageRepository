import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { fetchImage } from 'redux/image/actions';
import { getImage, isOwner } from 'redux/image/selectors';

interface Params {
  id: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      // width: 'auto !important',
      width: '100%',
      // height: '100%',
      marginLeft: '25%',
      marginRight: '25%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: {
      width: '100%',
      textAlign: 'left',
      fontFamily: 'Helvetica, Arial',
      fontSize: '30px',
      fontWeight: 600,
      marginBottom: '5px',
    },
    description: {
      width: '100%',
      textAlign: 'left',
      fontFamily: 'Helvetica, Arial',
      fontSize: '16px',
      marginTop: '8px',
    },
    image: {
      width: '100%',
    },
  })
);

export const Image = () => {
  const { id } = useParams<Params>();
  const dispatch = useDispatch();
  const image = useSelector(getImage(id));
  const owner = useSelector(isOwner(id));
  const classes = useStyles();

  useEffect(() => {
    if (!image) {
      dispatch(fetchImage(id));
    }
  }, [dispatch, id, image]);

  console.log(`is owner = ${owner} | ${id}`);

  return (
    image && (
      <div className={classes.container}>
        <div className={classes.content}>
          <div className={classes.title}>
            <span
              contentEditable={owner}
              placeholder="Title..."
              onChange={event => console.log(event)}
            >
              {image.title}
            </span>
          </div>
          <img
            className={classes.image}
            src={image.url}
            alt={image.title ?? image.description ?? image.id}
          />
          <div className={classes.description}>{image.description}</div>
        </div>
      </div>
    )
  );
};
