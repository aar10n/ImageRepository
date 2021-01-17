import { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router';

import { Gradient } from 'views/UploadView/Gradient';
import { Loading } from 'views/UploadView/Loading';
import { index } from 'core/utils';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImages } from 'redux/image/actions';
import { getCurrent, getUploadStatus } from 'redux/image/selectors';

export type DragState = 'dragenter' | 'dragover' | 'dragleave' | 'drop';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '480px',
      height: '320px',
    },
    dropArea: {
      width: '100%',
      height: '100%',
      color: 'white',
      fontSize: '16px',
      fontFamily: 'Helvetica Neue, Arial',
    },
    dropBox: {
      width: '264px',
      height: '72px',
      verticalAlign: 'middle',
      border: '3px dashed hsla(0,0%,100%,.4)',
      borderRadius: '6px',
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
    progressArea: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      history.push(`/`);
    }
  }, [uploadStatus, current, history]);

  return (
    <div className={classes.container}>
      {uploadStatus === 'idle' ? (
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
      ) : (
        <div className={classes.progressArea}>
          <Loading />
        </div>
      )}
    </div>
  );
};
