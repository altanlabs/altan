import { useState, useRef, useCallback, useEffect } from 'react';
import { getBase64FromFile } from '@lib/utils';
import { uploadRoomMedia } from '../../../utils/media';

export const useFileHandling = (setAttachments, editorRef) => {
  const [dragOver, setDragOver] = useState(false);
  const dragTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file change from input
  const handleFileChange = useCallback(
    async (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const newAttachments = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const base64 = (await getBase64FromFile(file)).split(',')[1];
          newAttachments.push({
            file_content: base64,
            file_name: file.name,
            mime_type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          });
        }
        // Append to existing attachments
        setAttachments((prev) => [...(prev || []), ...newAttachments]);

        // Reset the file input to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [setAttachments],
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOver(false);

      const dtFiles = event.dataTransfer?.files;
      if (dtFiles && dtFiles.length > 0) {
        const newAttachments = [];
        for (let i = 0; i < dtFiles.length; i++) {
          const file = dtFiles[i];
          // Accept any file type
          const base64 = (await getBase64FromFile(file)).split(',')[1];
          newAttachments.push({
            file_content: base64,
            file_name: file.name,
            mime_type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          });
        }
        // Update the attachments only if there are valid files
        if (newAttachments.length > 0) {
          setAttachments((prev) => [...(prev || []), ...newAttachments]);
        }
      }
    },
    [setAttachments],
  );

  // Handle URL upload (upload files and insert as markdown)
  const handleUrlUpload = useCallback(
    async (files) => {
      // Create an array of objects containing both the file and its upload promise
      const fileUploads = files.map((file) => ({
        file,
        uploadPromise: uploadRoomMedia(file).catch(() => null),
      }));

      // Wait for all uploads to complete
      const results = await Promise.all(fileUploads.map(({ uploadPromise }) => uploadPromise));

      // Create markdown with original filenames
      const markdownUrls = fileUploads
        .map(({ file }, index) => {
          const url = results[index];
          if (url) {
            return `\n![${file.name}](${url})\n`;
          }
          return '';
        })
        .filter(Boolean)
        .join('');

      // Insert URLs into editor
      if (editorRef?.current?.insertText) {
        editorRef.current.insertText(markdownUrls);
      }
    },
    [editorRef],
  );

  // Setup drag and drop event listeners
  const setupDragEvents = useCallback((containerRef) => {
    if (!containerRef || !containerRef.current) {
      return;
    }

    const handleWindowDragOver = (event) => {
      event.preventDefault();
    };

    const handleWindowDragEnter = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      setDragOver(true);
    };

    const handleWindowDragLeave = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = setTimeout(() => {
        setDragOver(false);
      }, 1000);
    };

    const handleWindowDrop = (event) => {
      event.preventDefault();
      clearTimeout(dragTimeoutRef.current);
      setDragOver(false);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
      clearTimeout(dragTimeoutRef.current);
    };
  }, []);

  return {
    dragOver,
    fileInputRef,
    handleFileChange,
    handleDrop,
    handleUrlUpload,
    setupDragEvents,
  };
}; 