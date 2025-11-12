import { useState, useCallback, useRef } from 'react';
import { FileAttachment } from './FilePreview';

export const useFileHandling = (disabled: boolean, isViewer: boolean) => {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList) => {
    const filePromises = Array.from(fileList).map((file) => {
      return new Promise<FileAttachment>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file_name: file.name,
            mime_type: file.type,
            preview: reader.result as string,
            url: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((newFiles) => {
      setFiles((prev) => [...prev, ...newFiles]);
    });
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles) return;

      processFiles(selectedFiles);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [processFiles],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAttachClick = useCallback(() => {
    if (disabled || isViewer) return;
    fileInputRef.current?.click();
  }, [disabled, isViewer]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (disabled || isViewer) return;

      const droppedFiles = e.dataTransfer.files;
      if (!droppedFiles || droppedFiles.length === 0) return;

      processFiles(droppedFiles);
    },
    [disabled, isViewer, processFiles],
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    dragOver,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    handleAttachClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFiles,
  };
};
