import { useTheme, alpha } from '@mui/material/styles';
import { useState, memo } from 'react';
import { useHistory } from 'react-router-dom';

import { chipCategories } from './create/chipData';
import TextAreaWithButtons from './create/TextAreaWithButtons';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useAnalytics } from '../../../hooks/useAnalytics';

/**
 * Track project creation events
 */
const trackCreateProject = (projectData, analytics) => {
  try {
    const properties = {
      has_attachments: projectData.hasAttachments || false,
      attachment_count: projectData.attachmentCount || 0,
      has_github_integration: projectData.hasGithub || false,
      is_public: projectData.isPublic !== undefined ? projectData.isPublic : true,
      user_authenticated: projectData.userAuthenticated || false,
      prompt_length: projectData.promptLength || 0,
      creation_source: 'dashboard',
    };

    // Track analytics event
    analytics.trackCreateProject(
      projectData.name || 'Untitled Project',
      projectData.type || 'App',
      properties,
    );

    // Track with Google Analytics (existing)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'create_project', {
        project_name: projectData.name || 'Untitled Project',
        project_type: projectData.type || 'App',
        ...properties,
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
  const analytics = useAnalytics();
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

  const handleCreate = async (files, githubData, isPublic = true, customPrompt = null) => {
    // Use custom prompt if provided, otherwise use inputValue
    const promptToUse = customPrompt || inputValue;

    if (!promptToUse.trim()) {
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

        const response = await fetch('https://platform-api.altan.ai/idea', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: resourceName,
            idea: promptToUse,
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
        trackCreateProject(
          {
            name: resourceName,
            type: selectedType,
            hasAttachments: files.length > 0,
            attachmentCount: files.length,
            hasGithub: !!githubData?.url,
            isPublic: isPublic,
            userAuthenticated: false,
            promptLength: promptToUse.length,
          },
          analytics,
        );

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

      const response = await fetch('https://platform-api.altan.ai/idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: resourceName,
          idea: promptToUse,
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
      trackCreateProject(
        {
          name: resourceName,
          type: selectedType,
          hasAttachments: files.length > 0,
          attachmentCount: files.length,
          hasGithub: !!githubData?.url,
          isPublic: isPublic,
          userAuthenticated: true,
          promptLength: promptToUse.length,
        },
        analytics,
      );

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateAnything);
