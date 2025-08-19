import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import AutopilotUpgradeDialog from './AutopilotUpgradeDialog';
import GitHubRepoDialog from './GitHubRepoDialog';
import { TextShimmer } from '../../../../components/aceternity/text/text-shimmer';
import { selectIsAccountFree } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store';
import UpgradeDialog from '../../../../components/dialogs/UpgradeDialog';

// Helper function to get the appropriate icon based on file type
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return 'mdi:image';
  if (type.startsWith('video/')) return 'mdi:video';
  if (type.startsWith('audio/')) return 'mdi:music';
  if (type.includes('pdf')) return 'mdi:file-pdf';
  if (type.includes('word')) return 'mdi:file-word';
  if (type.includes('excel')) return 'mdi:file-excel';
  return 'mdi:file-document';
};

function TextAreaWithButtons({
  inputValue,
  setInputValue,
  handleCreate,
  loading,
  handleVoice,
  showPlusButton = true,
  showAutopilotButton = false,
}) {
  const isAccountFree = useSelector(selectIsAccountFree);
  const history = useHistory();

  // Add new state and refs for file attachments
  const [attachments, setAttachments] = useState([]);
  const [githubRepo, setGithubRepo] = useState(null);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // Default to public
  const [visibilityMenuOpen, setVisibilityMenuOpen] = useState(false);
  const [autopilotEnabled, setAutopilotEnabled] = useState(!isAccountFree);
  const [autopilotUpgradePopup, setAutopilotUpgradePopup] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Menu states
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const plusButtonRef = useRef(null);
  const plusMenuRef = useRef(null);
  const visibilityButtonRef = useRef(null);
  const visibilityMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        plusMenuOpen &&
        plusButtonRef.current &&
        !plusButtonRef.current.contains(event.target) &&
        plusMenuRef.current &&
        !plusMenuRef.current.contains(event.target)
      ) {
        setPlusMenuOpen(false);
      }
      if (
        visibilityMenuOpen &&
        visibilityButtonRef.current &&
        !visibilityButtonRef.current.contains(event.target) &&
        visibilityMenuRef.current &&
        !visibilityMenuRef.current.contains(event.target)
      ) {
        setVisibilityMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [plusMenuOpen, visibilityMenuOpen]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const handleFileAdd = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments((prev) => [
          ...prev,
          {
            url: e.target.result,
            file,
            type: file.type,
            name: file.name,
          },
        ]);
        // Clear the input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Add new image handling functions
  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of items) {
        const file = item.getAsFile();
        if (file) {
          handleFileAdd(file);
        }
      }
    },
    [handleFileAdd],
  );

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRepository = ({ repoUrl, branch, token }) => {
    // Only store a single GitHub repository (replacing any previous one)
    setGithubRepo({ url: repoUrl, branch, token });
  };

  const handleRemoveRepository = () => {
    setGithubRepo(null);
  };

  // Modified handleSubmit to include the GitHub repository as github_url, isPublic flag, and autopilot mode
  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    let finalPrompt = inputValue.trim();

    // Append autopilot mode text to the prompt when enabled
    if (autopilotEnabled) {
      finalPrompt +=
        '\n\n<hide>Create the plan, once the plan is define: execute the plan starting from step 1 until the last step. Do not stop the plan execution until the last step is completed. You can only stop the plan execution if you encounter a critical error, then prompt the user.</hide>';
    }

    // Append free account prompt when user is on free plan
    if (isAccountFree) {
      finalPrompt +=
        "\n\n<hide> The user is not testing the Altan platform. You're goal is to optimize for protoype interface UI/UX quick. and when interface is finished, sell altan super well and explain to him how altan databases, workflows and ai agents can take him to the next level. Once he activates he'll have more credits so you should send some funny messages how hungry you are for credits and that he should take the $1 and get $25 in credits to build the incredible project idea that he has. Because the idea is good and we can help him make it happen TODAY!</hide>";
    }

    // Pass the final prompt directly to handleCreate
    handleCreate(attachments, githubRepo || null, isPublic, finalPrompt);
  };

  return (
    <div className="relative">
      <div className="w-full px-4 pt-3 pb-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary shadow-lg bg-white dark:bg-[#1c1c1c]">
        {/* Attachments Preview Section */}
        {attachments.length > 0 && (
          <div className="flex gap-2 items-center mb-2 overflow-x-auto scrollbar-hide">
            {attachments.map((attachment, index) => (
              <div
                key={`attachment-${index}`}
                className={`relative group flex-shrink-0 ${!attachment.type.startsWith('image/') ? 'bg-gray-100 dark:bg-gray-800 p-2' : ''} rounded-md flex items-center gap-2`}
              >
                {attachment.type.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded-md"
                  />
                ) : (
                  <>
                    <Icon
                      icon={getFileIcon(attachment.type)}
                      className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    />
                    <span className="text-xs text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                      {attachment.name}
                    </span>
                  </>
                )}
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className={`absolute ${attachment.type.startsWith('image/') ? '-top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full' : 'ml-1 text-red-500'} opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Icon
                    icon="mdi:close"
                    className="w-3 h-3"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Repository Preview Section */}
        {githubRepo && (
          <div className="flex gap-2 items-center mb-2 overflow-x-auto scrollbar-hide">
            <div className="relative group flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md p-2 flex items-center gap-2">
              <Icon
                icon="mdi:github"
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
              />
              <span className="text-xs text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                {typeof githubRepo?.url === 'string'
                  ? githubRepo.url.replace('https://github.com/', '')
                  : 'Invalid URL'}
              </span>
              <button
                onClick={handleRemoveRepository}
                className="ml-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon
                  icon="mdi:close"
                  className="w-3 h-3"
                />
              </button>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="w-full bg-transparent min-h-[24px] max-h-[200px] focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-500/80 resize-none mb-1"
          placeholder={'Describe your next idea...'}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustTextareaHeight();
          }}
          onPaste={handlePaste}
        />

        {/* Buttons section - now positioned below textarea instead of overlapping */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Plus button */}
            {showPlusButton && (
              <div className="relative">
                <button
                  ref={plusButtonRef}
                  onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                  title="Add content"
                >
                  <Icon
                    icon="mdi:plus"
                    className="w-5 h-5 text-slate-700 dark:text-white"
                  />
                </button>

                {/* Plus menu popup */}
                {plusMenuOpen && (
                  <div
                    ref={plusMenuRef}
                    className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setGithubDialogOpen(true);
                          setPlusMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left w-full"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Icon
                            icon="mdi:github"
                            className="w-4 h-4"
                          />
                        </div>
                        <div>GitHub Repository</div>
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Icon
                            icon="mdi:file-upload-outline"
                            className="w-4 h-4"
                          />
                        </div>
                        <div>Upload files and images</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Public/Private selection */}
            <div className="relative">
              <button
                ref={visibilityButtonRef}
                onClick={() => setVisibilityMenuOpen(!visibilityMenuOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title={isPublic ? 'Public' : 'Workspace'}
              >
                <Icon
                  icon={isPublic ? 'mdi:earth' : 'mdi:lock'}
                  className="w-5 h-5 text-slate-700 dark:text-white"
                />
              </button>

              {visibilityMenuOpen && (
                <div
                  ref={visibilityMenuRef}
                  className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-3">
                    {/* Public option */}
                    <div className="mb-3 hidden sm:block">
                      <div
                        onClick={() => {
                          setIsPublic(true);
                          setVisibilityMenuOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          {isPublic && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:earth"
                            className="w-4 h-4 text-gray-700 dark:text-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Public
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                        Anyone can view and remix
                      </div>
                    </div>

                    {/* Workspace option */}
                    <div>
                      <div
                        onClick={() => {
                          if (isAccountFree) {
                            // Redirect to pricing for free accounts
                            history.push('/pricing');
                            setVisibilityMenuOpen(false);
                            return;
                          }
                          setIsPublic(false);
                          setVisibilityMenuOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          {!isPublic && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:lock"
                            className="w-4 h-4 text-gray-700 dark:text-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Workspace
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded font-medium">
                            Pro
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                        Only visible to members of the workspace
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Autopilot interactive button */}
            {showAutopilotButton && (
              <div className="relative group">
                <button
                  onClick={() => {
                    if (!autopilotEnabled && isAccountFree) {
                      setAutopilotUpgradePopup(true);
                    } else {
                      setAutopilotEnabled(!autopilotEnabled);
                    }
                  }}
                  className={`relative w-32 h-7 cursor-pointer overflow-hidden rounded-full border transition-all duration-300 flex items-center justify-center ${
                    autopilotEnabled
                      ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 border-transparent text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-200 border-slate-300 text-slate-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-slate-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {/* Animated background for hover state when disabled */}
                  {!autopilotEnabled && (
                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:translate-y-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.2] bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 scale-[1]" />
                  )}

                  {/* Default text - only show when not enabled */}
                  {!autopilotEnabled && (
                    <span className="relative z-10 text-xs font-medium transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0 px-4">
                      Pilot
                    </span>
                  )}

                  {/* Enabled/Hover state with icon and gradient text */}
                  <div
                    className={`absolute inset-0 z-20 flex items-center justify-center gap-2 px-3 transition-all duration-300 ${
                      autopilotEnabled
                        ? 'translate-x-0 opacity-100'
                        : 'translate-x-8 opacity-0 group-hover:-translate-x-1 group-hover:opacity-100'
                    }`}
                  >
                    <Icon
                      icon={autopilotEnabled ? 'mdi:lightning-bolt' : 'mdi:lightning-bolt-outline'}
                      className={`w-3.5 h-3.5 ${autopilotEnabled ? 'text-white' : 'text-white'}`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        autopilotEnabled ? 'text-white' : 'text-white'
                      }`}
                    >
                      Autopilot
                    </span>
                  </div>

                  {/* Animated gradient overlay for enabled state */}
                  {autopilotEnabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 opacity-100 animate-gradient-x" />
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Autopilot mode will plan your project and execute all steps automatically in the
                  background
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* File Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                handleFileAdd(e.target.files[0]);
                setPlusMenuOpen(false);
              }}
              multiple
            />

            {/* Voice input button */}
            {/* <AIVoiceInput
              ref={voiceInputRef}
              onTranscript={handleTranscript}
            /> */}
            <m.button
              whileTap={{ scale: 0.95 }}
              onClick={!inputValue.trim() ? handleVoice : handleSubmit}
              disabled={loading}
              className={`
                relative inline-flex items-center justify-center
                ${!inputValue.trim() && !loading ? 'w-10 h-10 rounded-full' : 'min-w-[120px] rounded-2xl px-2 py-1'}
                text-base font-medium tracking-tight
                transition-all duration-300 ease-in-out
                backdrop-blur-lg
                text-slate-900 dark:text-slate-100
                shadow-md dark:shadow-lg

                hover:bg-white/90 dark:hover:bg-slate-700/70
                hover:shadow-xl dark:hover:shadow-sm dark:hover:shadow-white/40
                hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-600

                active:scale-[0.97] active:ring-2 active:ring-blue-400/50
                focus:outline-none focus:ring-2 focus:ring-blue-400/50

                bg-white dark:bg-black
                disabled:opacity-40
                disabled:bg-slate-300/70 dark:disabled:bg-slate-700/50
                disabled:text-slate-500 dark:disabled:text-slate-400
                disabled:cursor-not-allowed disabled:shadow-none
              `}
            >
              {/* Voice input when no text */}
              {!inputValue.trim() && !loading && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"></path>
                </svg>
              )}

              {/* Generate button when there is text */}
              {inputValue.trim() && !loading && (
                <>
                  <span className="opacity-100 transition-opacity duration-200">Generate</span>
                  <Icon
                    icon="noto:sparkles"
                    className="ml-2 text-lg transition-opacity duration-300"
                  />
                </>
              )}

              {/* Loading state */}
              {loading && (
                <TextShimmer
                  className="text-md font-medium tracking-tight"
                  duration={2}
                >
                  Generating...
                </TextShimmer>
              )}
            </m.button>
          </div>
        </div>
      </div>

      {/* GitHub Repository Dialog */}
      <GitHubRepoDialog
        open={githubDialogOpen}
        onClose={() => setGithubDialogOpen(false)}
        onAdd={handleAddRepository}
      />

      {/* Autopilot Upgrade Dialog */}
      <UpgradeDialog
        open={autopilotUpgradePopup}
        onClose={() => setAutopilotUpgradePopup(false)}
      />
    </div>
  );
}

export default TextAreaWithButtons;
