/* global console, fetch, window, document, setTimeout, navigator */
(async function() {
  'use strict';

  // Widget configuration
  const WIDGET_CONFIG = {
    API_BASE_URL: 'https://api.altan.ai/platform/guest',
    ROOM_BASE_URL: 'https://www.altan.ai/r'
  };

  let scriptTag = document.currentScript;
  let messageBoxes = [];
  let replyButtons = [];
  let chatOpened = false;
  let messageBoxesCalled = false;
  let theme = 'light';
  let brand_color = '#6989E9';
  let avatar;
  let replyBox;
  let agentId = scriptTag?.getAttribute('altan-agent-id') || scriptTag?.id;
  let CHAT_BUTTON_SIZE = 50;
  let TOOLBAR_BUTTON_SIZE = 30;
  let CHAT_BUTTON_RADIUS = 30;
  let CHAT_BUTTON_BACKGROUND_COLOR = "transparent";
  let browserLanguage = "en";

  const getSpaceTranslation = (space, lang) => {
    const shortLang = lang.substring(0, 2).toUpperCase();
    const translation = space.meta_data?.translations?.[shortLang];
    const capTranslation = !!translation && (translation.charAt(0).toUpperCase() + translation.slice(1));
    return capTranslation || space.name;
  };

  const CHAT_TOOLBAR_CLOSE_ICON = (theme) => `
  <svg xmlns="http://www.w3.org/2000/svg" fill="${theme === 'light' ? '#363636' : '#fff'}" viewBox="0 0 24 24" width="24" height="24">
    <path transform="translate(-0.5, -0.5) scale(1.02, 1.02)" stroke-linecap="round" stroke-linejoin="round" d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
  </svg>
  `;

  const CHAT_BUBBLE_PRO = (brand_color) => `
  <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="24" fill="${brand_color}"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M36 35.6967C36 35.8403 35.8548 35.9385 35.7221 35.8837C34.828 35.5145 31.9134 34.3491 28.9961 33.5988H15.8234C14.2638 33.5988 13 32.4254 13 30.9786V15.6195C13 14.1735 14.2638 13 15.8234 13H33.1749C34.7346 13 35.9992 14.1735 35.9992 15.6195L36 35.6967Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.1336 21.2332C15.417 21.5924 15.0331 21.7849 15.0014 20.9346C14.9434 19.3815 16.7518 18.0688 19.0404 18.0026C21.3291 17.9364 23.2313 19.1418 23.2893 20.695C23.3234 21.6084 22.4804 21.3555 21.3147 21.0056C20.4984 20.7606 19.5238 20.4681 18.5812 20.4954C17.5455 20.5254 16.7259 20.9362 16.1336 21.2332Z" fill="${brand_color}"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M32.56 21.2904C33.2766 21.6497 33.6605 21.8421 33.6922 20.9919C33.7502 19.4388 31.9418 18.126 29.6532 18.0599C27.3646 17.9937 25.4623 19.1991 25.4043 20.7522C25.3702 21.6657 26.2132 21.4127 27.3789 21.0629C28.1953 20.8179 29.1698 20.5254 30.1124 20.5526C31.1481 20.5826 31.9677 20.9935 32.56 21.2904Z" fill="${brand_color}"/>
  </svg>`;

  const scaleUp = (id) => {
    const element = document.getElementById(id);
    if (element) element.style.transform = "scale(1.1)";
  };

  const scaleDown = (id) => {
    const element = document.getElementById(id);
    if (element) element.style.transform = "scale(1)";
  };

  function addAnimationStyle() {
    const oldStyle = document.getElementById("chatStyle");
    if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);

    const style = document.createElement("style");
    style.id = "chatStyle";
    style.textContent = `
    .chat {
      transform-origin: bottom right;
    }

    .chat-show-animation {
      animation: chatShow 0.5s cubic-bezier(0.3, 0.1, 0.3, 1.3) forwards;
    }

    .chat-hide-animation {
      animation: chatHide 0.5s cubic-bezier(0.3, 0.1, 0.3, 1.3) forwards;
    }

    @keyframes chatShow {
      0% {
        opacity: 0;
        width: 0;
        height: 0;
      }
      100% {
        opacity: 1;
        height: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100dvh' : 'calc(100vh - 64px)'};
        maxHeight: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100dvh' : '750px'};
        width: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100vw' : '400px'};
        transition: width 200ms ease 0s, height 200ms ease 0s, max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s;
      }
    }

    @keyframes chatHide {
      0% {
        opacity: 1;
        height: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100dvh' : 'calc(100vh - 64px)'};
        maxHeight: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100dvh' : '750px'};
        width: ${window.innerWidth >= 0 && window.innerWidth <= 500 ? '100vw' : '400px'};
        transition: width 200ms ease 0s, height 200ms ease 0s, max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s;
      }
      10% {
        opacity: 0.9;
      }
      100% {
        opacity: 0;
        width: 0;
        height: 0;
      }
    }

    @keyframes bubble-animation {
      0% {
        box-shadow: 0 0 0 rgba(0, 0, 0, 0.6);
      }
      50% {
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
      }
      100% {
        box-shadow: 0 0 0 rgba(0, 0, 0, 0.6);
      }
    }

    @keyframes fadeIn {
      0% {opacity: 0;}
      100% {opacity: 1;}
    }
    `;
    document.head.appendChild(style);
  }

  function createMessageWrapper() {
    const messagesWrapper = document.createElement('div');
    messagesWrapper.style.position = 'fixed';
    messagesWrapper.style.bottom = `${CHAT_BUTTON_SIZE + 30}px`;
    messagesWrapper.style.right = '25px';
    messagesWrapper.style.width = '250px';
    messagesWrapper.style.display = 'flex';
    messagesWrapper.style.flexDirection = 'column';
    messagesWrapper.style.gap = '3px';
    messagesWrapper.style.zIndex = '999999996';
    return messagesWrapper;
  }

  function createSendIcon() {
    const sendIcon = document.createElement('svg');
    sendIcon.style.margin = '0';
    sendIcon.style.paddingTop = '5px';
    sendIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    sendIcon.setAttribute('width', '24');
    sendIcon.setAttribute('height', '24');
    sendIcon.setAttribute('viewBox', '0 0 24 24');
    sendIcon.innerHTML = '<path fill="currentColor" fill-rule="evenodd" d="M3.402 6.673c-.26-2.334 2.143-4.048 4.266-3.042l11.944 5.658c2.288 1.083 2.288 4.339 0 5.422L7.668 20.37c-2.123 1.006-4.525-.708-4.266-3.042L3.882 13H12a1 1 0 1 0 0-2H3.883l-.48-4.327Z" clip-rule="evenodd"/>';
    return sendIcon;
  }

  function createMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.style.flex = '1';
    messageBox.style.borderRadius = '10px';
    messageBox.style.border = 'none';
    messageBox.style.padding = '10px 20px';
    messageBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    messageBox.style.fontSize = '13px';
    messageBox.style.fontFamily = 'helvetica, sans-serif';
    messageBox.style.color = 'black';
    messageBox.style.cursor = 'pointer';
    messageBox.style.transition = 'background-color 0.3s';
    messageBox.textContent = message;
    return messageBox;
  }

  function createMessageContainer() {
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.justifyContent = 'flex-end';
    messageContainer.style.marginBottom = '10px';
    messageContainer.style.animation = 'fadeIn 0.5s';
    return messageContainer;
  }

  function createCloseButtonIcon() {
    const closeButtonIcon = document.createElement("div");
    closeButtonIcon.style.display = "flex";
    closeButtonIcon.style.alignItems = "center";
    closeButtonIcon.style.justifyContent = "center";
    closeButtonIcon.style.width = "100%";
    closeButtonIcon.style.height = "100%";
    closeButtonIcon.innerHTML = CHAT_TOOLBAR_CLOSE_ICON(theme);
    return closeButtonIcon;
  }

  function createCloseButton() {
    const closeButton = document.createElement("button");
    closeButton.setAttribute("id", "toolbar-close-button");
    closeButton.setAttribute("onclick", "void(0)");
    closeButton.style.touchAction = "manipulation";
    closeButton.style.width = `${TOOLBAR_BUTTON_SIZE}px`;
    closeButton.style.height = `${TOOLBAR_BUTTON_SIZE}px`;
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.style.transition = "all .2s ease-in-out";
    closeButton.style.padding = "5px";
    closeButton.style.border = "none";
    closeButton.style.outline = "0";
    closeButton.style.boxShadow = "none";
    const closeButtonIcon = createCloseButtonIcon();
    closeButton.appendChild(closeButtonIcon);
    return closeButton;
  }

  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.setAttribute("onclick", "void(0)");
    toolbar.setAttribute("id", "chat-bubble-toolbar");
    toolbar.style.touchAction = "manipulation";
    toolbar.style.display = "flex";
    toolbar.style.justifyContent = "flex-end";
    toolbar.style.alignItems = "center";
    toolbar.style.padding = "5px";
    toolbar.style.position = "absolute";
    toolbar.style.top = "0";
    toolbar.style.right = "0";
    toolbar.style.width = "65px";
    toolbar.style.height = "55px";
    toolbar.style.backgroundColor = "transparent";
    return toolbar;
  }

  function createChat() {
    const chat = document.createElement("div");
    chat.setAttribute("id", "chat-bubble-window");
    chat.style.position = "fixed";
    chat.style.flexDirection = "column";
    chat.style.justifyContent = "space-between";
    chat.style.bottom = "25px";
    chat.style.right = "25px";
    chat.style.width = "400px";
    chat.style.height = "calc(100vh - 64px)";
    chat.style.display = "none";
    chat.style.borderRadius = "16px";
    chat.style.zIndex = "999999998";
    chat.style.overflow = "hidden";
    chat.style.willChange = "opacity, height, width";
    document.body.appendChild(chat);
    return chat;
  }

  function createChatButton() {
    const chatButton = document.createElement("div");
    chatButton.setAttribute("id", "chat-bubble-button");
    chatButton.style.position = "fixed";
    chatButton.style.bottom = "25px";
    chatButton.style.right = "25px";
    chatButton.style.width = `${CHAT_BUTTON_SIZE}px`;
    chatButton.style.height = `${CHAT_BUTTON_SIZE}px`;
    chatButton.style.borderRadius = `${CHAT_BUTTON_RADIUS}px`;
    chatButton.style.backgroundColor = CHAT_BUTTON_BACKGROUND_COLOR;
    chatButton.style.cursor = "pointer";
    chatButton.style.zIndex = "999999997";
    chatButton.style.transition = "all .2s ease-in-out";
    chatButton.style.animation = "bubble-animation 4s steps(18,end)";
    
    chatButton.addEventListener("mouseenter", () => {
      chatButton.style.transform = "scale(1.05)";
    });

    chatButton.addEventListener("mouseleave", () => {
      chatButton.style.transform = "scale(1)";
    });
    return chatButton;
  }

  function createChatButtonIcon() {
    const chatButtonIcon = document.createElement("div");
    chatButtonIcon.style.display = "flex";
    chatButtonIcon.style.alignItems = "center";
    chatButtonIcon.style.justifyContent = "center";
    chatButtonIcon.style.width = "100%";
    chatButtonIcon.style.height = "100%";
    chatButtonIcon.style.zIndex = "999999997";
    return chatButtonIcon;
  }

  function createReplyButton(theme, text, isClicked, replyButtonColor, onClick) {
    const replyButton = document.createElement('button');
    replyButton.style.display = "inline-block";
    replyButton.style.width = "fit-content";
    replyButton.style.textTransform = "none";
    replyButton.style.textAlign = "left";
    replyButton.style.background = theme === 'light' ? 'rgb(229, 238, 255)' : '#212b36';
    replyButton.style.color = replyButtonColor || "#3f87f5";
    replyButton.style.lineHeight = "18px";
    replyButton.style.padding = "11px";
    replyButton.style.fontSize = "14px";
    replyButton.style.border = "none";
    replyButton.style.borderRadius = "10px";
    replyButton.style.fontFamily = 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
    replyButton.style.textRendering = "optimizeLegibility";
    replyButton.style.webkitFontSmoothing = "antialiased";
    replyButton.style.willChange = "opacity, transform";
    replyButton.style.transition = "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
    replyButton.style.transform = isClicked ? 'scale(1.05)' : 'scale(1)';
    replyButton.style.zIndex = "99999";
    replyButton.style.cursor = "pointer";
    replyButton.textContent = text;

    replyButton.addEventListener('mousedown', function () {
      this.style.transform = 'scale(0.95)';
    });

    replyButton.addEventListener('mouseup', function () {
      this.style.transform = 'scale(1)';
    });

    replyButton.addEventListener('mouseover', function () {
      this.style.background = "rgb(204, 221, 255)";
      this.style.outline = "none";
      this.style.border = "none";
    });

    replyButton.addEventListener('mouseout', function () {
      this.style.background = theme === 'light' ? 'rgb(229, 238, 255)' : '#212b36';
    });

    replyButton.addEventListener('focus', function () {
      this.style.outline = "none";
      this.style.border = "none";
    });

    replyButton.addEventListener('blur', function () {
      this.style.outline = "none";
      this.style.border = "none";
    });

    if (onClick) {
      replyButton.addEventListener('click', onClick);
    }

    return replyButton;
  }

  function createReplyBox() {
    const newReplyBox = document.createElement('div');
    newReplyBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    newReplyBox.style.display = 'flex';
    newReplyBox.style.alignItems = 'center';
    newReplyBox.style.justifyContent = 'space-between';
    newReplyBox.style.color = 'black';
    newReplyBox.style.padding = '10px 20px';
    newReplyBox.style.borderRadius = '10px 10px 10px 10px';
    newReplyBox.style.textAlign = 'left';
    newReplyBox.style.fontSize = '15px';
    newReplyBox.style.cursor = 'pointer';
    newReplyBox.style.marginBottom = '10px';
    newReplyBox.style.flex = '1';
    newReplyBox.style.fontFamily = 'helvetica, sans-serif';
    newReplyBox.textContent = 'Ask anything...';
    return newReplyBox;
  }

  function createAvatar() {
    const newAvatar = document.createElement('img');
    newAvatar.src = 'https://storage.googleapis.com/logos-chatbot-optimai/Z.png';
    newAvatar.alt = 'Altan Chatbot Icon';
    newAvatar.height = 40;
    newAvatar.width = 40;
    newAvatar.style.marginRight = '10px';
    return newAvatar;
  }

  // API Functions
  function generateExternalId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async function createGuestRoom(guestData) {
    const url = `${WIDGET_CONFIG.API_BASE_URL}/room?agent_id=${agentId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  }

  // Initialize Widget
  addAnimationStyle();
  const chatButton = createChatButton();
  const chatButtonIcon = createChatButtonIcon();
  chatButtonIcon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
  chatButton.appendChild(chatButtonIcon);

  window.addEventListener('resize', addAnimationStyle);

  function onAnimationEnd() {
    chat.classList.remove("chat-show-animation");
    chat.classList.remove("chat-hide-animation");
    chat.removeEventListener("animationend", onAnimationEnd);

    if (chat.style.display === "none") {
      chat.style.display = "flex";
      chat.classList.add("chat-show-animation");
    } else {
      chat.style.display = "none";
    }
  }

  async function openChat(fromReplyButton) {
    messageBoxes.forEach(box => box.remove());
    messageBoxes = [];

    replyButtons.forEach(button => button.remove());
    replyButtons = [];

    if (avatar) {
      avatar.remove();
      avatar = null;
    }
    if (replyBox) {
      replyBox.remove();
      replyBox = null;
    }

    chatOpened = true;

    try {
      // Create guest room
      const roomData = await createGuestRoom({
        external_id: generateExternalId(),
        guest_id: '',
        first_name: 'Anonymous',
        last_name: 'Visitor',
        email: `visitor_${Date.now()}@anonymous.com`,
        phone: ''
      });

      // Update iframe with room data
      const iframeElement = document.getElementById("widget-agent-bubble-window");
      if (iframeElement) {
        iframeElement.src = `${WIDGET_CONFIG.ROOM_BASE_URL}/${roomData.room_id}?guest_id=${roomData.guest.id}&agent_id=${agentId}`;
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }

    onAnimationEnd();
  }

  function closeChat() {
    chat.classList.add("chat-hide-animation");
    chat.addEventListener("animationend", onAnimationEnd);
    if (avatar) {
      avatar.remove();
      avatar = null;
    }
    if (replyBox) {
      replyBox.remove();
      replyBox = null;
    }
  }

  chatButton.addEventListener("click", () => {
    if (chat.style.display === "none") {
      openChat();
    } else {
      closeChat();
    }
  });

  const chat = createChat();
  const toolbar = createToolbar();
  const closeButton = createCloseButton();

  function handleChatWindowSizeChange() {
    const windowWidth = window.innerWidth;
    const chatDiv = document.getElementById("chat-bubble-window");
    if (!chatDiv) return;
    
    let styleSettings;

    if (windowWidth >= 0 && windowWidth <= 600) {
      styleSettings = {
        width: '100%',
        height: '100%',
        bottom: "0",
        right: "0",
        borderRadius: "0",
        overflow: "hidden",
        zIndex: "2147483001"
      };
    } else {
      styleSettings = {
        width: "400px",
        height: "calc(100vh - 64px)",
        maxHeight: "780px",
        bottom: "25px",
        right: "25px",
        borderRadius: "1.25rem"
      };
    }

    Object.keys(styleSettings).forEach((key) => {
      chatDiv.style[key] = styleSettings[key];
    });
  }

  toolbar.appendChild(closeButton);
  chat.appendChild(toolbar);

  chat.innerHTML += `<iframe
    allow="fullscreen 'self'; clipboard-write"
    id="widget-agent-bubble-window"
    name="Altan-App"
    src=""
    width="100%"
    height="100%"
    frameborder="0"
  ></iframe>
  `;

  document.body.appendChild(chat);
  document.body.appendChild(chatButton);

  // Update chat size whenever the window size changes
  window.addEventListener("resize", handleChatWindowSizeChange);
  handleChatWindowSizeChange();

  function handleCloseButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();
    closeChat();
  }

  // Event listeners and message handling
  (function () {
    const closeButton = document.getElementById("toolbar-close-button");
    if (closeButton) {
      closeButton.addEventListener("click", handleCloseButtonClick);
      closeButton.addEventListener("touchstart", () => scaleUp("toolbar-close-button"), { passive: true });
      closeButton.addEventListener("touchend", () => scaleDown("toolbar-close-button"), { passive: true });
      closeButton.addEventListener("mouseenter", () => scaleUp("toolbar-close-button"), { passive: true });
      closeButton.addEventListener("mouseleave", () => scaleDown("toolbar-close-button"), { passive: true });
      closeButton.addEventListener("pointerenter", () => scaleUp("toolbar-close-button"), { passive: true });
      closeButton.addEventListener("pointerleave", () => scaleDown("toolbar-close-button"), { passive: true });
    }

    const handleEvent = (event) => {
      const userAgent = navigator.userAgent;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      browserLanguage = navigator.language || navigator.userLanguage;

      switch (event.data.type) {
        case 'close_bubble':
          closeChat();
          break;

        case 'requestParentUrl':
          event.source.postMessage({
            type: 'parentUrl',
            url: window.location.href,
            userAgent,
            width: screenWidth,
            height: screenHeight,
            language: browserLanguage
          }, event.origin);
          break;

        case 'COPY_TO_CLIPBOARD':
          navigator.clipboard.writeText(event.data.text);
          break;

        case 'chatbotMetaData':
          handleChatbotMetadata(event.data);
          break;
      }
    };

    const handleChatbotMetadata = (data) => {
      const initialMessages = data?.meta_data?.initial_msg
        ? data.meta_data.initial_msg.split(';')
        : [];
      const spaces = data?.meta_data?.space?.children?.spaces || [];
      const ui = data.meta_data?.meta_data?.ui;
      theme = ui?.theme ? ui.theme.toLowerCase() : 'light';
      brand_color = ui?.brand_color || brand_color;
      chatButtonIcon.innerHTML = CHAT_BUBBLE_PRO(brand_color);
      
      if (spaces && spaces.length > 0 && !chatOpened && !messageBoxesCalled) {
        handleReplyButtons({ spaces: spaces, replyButtonColor: brand_color });
      }
      if (initialMessages && initialMessages.length > 0 && !chatOpened) {
        handleInitialMessages({ messages: initialMessages });
      }
    };

    const handleReplyButtons = (data) => {
      messageBoxesCalled = true;
      const replyButtonsData = data.spaces;
      const replyButtonColor = data.replyButtonColor;
      const messagesWrapper = createMessageWrapper();
      document.body.appendChild(messagesWrapper);
      
      replyButtonsData.forEach((space, i) => {
        let index = i;
        setTimeout(() => {
          const messageContainer = createMessageContainer();
          const messageBox = createReplyButton(theme, getSpaceTranslation(space.child, browserLanguage), false, replyButtonColor, (e) => {
            e.stopPropagation();
            openChat(true);
          });

          messageContainer.appendChild(messageBox);
          messagesWrapper.appendChild(messageContainer);
          messageBoxes.push(messageBox);
        }, 250 + 1500 * index);
      });
    };

    const handleInitialMessages = (data) => {
      const messages = data.messages;
      const nonEmptyMessages = messages.filter((message) => message.trim().length > 0);
      const messagesWrapper = createMessageWrapper();
      document.body.appendChild(messagesWrapper);

      nonEmptyMessages.forEach((message, i) => {
        setTimeout(() => {
          const messageContainer = createMessageContainer();
          avatar = createAvatar();
          const messageBox = createMessageBox(message);

          messageBox.addEventListener('click', () => openChat());
          messageContainer.appendChild(avatar);
          messageContainer.appendChild(messageBox);
          messagesWrapper.appendChild(messageContainer);
          messageBoxes.push(messageBox);
        }, 500 + 1500 * i);
      });

      if (nonEmptyMessages.length > 0) {
        setTimeout(() => {
          replyBox = createReplyBox();
          replyBox.addEventListener('click', () => openChat());
          const sendIcon = createSendIcon();
          replyBox.appendChild(sendIcon);
          messagesWrapper.appendChild(replyBox);
        }, 1000 + 1500 * nonEmptyMessages.length + 100);
      }
    };

    window.addEventListener('message', handleEvent);
  })();

})(); 