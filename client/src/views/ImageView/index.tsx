import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchImage } from 'redux/image/actions';
import { getImage } from 'redux/image/selectors';

interface Params {
  id: string;
}

export const ImageView = () => {
  const { id } = useParams<Params>();
  const dispatch = useDispatch();
  const image = useSelector(getImage(id));

  useEffect(() => {
    if (!image) {
      dispatch(fetchImage(id));
    }
  }, [dispatch, id, image]);

  return (
    image && (
      <img src={image.url} alt={image.title ?? image.description ?? image.id} />
    )
  );
};
