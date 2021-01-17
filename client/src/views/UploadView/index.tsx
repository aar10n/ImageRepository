import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { Gradient } from 'views/UploadView/Gradient';
import { Loading } from 'views/UploadView/Loading';
import { index } from 'core/utils';
import { uploadImages, setUploadStatus } from 'redux/image/actions';
import { getCurrent, getUploadStatus } from 'redux/image/selectors';
import { clearToast } from 'redux/toast/actions';

export type DragState = 'dragenter' | 'dragover' | 'dragleave' | 'drop';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    box: {
      width: '480px',
      height: '320px',
      backgroundColor: '#3c424b',
      boxShadow: '0 5px 15px 0 rgba(0, 0, 0, .3)',
      borderRadius: '10px',
      position: 'relative',
    },
    dropArea: {
      width: '100%',
      height: '100%',
      color: 'white',
      fontSize: '16px',
      overflow: 'hidden',
      fontFamily: 'Helvetica Neue, Arial',
    },
    dropBox: {
      width: '264px',
      height: '72px',
      verticalAlign: 'middle',
      border: '3px dashed hsla(0,0%,100%,.4)',
      cursor: 'pointer',
    },
    input: {
      opacity: 0,
      zIndex: -1,
      position: 'absolute',
    },
    inputLabel: {
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
    },
    loading: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    close: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      position: 'absolute',
      color: 'white',
      backgroundColor: '#393e47',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      right: -25,
      top: -25,
      zIndex: 5,
      boxShadow: '0 5px 10px 1px rgba(27,28,30,.31)',

      '&:hover': {
        cursor: 'pointer',
      },
    },
    closeIcon: {
      transform: 'scale(1.5) translateY(1px)',
      alignSelf: 'center',
    },
    failure: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Helvetica Neue, Arial',
      fontSize: '18px',
    },
    tryAgain: {
      textDecoration: 'underline',
      fontSize: '14px',
      cursor: 'pointer',
    },
  })
);

export const UploadView = () => {
  const [dragState, setDragState] = useState<DragState>();
  const [elemStack, setElemStack] = useState<HTMLElement[]>([]);
  const uploadStatus = useSelector(getUploadStatus);
  const current = useSelector(getCurrent);
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleUpload(event.target.files);
    }
  };

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === dragState) {
      return;
    }

    setDragState(event.type as any);
    if (event.type === 'dragenter') {
      const next = index(elemStack, -2);
      if (!next || event.target !== next) {
        setElemStack([...elemStack, event.target as any]);
      }
    } else if (event.type === 'dragleave') {
      const top = index(elemStack, -1);
      if (top && event.target === top) {
        setElemStack(elemStack.slice(0, elemStack.length - 1));
      }
    } else if (event.type === 'drop') {
      setElemStack([]);
      handleUpload(event.dataTransfer.files);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;
    await dispatch(uploadImages(files));
  };

  useEffect(() => {
    if (!current) return;
    history.push(`/i/${current.id}`);
  }, [current, history]);

  useEffect(() => {
    if (uploadStatus === 'success') {
      history.push(`/i/${current?.id}`);
    } else if (uploadStatus === 'failure') {
      // dispatch(setUploadStatus('idle'));
      history.replace(`/upload`);
    }
  }, [uploadStatus, current, history, dispatch]);

  // subcomponents

  const UploadBox = () => (
    <div
      className={classes.dropArea}
      onDragEnter={handleDragEvent}
      onDragOver={handleDragEvent}
      onDragLeave={handleDragEvent}
      onDrop={handleDragEvent}
    >
      <Gradient dragDepth={elemStack.length}>
        <div className={classes.dropBox}>
          <input
            className={classes.input}
            id="file-input"
            type="file"
            name="files"
            multiple
            accept="image/*"
            onChange={handleChange}
          />
          <label className={classes.inputLabel} htmlFor="file-input">
            Choose Images
          </label>
        </div>
      </Gradient>
    </div>
  );

  const LoadingIndicator = () => (
    <div className={classes.loading}>
      <Loading />
    </div>
  );

  const FailureText = () => (
    <div className={classes.failure}>
      <div>Upload Failed</div>
      <div
        className={classes.tryAgain}
        onClick={() => {
          dispatch(clearToast());
          dispatch(setUploadStatus('idle'));
        }}
      >
        Try Again
      </div>
    </div>
  );

  return (
    <div className={classes.container}>
      <div className={classes.box}>
        {uploadStatus === 'idle' ? (
          <UploadBox />
        ) : uploadStatus === 'uploading' || uploadStatus === 'waiting' ? (
          <LoadingIndicator />
        ) : uploadStatus === 'failure' ? (
          <FailureText />
        ) : null}

        <div className={classes.close}>
          <div className={classes.closeIcon}>&#x2715;</div>
        </div>
      </div>
    </div>
  );
};
