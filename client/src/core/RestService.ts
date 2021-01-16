import axios from 'axios';
import { Image, CreatedImage, ImageInfo, Tag } from 'core/types';

const baseUrl = process.env.REACT_APP_BASE_URL;

export default class RestService {
  // Image

  public static async getImage(id: string): Promise<Image> {
    const url = `${baseUrl}/api/images/${id}`;
    const res = await axios.get<Image>(url);
    return res.data;
  }

  public static async editImage(
    id: string,
    secret: string | null,
    info: ImageInfo
  ): Promise<Image> {
    if (!secret) throw new Error('Unauthorized');

    const url = `${baseUrl}/api/images/${id}`;
    const res = await axios.patch<Image>(url, info, {
      headers: this.makeAuthHeader(secret),
    });
    return res.data;
  }

  public static async deleteImage(
    id: string,
    secret: string | null
  ): Promise<void> {
    if (!secret) throw new Error('Unauthorized');
    const url = `${baseUrl}/api/images/${id}`;
    await axios.delete(url, {
      headers: this.makeAuthHeader(secret),
    });
  }

  // Images

  public static async getImages(
    page: number,
    pageSize: number
  ): Promise<Image[]> {
    page = Math.abs(page);
    pageSize = Math.abs(pageSize);
    const url = `${baseUrl}/api/images`;
    const res = await axios.get<Image[]>(url);
    return res.data;
  }

  public static async uploadImages(files: FileList): Promise<CreatedImage[]> {
    const url = `${baseUrl}/api/images`;
    const formData = new FormData();
    for (const file of files) {
      formData.append('files[]', file);
    }

    const res = await axios.post<CreatedImage[]>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        const { loaded, total } = progressEvent;
        // Do something with the progress details
        console.log(`upload progress | ${loaded} | ${total}`);
      },
    });
    return res.data;
  }

  // Tag

  public static async deleteTag(
    id: string,
    secret: string | null,
    tag: Tag
  ): Promise<void> {
    if (!secret) throw new Error('Unauthorized');
    const name = encodeURIComponent(tag).replace(/%20/g, '+');
    const url = `${baseUrl}/api/images/${id}/tags/${name}`;
    await axios.delete(url, {
      headers: this.makeAuthHeader(secret),
    });
  }

  // Tags

  public static async getTags(id: string): Promise<Tag[]> {
    const url = `${baseUrl}/api/images/${id}/tags`;
    const res = await axios.get<Tag[]>(url);
    return res.data;
  }

  public static async addTags(
    id: string,
    secret: string | null,
    tags: Tag[]
  ): Promise<void> {
    if (!secret) throw new Error('Unauthorized');
    const url = `${baseUrl}/api/images/${id}/tags`;
    await axios.post(url, tags, {
      headers: this.makeAuthHeader(secret),
    });
  }

  // private

  private static makeAuthHeader(secret: string) {
    return {
      Authorization: `Basic ${btoa(`Owner:${secret}`)}`,
    };
  }
}
