import { createPortal } from 'react-dom';
import Iconify from '../../iconify/Iconify.jsx';

const DragOverlay = ({ 
  dragOver, 
  overlayContainer, 
  onDrop,
}) => {
  if (!dragOver || !overlayContainer) {
    return null;
  }

  return createPortal(
    <div
      onDrop={onDrop}
      className="absolute inset-0 flex items-center justify-center z-[999999] pointer-events-auto
                 bg-black/40 backdrop-blur-xl transition-all duration-300"
    >
      <div className="flex flex-col items-center justify-center text-center h-full w-full text-white">
        <div className="flex items-center justify-center bg-white rounded-full h-16 w-16 mb-6 shadow-lg bg-opacity-80">
          <Iconify
            icon="iconamoon:attachment-light"
            className="text-2xl text-blue-500"
          />
        </div>
        <h5 className="text-2xl font-bold mb-2 animate-pulse">Drop your images here</h5>
        <p className="text-white/75">Only image files are accepted for attachments</p>
      </div>
    </div>,
    overlayContainer,
  );
};

export default DragOverlay; 