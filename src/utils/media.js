import { optimai } from './axios';
import { createMedia } from '../redux/slices/media';
import { dispatch } from '../redux/store.ts';

const getMediaUploadObject = async (file) => {
  if (!file) {
    return {};
  }
  let fileType = file.type;
  if (!fileType) {
    // Fallback for file types that don't have a MIME type
    const fileExtension = file.name.split('.').pop();
    fileType = fileExtension;
  }
  const fileName = file?.name || 'Unnamed media';
  const base64 = await getBase64(file);
  const fileContent = base64.split(',')[1];
  return {
    fileType,
    fileName,
    fileContent,
  };
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const createMediaPersonalMedia =
  ({ fileName, fileContent, fileType }) =>
  async (dispatch, getState) => {
    try {
      // console.log('creating media...');
      const response = await optimai.post('/user/me/media', {
        file_name: fileName,
        mime_type: fileType,
        file_content: fileContent,
      });
      // console.log("response", response.data)
      const { media, media_url } = response.data;
      // console.log('media url', media_url);
      return media_url;
    } catch (e) {
      console.error(`error: could not post media: ${e.message}`);
      return Promise.reject(e);
    }
  };

const uploadPersonalMedia = async (file) => {
  if (!file) return; // Exit if no file is selected
  try {
    const { fileType, fileName, fileContent } = await getMediaUploadObject(file);
    return dispatch(createMediaPersonalMedia({ fileType, fileName, fileContent }));
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

const uploadRoomMedia = async (file) => {
  if (!file) return; // Exit if no file is selected
  try {
    const { fileType, fileName, fileContent } = await getMediaUploadObject(file);
    return dispatch(createMedia({ fileType, fileName, fileContent }));
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

const uploadMedia = async (file) => {
  if (!file) return; // Exit if no file is selected
  try {
    // console.log('FILE', file);
    let fileType = file.type;
    if (!fileType) {
      // Fallback for file types that don't have a MIME type
      const fileExtension = file.name.split('.').pop();
      fileType = fileExtension;
    }
    const fileName = file?.name || 'Unnamed media';
    const base64 = await getBase64(file);
    const fileContent = base64.split(',')[1];
    return dispatch(createMedia({ fileType, fileName, fileContent }));
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

export { uploadMedia, uploadPersonalMedia, uploadRoomMedia };
