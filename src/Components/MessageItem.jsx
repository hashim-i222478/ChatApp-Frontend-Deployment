import React from 'react';
import { FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAudio, FaFileVideo } from 'react-icons/fa';

const MessageItem = ({ msg, onMediaClick }) => {
  if (msg.system) {
    // Render a centered or styled system message
    return (
      <div className="system-message">
        <span>{msg.message}</span>
        <span className="message-time">[{msg.time}]</span>
      </div>
    );
  }

  // --- Media rendering logic ---
  // Determine media source (base64 or URL)
  let mediaSrc = null;
  if (msg.file) {
    mediaSrc = msg.file;
  } else if (msg.fileUrl) {
    mediaSrc = msg.fileUrl.startsWith('http') ? msg.fileUrl : `https://chatapp-backend-production-abb8.up.railway.app${msg.fileUrl}`;
  }

  // Render media based on fileType
  let mediaElement = null;
  if (mediaSrc && msg.fileType) {
    if (msg.fileType.startsWith('image/')) {
      mediaElement = (
        <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => onMediaClick && onMediaClick(msg, mediaSrc)}>
          <img src={mediaSrc} alt={msg.filename || 'image'} style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginTop: 8 }} />
        </div>
      );
    } else if (msg.fileType.startsWith('video/')) {
      // Show a non-interactive video thumbnail; actual playback happens in the preview modal
      mediaElement = (
        <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => onMediaClick && onMediaClick(msg, mediaSrc)}>
          <video
            src={mediaSrc}
            // No controls and no autoplay in the bubble
            style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8, marginTop: 8, pointerEvents: 'none' }}
            preload="metadata"
            playsInline
            muted
          />
        </div>
      );
    } else if (msg.fileType.startsWith('audio/')) {
      mediaElement = (
        <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => onMediaClick && onMediaClick(msg, mediaSrc)}>
          <audio src={mediaSrc} controls style={{ maxWidth: 220, marginTop: 8 }} />
        </div>
      );
    } else {
      // Select appropriate file icon based on file type
      let FileIcon = FaFileAlt; // default icon
      if (msg.fileType) {
        if (msg.fileType.includes('pdf')) FileIcon = FaFilePdf;
        else if (msg.fileType.includes('word') || msg.fileType.includes('doc')) FileIcon = FaFileWord;
        else if (msg.fileType.includes('excel') || msg.fileType.includes('sheet') || msg.fileType.includes('xls')) FileIcon = FaFileExcel;
        else if (msg.fileType.includes('image')) FileIcon = FaFileImage;
        else if (msg.fileType.includes('audio')) FileIcon = FaFileAudio;
        else if (msg.fileType.includes('video')) FileIcon = FaFileVideo;
      }

      // If the source is a data URL, open via a Blob URL to improve cross-browser rendering (e.g., PDFs)
      const isDataUrl = typeof mediaSrc === 'string' && mediaSrc.startsWith('data:');

      const handleOpenInNewTab = (e) => {
        if (!isDataUrl) return; // Let the browser handle normal URLs
        try {
          e.preventDefault();
          // Convert data URL (base64) to Blob
          const [header, base64Data] = mediaSrc.split(',');
          const mimeMatch = header.match(/^data:([^;]+);base64$/i);
          const mimeType = (mimeMatch && mimeMatch[1]) || msg.fileType || 'application/octet-stream';
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);
          // Open in a new tab
          window.open(url, '_blank', 'noopener,noreferrer');
          // Revoke after a delay to allow the tab to load
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
          console.error('Failed to open data URL in new tab:', err);
        }
      };

      mediaElement = (
        <a
          href={mediaSrc}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenInNewTab}
          className={`file-link ${msg.from === 'me' ? 'file-link-self' : ''}`}
          title={msg.filename || 'Open file'}
        >
          <FileIcon style={{ marginRight: 8, fontSize: '1.2em' }} />
          <span className="file-name">{msg.filename || 'Open file'}</span>
        </a>
      );
    }
  }

  return (
    <div className={`message-container ${msg.from === 'me' ? 'message-self' : 'message-other'}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="message-username">{msg.username}</span>
          <span className="message-time">[{msg.time}]</span>
        </div>
        {/* Show text if present */}
        {msg.text && msg.text.trim() !== '' && <p className="message-text">{msg.text}</p>}
        {/* Show media if present */}
        {mediaElement}
      </div>
    </div>
  );
};

export default MessageItem;
