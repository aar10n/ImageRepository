import { useEffect, useState } from 'react';
import { Thumbnail } from 'core/types';
import { useDispatch } from 'react-redux';
import { getImages } from 'redux/image/actions';
import { Gallery } from './Gallery';

export const Home = () => {
  const [images, setImages] = useState<Thumbnail[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchImages = async () => {
      const thumbnails = (await dispatch(getImages(1))) as any;
      setImages(thumbnails);
    };

    fetchImages();
  }, [dispatch]);

  return (
    <div>
      <Gallery images={images} />
    </div>
  );
};
