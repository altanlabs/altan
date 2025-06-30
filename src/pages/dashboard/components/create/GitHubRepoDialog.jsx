import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * GitHub Repository Dialog Component
 *
 * Provides a dialog for users to enter their GitHub repository URL, branch, and token
 * Validates the inputs and shows important information about repository access
 */
function GitHubRepoDialog({ open, onClose, onAdd }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setRepoUrl('');
    setBranch('main');
    setToken('');
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    // Basic GitHub URL validation
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Check if URL looks like a GitHub repo URL
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    if (!githubUrlPattern.test(repoUrl)) {
      setError(
        'Please enter a valid GitHub repository URL (https://github.com/username/repository)',
      );
      return;
    }

    // Add repo and close dialog
    onAdd({ repoUrl, branch, token });
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Icon
              icon="mdi:github"
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add GitHub Repository
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            <Icon
              icon="mdi:close"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Repository URL */}
            <div>
              <label
                htmlFor="repo-url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                GitHub Repository URL
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:github"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5"
                />
                <input
                  type="url"
                  id="repo-url"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="https://github.com/username/repository"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                />
              </div>
              {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            {/* Branch */}
            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Branch
              </label>
              <input
                type="text"
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* GitHub Token */}
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                GitHub Token (for private repositories)
              </label>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Icon
              icon="mdi:check"
              className="w-4 h-4"
            />
            Add Repository
          </button>
        </div>
      </div>
    </div>
  );
}

GitHubRepoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default GitHubRepoDialog;
