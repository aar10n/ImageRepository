import axios from 'axios';
import { UploadResponse } from 'core/types';

type ProgressFn = (progressEvent: ProgressEvent) => void;

const baseUrl = process.env.BASE_URL;

export default class RestService {
  public static async uploadImages(
    files: FileList,
    progressFn?: ProgressFn
  ): Promise<UploadResponse> {
    const url = `${baseUrl}/api/images`;

    const formData = new FormData();
    if (files.length === 1) {
      formData.append('file', files[0]);
    } else {
      for (const file of files) {
        formData.append('files[]', file);
      }
    }

    const res = await axios.post<UploadResponse>(url, formData, {
      onUploadProgress: progressFn,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
}
