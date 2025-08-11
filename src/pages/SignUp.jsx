import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../Services/api';
import '../Style/signup.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    confirmPin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Restrict PIN fields to digits only
    const processed = (name === 'pin' || name === 'confirmPin')
      ? value.replace(/\D/g, '')
      : value;
    setFormData({
      ...formData,
      [name]: processed
    });
  };

  // Prevent non-digit keys in PIN inputs
  const handleDigitKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Block non-digit characters before they are inserted (mobile-friendly)
  const handleDigitBeforeInput = (e) => {
    if (e.data && !/^\d+$/.test(e.data)) {
      e.preventDefault();
    }
  };

  // Ensure pasted content is digits only
  const handleDigitPaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+$/.test(text)) {
      e.preventDefault();
      const digits = text.replace(/\D/g, '');
      if (digits) {
        const target = e.target;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        const next = (target.value.slice(0, start) + digits + target.value.slice(end)).slice(0, 4);
        setFormData(prev => ({ ...prev, [target.name]: next }));
      }
    }
  };

  // Sanitize value on input (final fallback across browsers)
  const handleDigitInput = (e) => {
    const { name, value } = e.target;
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (value !== digits) {
      setFormData(prev => ({ ...prev, [name]: digits }));
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate PIN match
    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      setLoading(false);
      return;
    }
    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits');
      setLoading(false);
      return;
    }

    try {
      const { confirmPin, ...dataToSend } = formData;
      // Register user
      const registerRes = await authAPI.register(dataToSend);
      const userId = registerRes.data.userId;
      
      // If a profile picture is selected, upload it (optional)
      if (profilePic) {
        const formDataPic = new FormData();
        formDataPic.append('profilePic', profilePic);
        formDataPic.append('userId', userId);
        await fetch('http://localhost:8080/api/users/upload-profile-pic', {
          method: 'POST',
          body: formDataPic
        });
      }
      
      // Auto-login the user
      const loginRes = await authAPI.login({ userId, pin: formData.pin });
      const { token, username } = loginRes.data;
      
      // Persist auth details
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      
      // Notify app to establish WebSocket connection
      window.dispatchEvent(new CustomEvent('user-logged-in'));
      
      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // success modal removed; auto-login redirects immediately

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2 className="signup-title">
              <span className="title-icon"></span> Join RealTalk
            </h2>
            <p className="signup-subtitle">Create your account to get started</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="signup-form" autoComplete="off">
            <div className="form-group">
              <div className="profile-picture-section">
              <label className="profile-picture-label">Profile Picture:</label>
              <div className="profile-picture-container">
                <div className="profile-picture-preview">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile Preview" className="profile-preview-image" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="profile-picture-input"
                  id="profile-picture-input"
                />
                <label htmlFor="profile-picture-input" className="profile-picture-button">
                  Choose Image
                </label>
                
                <span className="profile-picture-note">Optional: Upload a profile picture</span>
              </div>
            </div>
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                placeholder="Choose a username"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pin" className="form-label">4-digit PIN</label>
              <input
                type="password"
                id="pin"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                onKeyDown={handleDigitKeyDown}
                onBeforeInput={handleDigitBeforeInput}
                onPaste={handleDigitPaste}
                onInput={handleDigitInput}
                autoComplete="new-password"
                inputMode="numeric"
                required
                pattern="[0-9]{4}"
                placeholder="Create a 4-digit PIN"
                maxLength={4}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPin" className="form-label">Confirm PIN</label>
              <input
                type="password"
                id="confirmPin"
                name="confirmPin"
                value={formData.confirmPin}
                onChange={handleChange}
                onKeyDown={handleDigitKeyDown}
                onBeforeInput={handleDigitBeforeInput}
                onPaste={handleDigitPaste}
                onInput={handleDigitInput}
                autoComplete="new-password"
                inputMode="numeric"
                required
                pattern="[0-9]{4}"
                placeholder="Confirm your 4-digit PIN"
                maxLength={4}
                className="form-input"
              />
            </div>
            
            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="signup-footer">
            <p className="signup-redirect">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
  {/* Success modal removed: user is auto-logged in and redirected */}
    </div>
  );
};

export default SignUp;