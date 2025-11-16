import React, { memo, ReactNode, RefObject } from 'react';

import CreditWallet from '@/components/CreditWallet.jsx';

import { FilePreview } from '../FilePreview';

interface FileAttachment {
  file_name: string;
  mime_type: string;
  url?: string;
  preview?: string;
}

interface InputContainerProps {
  containerRef: RefObject<HTMLDivElement>;
  hasTasks: boolean;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  files: FileAttachment[];
  onRemoveFile: (index: number) => void;
  renderCredits: boolean;
  children: ReactNode;
}

export const InputContainer = memo(
  ({
    containerRef,
    hasTasks,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    fileInputRef,
    onFileChange,
    files,
    onRemoveFile,
    renderCredits,
    children,
  }: InputContainerProps) => {
    return (
      <div
        ref={containerRef}
        className={`relative w-full max-w-[700px] mx-auto ${
          hasTasks ? 'rounded-b-3xl' : 'rounded-3xl'
        } border bg-white/90 dark:bg-[#1c1c1c] hover:bg-white/95 dark:hover:bg-[#1c1c1c] focus-within:bg-white/95 dark:focus-within:bg-[#1c1c1c] backdrop-blur-lg border-gray-200/30 dark:border-gray-700/30 focus-within:border-transparent transition-colors`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Drag Overlay */}
        {dragOver && (
          <div className="absolute inset-0 z-50 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-blue-600 dark:text-blue-400 font-medium">Drop files here</div>
          </div>
        )}

        {/* Credit Wallet */}
        {renderCredits && <CreditWallet />}

        {/* File Previews */}
        <FilePreview
          files={files}
          onRemove={onRemoveFile}
        />

        {children}
      </div>
    );
  },
);

InputContainer.displayName = 'InputContainer';

