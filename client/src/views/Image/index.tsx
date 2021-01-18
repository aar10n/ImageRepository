import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { editImage, fetchImage } from 'redux/image/actions';
import { getImage, isOwner } from 'redux/image/selectors';
import { Tags } from 'views/Image/Tags';

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
      // backgroundColor: '#2e3035',
    },
    content: {
      // width: 'auto !important',
      width: '100%',
      maxWidth: '60%',
      // height: '100%',
      // marginLeft: '25%',
      // marginRight: '25%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },

    title: {
      WebkitUserSelect: 'none',
      width: '100%',
      textAlign: 'left',
      fontFamily: 'Helvetica, Arial',
      fontSize: '30px',
      marginBottom: '5px',
      fontWeight: 600,
      cursor: 'text',
    },
    description: {
      width: '100%',
      textAlign: 'left',
      fontFamily: 'Helvetica, Arial',
      fontSize: '18px',
      marginTop: '8px',
      marginBottom: '8px',
      fontWeight: 600,
      cursor: 'text',
    },

    editableText: {
      width: '100%',
      display: 'inline-block',
      paddingLeft: '1px',
      outline: 'none',
      textDecoration: 'none',
      '&:empty::before': {
        color: '#63656D',
        fontStyle: 'italic',
        content: 'attr(placeholder)',
        display: 'inline-block',
      },
    },
    image: {
      width: '100%',
    },

    hiddenInputContainer: {
      position: 'relative',
      overflow: 'hidden',
    },
    hiddenInput: {
      position: 'absolute',
      top: -500,
    },
  })
);

export const Image = () => {
  const [text, setText] = useState('');
  const { id } = useParams<Params>();
  const dispatch = useDispatch();
  const image = useSelector(getImage(id));
  const owner = useSelector(isOwner(id));
  const classes = useStyles();
  const titleRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!image) {
      dispatch(fetchImage(id));
    }
  }, [dispatch, id, image]);

  const handleKeypress = (
    event: KeyboardEvent<HTMLSpanElement>,
    field: 'title' | 'description'
  ) => {
    const { key } = event;
    if (key === 'Enter') {
      const text = event.currentTarget.innerText;
      event.currentTarget.blur();
      event.preventDefault();

      if (image && text !== image?.[field]) {
        dispatch(editImage(image.id, { [field]: text }));
      }
    } else if (key === 'Escape') {
      event.currentTarget.innerText = text;
      event.currentTarget.blur();
      event.preventDefault();
    }
  };

  return (
    image && (
      <div className={classes.container}>
        <div className={classes.content}>
          <div className={classes.title}>
            <span
              className={owner ? classes.editableText : ''}
              contentEditable={owner}
              suppressContentEditableWarning={true}
              placeholder="Title..."
              ref={titleRef}
              onKeyDown={event => handleKeypress(event, 'title')}
              onFocus={event => {
                setText(event.currentTarget.innerText);
              }}
              onBlur={event => {
                // this is the the only way i've found to fix the
                // issue of the cursor jumping to the beginning of
                // the div when unfocusing.
                event.currentTarget.contentEditable = 'false';
                setTimeout(() => {
                  titleRef.current!.contentEditable = 'true';
                }, 5);
              }}
            >
              {image.title}
            </span>
          </div>
          <img
            className={classes.image}
            src={image.url}
            alt={image.title ?? image.description ?? image.id}
          />
          <div className={classes.description}>
            <span
              className={owner ? classes.editableText : ''}
              contentEditable={owner}
              suppressContentEditableWarning={true}
              placeholder="Title..."
              ref={descRef}
              onKeyDown={event => handleKeypress(event, 'description')}
              onFocus={event => {
                setText(event.currentTarget.innerText);
              }}
              onBlur={event => {
                event.currentTarget.contentEditable = 'false';
                setTimeout(() => {
                  descRef.current!.contentEditable = 'true';
                }, 5);
              }}
            >
              {image.description}
            </span>
          </div>

          <Tags image={image} editable={owner} />
        </div>
      </div>
    )
  );
};
