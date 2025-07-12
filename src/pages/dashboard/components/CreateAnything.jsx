import { useTheme, alpha } from '@mui/material/styles';
import { useState, memo } from 'react';
import { useHistory } from 'react-router-dom';

import { chipCategories } from './create/chipData';
import TextAreaWithButtons from './create/TextAreaWithButtons';
import { useAuthContext } from '../../../auth/useAuthContext';

/**
 * Track project creation events
 */
const trackCreateProject = (projectData) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'create_project', {
        project_name: projectData.name || 'Untitled Project',
        project_type: projectData.type || 'App',
        has_attachments: projectData.hasAttachments || false,
        attachment_count: projectData.attachmentCount || 0,
        has_github_integration: projectData.hasGithub || false,
        is_public: projectData.isPublic !== undefined ? projectData.isPublic : true,
        user_authenticated: projectData.userAuthenticated || false,
        prompt_length: projectData.promptLength || 0,
        creation_source: 'dashboard',
      });
    }
  } catch (error) {
    console.error('Error tracking project creation:', error);
  }
};

function CreateAnything({ handleVoice }) {
  const theme = useTheme();
  const history = useHistory();
  const { isAuthenticated } = useAuthContext();
  const [inputValue, setInputValue] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('App');
  const [selectedIcon, setSelectedIcon] = useState(
    'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentUseCaseIndex, setCurrentUseCaseIndex] = useState(0);

  // Chip handling functions
  const handleChipClick = (useCase) => {
    setInputValue(useCase.prompt);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentUseCaseIndex(0); // Reset to first set of use cases
  };

  const handleCloseCategoryView = () => {
    setSelectedCategory(null);
    setCurrentUseCaseIndex(0);
  };

  const getCurrentUseCases = () => {
    const selectedCat = chipCategories.find((cat) => cat.id === selectedCategory);
    if (selectedCat) {
      return selectedCat.useCases.slice(currentUseCaseIndex, currentUseCaseIndex + 5);
    }
    return [];
  };

  const handleCreate = async (files, githubData, isPublic = true) => {
    if (!inputValue.trim()) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Create the idea first to get an ID, then redirect to signup
      setLoading(true);
      try {
        const attachments = await Promise.all(
          files.map(async (file) => {
            // Get file extension from the file type
            const fileType = file.file.type;
            const extension = fileType.split('/')[1] || fileType.split('.').pop() || 'bin';
            return {
              file_name: file.name || `file.${extension}`,
              mime_type: fileType,
              file_content: file.url.split(',')[1],
            };
          }),
        );

        const response = await fetch('https://api.altan.ai/platform/idea', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: resourceName,
            idea: inputValue,
            icon: selectedIcon,
            attachments,
            is_public: isPublic,
            // Include GitHub data if provided
            ...(githubData?.url && {
              github_url: githubData.url,
              branch: githubData.branch || 'main',
            }),
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Track project creation for non-authenticated users
        trackCreateProject({
          name: resourceName,
          type: selectedType,
          hasAttachments: files.length > 0,
          attachmentCount: files.length,
          hasGithub: !!githubData?.url,
          isPublic: isPublic,
          userAuthenticated: false,
          promptLength: inputValue.length,
        });

        // Redirect to signup with the idea ID
        history.push(`/auth/register?idea=${data.id}`);
      } catch (error) {
        console.error('Error creating idea:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const attachments = await Promise.all(
        files.map(async (file) => {
          // Get file extension from the file type
          const fileType = file.file.type;
          const extension = fileType.split('/')[1] || fileType.split('.').pop() || 'bin';
          return {
            file_name: file.name || `file.${extension}`,
            mime_type: fileType,
            file_content: file.url.split(',')[1],
          };
        }),
      );

      const response = await fetch('https://api.altan.ai/platform/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: resourceName,
          idea: inputValue,
          icon: selectedIcon,
          attachments,
          is_public: isPublic,
          // Include GitHub data if provided
          ...(githubData?.url && {
            github_url: githubData.url,
            branch: githubData.branch || 'main',
          }),
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Track project creation for authenticated users
      trackCreateProject({
        name: resourceName,
        type: selectedType,
        hasAttachments: files.length > 0,
        attachmentCount: files.length,
        hasGithub: !!githubData?.url,
        isPublic: isPublic,
        userAuthenticated: true,
        promptLength: inputValue.length,
      });

      history.push(`/?idea=${data.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto">
      <div className="text-center">
        <div
          data-aos="fade-down"
          data-aos-delay="200"
        >
          <div className="relative flex flex-col mt-2">
            <TextAreaWithButtons
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleCreate={handleCreate}
              loading={loading}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              resourceName={resourceName}
              setResourceName={setResourceName}
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
              handleVoice={handleVoice}
            />

            <div
              className="mt-4 space-y-3"
              data-chips-area
            >
              {!selectedCategory ? (
                /* Categories View */
                <div className="flex flex-wrap gap-2 justify-center">
                  {chipCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        backgroundColor: alpha(theme.palette.grey[500], 0.08),
                        color: theme.palette.text.primary,
                        border: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.grey[500], 0.16),
                        },
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.16);
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = alpha(theme.palette.grey[500], 0.08);
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                /* Category Detail View */
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                  {/* Header with Category Name and Controls */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {chipCategories.find((cat) => cat.id === selectedCategory)?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* <button
                        onClick={handleRefreshUseCases}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Show next 5 ideas"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button> */}
                      <button
                        onClick={handleCloseCategoryView}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Back to categories"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600 dark:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Use Cases List */}
                  <div className="space-y-2">
                    {getCurrentUseCases().map((useCase, index) => (
                      <button
                        key={`${selectedCategory}-${currentUseCaseIndex}-${index}`}
                        onClick={() => handleChipClick(useCase)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200 text-left transform hover:scale-[1.02] group"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
                          {useCase.title}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-200 opacity-0 group-hover:opacity-100 ml-auto transform translate-x-2 group-hover:translate-x-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateAnything);
