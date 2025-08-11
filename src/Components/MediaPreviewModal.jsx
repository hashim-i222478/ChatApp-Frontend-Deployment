import React from 'react';
import { FaTimes } from 'react-icons/fa';

const MediaPreviewModal = ({ mediaPreview, onClose }) => {
  if (!mediaPreview) return null;

  const { src, msg } = mediaPreview;

  const handleOpenInNewTab = () => {
    const isDataUrl = typeof src === 'string' && src.startsWith('data:');
    if (!isDataUrl) {
      window.open(src, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const [header, base64Data] = src.split(',');
      const mimeMatch = header.match(/^data:([^;]+);base64$/i);
      const mimeType = (mimeMatch && mimeMatch[1]) || msg.fileType || 'application/octet-stream';
      const byteChars = atob(base64Data);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error('Failed to open media in new tab:', err);
    }
  };

  return (
    <div className="media-modal-overlay" onClick={onClose}>
      <div className="media-modal-content" onClick={e => e.stopPropagation()}>
        <button className="media-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        {/* <button className="media-modal-open-new" onClick={handleOpenInNewTab} title="Open in new tab">
          Open in new tab
        </button> */}
        
        {mediaPreview.msg.fileType.startsWith('image/') && (
          <img 
            src={mediaPreview.src} 
            alt={mediaPreview.msg.filename || 'preview'} 
            className="media-modal-image" 
            loading="lazy"
          />
        )}
        
        {mediaPreview.msg.fileType.startsWith('video/') && (
          <video 
            src={mediaPreview.src} 
            controls 
            autoPlay 
            className="media-modal-video" 
          />
        )}
        
        {mediaPreview.msg.fileType.startsWith('audio/') && (
          <audio 
            src={mediaPreview.src} 
            controls 
            autoPlay 
            className="media-modal-audio" 
          />
        )}
      </div>
    </div>
  );
};

export default MediaPreviewModal;
