import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import classNames from 'classnames';
import { Image } from 'core/types';
import { addTag, deleteTag } from 'redux/image/actions';

library.add(faPlus);

interface Props {
  image: Image;
  editable: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tag: {
      display: 'inline-block',
      position: 'relative',
      height: '36px',
      margin: '5px 5px',
      padding: '11px 20px',
      borderRadius: '54px',
      backgroundColor: '#585d6a',
      boxShadow: '0 4px 5px rgba(0, 0, 0, .24)',
      fontFamily: 'Varela Round, Helvetica, Arial, sans-serif',
      lineHeight: '14px',
      fontSize: '14px',
      cursor: 'pointer',

      '&:hover': {
        background:
          'linear-gradient(0deg, hsla(0, 0%, 100%, .12),hsla(0, 0%, 100%, .12)), #585d6a',

        '& $tagRemove': {
          display: 'block',
        },
      },
    },
    tagRemove: {
      display: 'none',
      position: 'absolute',
      width: '24px',
      height: '24px',
      backgroundColor: '#fe6065',
      borderRadius: '38px',
      textAlign: 'center',
      padding: '6px',
      right: '-10px',
      top: '-7px',
    },
    tagAdd: {
      // width: '100px',
    },
    tagAddLabel: {
      fontWeight: 'bold',
    },
    tagAddText: {
      marginLeft: '4px',
    },
    tagInput: {
      minWidth: '40.8413px',
      width: '100%',
      color: 'white',
      border: 'none',
      whiteSpace: 'nowrap',
      '&:focus': {
        outline: 'none',
      },
    },
  })
);

export const Tags = (props: Props) => {
  const [showInput, setShowInput] = useState(false);
  const tagRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const { image, editable } = props;

  useEffect(() => {
    if (showInput && tagRef.current) {
      tagRef.current.focus();
    }
  }, [showInput]);

  const handleKeypress = (event: KeyboardEvent<HTMLSpanElement>) => {
    const { key } = event;
    if (key === 'Enter') {
      event.preventDefault();
      const text = event.currentTarget.innerText;
      dispatch(addTag(image.id, text));
      setShowInput(false);
    } else if (key === 'Escape') {
      setShowInput(false);
    }
  };

  const TagInput = () => (
    <div
      className={classNames(classes.tag, classes.tagAdd)}
      onClick={() => {
        if (!showInput) setShowInput(true);
      }}
    >
      {showInput ? (
        <div
          className={classes.tagInput}
          contentEditable
          suppressContentEditableWarning={true}
          ref={tagRef}
          onKeyDown={handleKeypress}
          onBlur={() => setShowInput(false)}
        />
      ) : (
        <span className={classes.tagAddLabel}>
          <FontAwesomeIcon icon="plus" />
          <span className={classes.tagAddText}>Tag</span>
        </span>
      )}
    </div>
  );

  return (
    <div className={classes.container}>
      {image.tags.map(tag => (
        <div
          className={classes.tag}
          key={tag}
          onClick={() => {
            history.push(`/search/${tag.replace(' ', '+')}`);
          }}
        >
          {tag}
          <span
            className={classes.tagRemove}
            onClick={event => {
              event.stopPropagation();
              dispatch(deleteTag(image.id, tag));
            }}
          >
            &#x2715;
          </span>
        </div>
      ))}
      {editable && <TagInput />}
    </div>
  );
};
