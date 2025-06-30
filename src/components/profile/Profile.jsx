import { Save, Upload, User, Mail } from 'lucide-react';
import React, { memo, useState, useEffect, useCallback } from 'react';

// Import your actual hooks and utilities
import { useAuthContext } from '../../auth/useAuthContext';
import { uploadPersonalMedia } from '../../utils/media';

const getUserDetails = (user) => ({
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  user_name: user?.user_name ?? '',
  avatar_url: user?.avatar_url ?? null,
  first_name: user?.first_name ?? '',
  last_name: user?.last_name ?? '',
  identification: user?.identification ?? '',
  gender: user?.gender ?? '',
  birthday: user?.birthday ?? null,
  fiscal_id: user?.fiscal_id ?? '',
});

const Profile = () => {
  const { user, patchUser } = useAuthContext();

  const [profileData, setProfileData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!!user) {
      const userDetails = getUserDetails(user);
      setProfileData((prevState) => ({
        ...prevState,
        ...userDetails,
      }));
      setAvatarSrc(userDetails.avatar_url);
    }
  }, [user]);

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      console.log('New avatar file selected:', file);
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setAvatarFile(file);
      setAvatarSrc(newFile.preview);
    }
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        handleDropSingleFile([file]);
      }
    },
    [handleDropSingleFile],
  );

  const handleChangeUser = useCallback(
    (type, value) => {
      setProfileData((prevState) => ({
        ...prevState,
        [type]: value,
      }));
    },
    [setProfileData],
  );

  const handleSave = async () => {
    setIsLoading(true);
    console.log('Starting save with avatarFile:', avatarFile);
    console.log('Current profileData:', profileData);

    const formattedData = {
      email: profileData?.email || null,
      phone: profileData?.phone || null,
      user_name: profileData?.user_name || null,
      avatar_url: profileData?.avatar_url || null,
      first_name: profileData?.first_name || null,
      last_name: profileData?.last_name || null,
      identification: profileData?.identification || null,
      gender: profileData?.gender || null,
      birthday: profileData?.birthday
        ? new Date(profileData.birthday).toISOString().split('T')[0]
        : null,
      fiscal_id: profileData?.fiscal_id || null,
    };

    try {
      if (avatarFile) {
        console.log('Uploading avatar file...');
        const media_url = await uploadPersonalMedia(avatarFile);
        console.log('Uploaded avatar, received mediaId:', media_url);
        formattedData.avatar_url = media_url;
      }

      console.log('Sending formatted data to API:', formattedData);
      const updatedUser = await patchUser(formattedData);
      console.log('Profile updated successfully:', updatedUser);
    } catch (error) {
      console.error('Error during save process:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden">
          {/* Avatar Section */}
          <div className="relative bg-gradient-to-r from-primary to-secondary px-8 py-12">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-background shadow-xl">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-accent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Upload className="w-8 h-8 text-background" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-background">
                {profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : 'Your Name'}
              </h2>
              <p className="text-background/90">{profileData.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name || ''}
                    onChange={(e) => handleChangeUser('first_name', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name || ''}
                    onChange={(e) => handleChangeUser('last_name', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={profileData.user_name || ''}
                    onChange={(e) => handleChangeUser('user_name', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={profileData.gender || ''}
                    onChange={(e) => handleChangeUser('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  Contact Information
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email || ''}
                    onChange={(e) => handleChangeUser('email', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleChangeUser('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Birthday</label>
                  <input
                    type="date"
                    value={profileData.birthday || ''}
                    onChange={(e) => handleChangeUser('birthday', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Identification
                  </label>
                  <input
                    type="text"
                    value={profileData.identification || ''}
                    onChange={(e) => handleChangeUser('identification', e.target.value)}
                    className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 rounded-lg font-semibold shadow-lg hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save & Close</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
