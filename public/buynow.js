/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', function() {
  // Get template ID from data attribute or URL parameter
  const getTemplateId = function() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || '';
      if (src.includes('buynow.js')) {
        return scripts[i].getAttribute('data-template-id') || '';
      }
    }
    return '';
  };
  
  const templateId = getTemplateId();
  console.log('Template ID:', templateId); // Debug log
  
  // Create the main container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.gap = '8px';
  container.style.padding = '10px 12px';
  container.style.background = 'rgba(255, 255, 255, 0.95)';
  container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.9)';
  container.style.borderRadius = '24px';
  container.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  container.style.zIndex = '9999';
  container.style.transition = 'all 0.2s ease';
  container.style.border = '1px solid rgba(0, 0, 0, 0.08)';
  
  // Header text
  const headerText = document.createElement('div');
  headerText.textContent = 'We built your webapp';
  headerText.style.fontSize = '14px';
  headerText.style.fontWeight = '600';
  headerText.style.color = '#111';
  headerText.style.marginBottom = '2px';
  container.appendChild(headerText);
  
  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '10px';
  buttonsContainer.style.width = '100%';
  buttonsContainer.style.justifyContent = 'center';
  
  // Buy Now button
  const buyButton = document.createElement('button');
  buyButton.textContent = 'Buy Now';
  buyButton.style.padding = '8px 14px';
  buyButton.style.background = '#000';
  buyButton.style.color = '#fff';
  buyButton.style.border = 'none';
  buyButton.style.borderRadius = '18px';
  buyButton.style.fontSize = '13px';
  buyButton.style.fontWeight = '600';
  buyButton.style.cursor = 'pointer';
  buyButton.style.transition = 'all 0.2s ease';
  buyButton.style.boxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.2)';
  
  buyButton.addEventListener('mouseover', function() {
    buyButton.style.transform = 'translateY(-1px)';
    buyButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
  });
  
  buyButton.addEventListener('mouseout', function() {
    buyButton.style.transform = 'translateY(0)';
    buyButton.style.boxShadow = 'inset 0 1px 1px rgba(255, 255, 255, 0.2)';
  });
  
  buyButton.addEventListener('click', function() {
    if (templateId) {
      window.open(`https://www.altan.ai/template/${templateId}`, '_blank');
    } else {
      console.error('Template ID not found');
      window.open('https://www.altan.ai', '_blank');
    }
  });
  
  // Request Edit button with free mark
  const requestButton = document.createElement('button');
  requestButton.style.position = 'relative';
  requestButton.style.padding = '8px 14px';
  requestButton.style.background = 'rgba(0, 0, 0, 0.06)';
  requestButton.style.color = '#333';
  requestButton.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  requestButton.style.borderRadius = '18px';
  requestButton.style.fontSize = '13px';
  requestButton.style.fontWeight = '500';
  requestButton.style.cursor = 'pointer';
  requestButton.style.transition = 'all 0.2s ease';
  
  // Span for "Request Edit" text
  const requestSpan = document.createElement('span');
  requestSpan.textContent = 'Request Edit';
  requestButton.appendChild(requestSpan);
  
  // Free label
  const freeLabel = document.createElement('span');
  freeLabel.textContent = 'Free';
  freeLabel.style.position = 'absolute';
  freeLabel.style.top = '-7px';
  freeLabel.style.right = '-5px';
  freeLabel.style.background = '#10b981';
  freeLabel.style.color = 'white';
  freeLabel.style.fontSize = '9px';
  freeLabel.style.fontWeight = '700';
  freeLabel.style.padding = '2px 6px';
  freeLabel.style.borderRadius = '10px';
  freeLabel.style.letterSpacing = '0.3px';
  requestButton.appendChild(freeLabel);
  
  requestButton.addEventListener('mouseover', function() {
    requestButton.style.transform = 'translateY(-1px)';
    requestButton.style.background = 'rgba(0, 0, 0, 0.08)';
  });
  
  requestButton.addEventListener('mouseout', function() {
    requestButton.style.transform = 'translateY(0)';
    requestButton.style.background = 'rgba(0, 0, 0, 0.06)';
  });
  
  // Trust stars section
  const trustContainer = document.createElement('div');
  trustContainer.style.display = 'flex';
  trustContainer.style.flexDirection = 'column';
  trustContainer.style.alignItems = 'center';
  trustContainer.style.marginTop = '5px';
  
  // Stars row
  const starsRow = document.createElement('div');
  starsRow.style.display = 'flex';
  starsRow.style.gap = '2px';
  starsRow.style.justifyContent = 'center';
  starsRow.style.width = '100%';
  
  // Add 5 stars
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('div');
    star.innerHTML = '★';
    star.style.color = '#FFB800';
    star.style.fontSize = '13px'; // Bigger stars
    starsRow.appendChild(star);
  }
  
  // Trust text with animated counter
  const trustText = document.createElement('div');
  trustText.style.fontSize = '9px';
  trustText.style.color = '#666';
  trustText.style.marginTop = '2px';
  
  // Create counter span
  const counterSpan = document.createElement('span');
  counterSpan.style.fontWeight = '700';
  counterSpan.style.fontSize = '9px'; // Same as other text
  counterSpan.style.color = '#333';
  
  // Text after counter
  const textAfterCounter = document.createTextNode(' sites built');
  
  // Add elements to trust text
  trustText.appendChild(document.createTextNode('Built over '));
  trustText.appendChild(counterSpan);
  trustText.appendChild(textAfterCounter);
  
  // Animate the counter
  const animateCounter = () => {
    const targetValue = 312000;
    const duration = 4000; // 4 seconds - slower animation
    const startTime = performance.now();
    let currentValue = 0;
    
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    });
    
    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      
      if (elapsedTime < duration) {
        // Use easeOutExpo for a nice animation curve
        const progress = 1 - Math.pow(1 - elapsedTime / duration, 4);
        currentValue = Math.floor(progress * targetValue);
        counterSpan.textContent = formatter.format(currentValue);
        requestAnimationFrame(updateCounter);
      } else {
        counterSpan.textContent = formatter.format(targetValue);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };
  
  // Start the animation when in view
  const observerOptions = {
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          animateCounter();
        }, 300); // Small delay before starting animation
        observer.disconnect();
      }
    });
  }, observerOptions);
  
  observer.observe(container);
  
  trustContainer.appendChild(starsRow);
  trustContainer.appendChild(trustText);
  container.appendChild(trustContainer);
  
  // Add buttons to the buttons container
  buttonsContainer.appendChild(buyButton);
  buttonsContainer.appendChild(requestButton);
  
  // Add the buttons container to the main container
  container.appendChild(buttonsContainer);
  
  // Add the container to the page
  document.body.appendChild(container);
  
  // Create in-place edit request form system
  const createInPlaceEditForm = () => {
    // Hide the buttons and trust container with a fade out
    buttonsContainer.style.transition = 'opacity 0.3s ease';
    buttonsContainer.style.opacity = '0';
    trustContainer.style.transition = 'opacity 0.3s ease';
    trustContainer.style.opacity = '0';
    headerText.style.transition = 'opacity 0.3s ease';
    headerText.style.opacity = '0';
    
    // After fade out, transform container
    setTimeout(() => {
      // Hide original content
      buttonsContainer.style.display = 'none';
      trustContainer.style.display = 'none';
      headerText.style.display = 'none';
      
      // Expand container
      container.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      container.style.width = '300px';
      container.style.alignItems = 'flex-start';
      container.style.padding = '18px';
      
      // Form title
      const formTitle = document.createElement('div');
      formTitle.textContent = 'Request an Edit';
      formTitle.style.fontSize = '16px';
      formTitle.style.fontWeight = '600';
      formTitle.style.color = '#111';
      formTitle.style.marginBottom = '12px';
      formTitle.style.opacity = '0';
      formTitle.style.transition = 'opacity 0.3s ease';
      container.appendChild(formTitle);
      
      // First step - edit request
      const editRequestContainer = document.createElement('div');
      editRequestContainer.style.width = '100%';
      editRequestContainer.style.marginBottom = '15px';
      editRequestContainer.style.opacity = '0';
      editRequestContainer.style.transition = 'opacity 0.3s ease';
      
      const editLabel = document.createElement('label');
      editLabel.textContent = 'What changes would you like to make?';
      editLabel.style.display = 'block';
      editLabel.style.marginBottom = '8px';
      editLabel.style.fontSize = '13px';
      editLabel.style.fontWeight = '500';
      editLabel.style.color = '#333';
      
      const editInput = document.createElement('textarea');
      editInput.placeholder = 'Describe your requested changes...';
      editInput.style.width = '100%';
      editInput.style.minHeight = '80px';
      editInput.style.padding = '10px';
      editInput.style.border = '1px solid rgba(0, 0, 0, 0.1)';
      editInput.style.borderRadius = '8px';
      editInput.style.fontSize = '13px';
      editInput.style.lineHeight = '1.5';
      editInput.style.boxSizing = 'border-box';
      editInput.style.resize = 'vertical';
      editInput.style.background = '#fff';
      editInput.style.color = '#333';
      
      editInput.addEventListener('focus', function() {
        this.style.outline = 'none';
        this.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.05)';
        this.style.borderColor = 'rgba(0, 0, 0, 0.12)';
      });
      
      editInput.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
        this.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      });
      
      editRequestContainer.appendChild(editLabel);
      editRequestContainer.appendChild(editInput);
      container.appendChild(editRequestContainer);
      
      // Email input (initially hidden)
      const emailContainer = document.createElement('div');
      emailContainer.style.width = '100%';
      emailContainer.style.marginBottom = '15px';
      emailContainer.style.opacity = '0';
      emailContainer.style.display = 'none';
      emailContainer.style.transition = 'opacity 0.3s ease';
      
      const emailLabel = document.createElement('label');
      emailLabel.textContent = 'Your email address';
      emailLabel.style.display = 'block';
      emailLabel.style.marginBottom = '8px';
      emailLabel.style.fontSize = '13px';
      emailLabel.style.fontWeight = '500';
      emailLabel.style.color = '#333';
      
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.placeholder = 'email@example.com';
      emailInput.style.width = '100%';
      emailInput.style.padding = '10px';
      emailInput.style.border = '1px solid rgba(0, 0, 0, 0.1)';
      emailInput.style.borderRadius = '8px';
      emailInput.style.fontSize = '13px';
      emailInput.style.boxSizing = 'border-box';
      emailInput.style.background = '#fff';
      emailInput.style.color = '#333';
      
      emailInput.addEventListener('focus', function() {
        this.style.outline = 'none';
        this.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.05)';
        this.style.borderColor = 'rgba(0, 0, 0, 0.12)';
      });
      
      emailInput.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
        this.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      });
      
      emailContainer.appendChild(emailLabel);
      emailContainer.appendChild(emailInput);
      container.appendChild(emailContainer);
      
      // Button container
      const formButtonContainer = document.createElement('div');
      formButtonContainer.style.display = 'flex';
      formButtonContainer.style.justifyContent = 'space-between';
      formButtonContainer.style.width = '100%';
      formButtonContainer.style.opacity = '0';
      formButtonContainer.style.transition = 'opacity 0.3s ease';
      
      // Back button (initially visible, then changes to cancel)
      const backButton = document.createElement('button');
      backButton.textContent = 'Cancel';
      backButton.style.background = 'transparent';
      backButton.style.color = '#666';
      backButton.style.border = '1px solid #ddd';
      backButton.style.borderRadius = '20px';
      backButton.style.padding = '8px 16px';
      backButton.style.fontSize = '13px';
      backButton.style.fontWeight = '500';
      backButton.style.cursor = 'pointer';
      backButton.style.transition = 'all 0.2s ease';
      
      backButton.addEventListener('mouseover', function() {
        backButton.style.background = '#f5f5f5';
      });
      
      backButton.addEventListener('mouseout', function() {
        backButton.style.background = 'transparent';
      });
      
      // Continue/Send button
      const actionButton = document.createElement('button');
      actionButton.textContent = 'Continue';
      actionButton.style.background = '#000';
      actionButton.style.color = '#fff';
      actionButton.style.border = 'none';
      actionButton.style.borderRadius = '20px';
      actionButton.style.padding = '8px 20px';
      actionButton.style.fontSize = '13px';
      actionButton.style.fontWeight = '600';
      actionButton.style.cursor = 'pointer';
      actionButton.style.transition = 'all 0.2s ease';
      
      actionButton.addEventListener('mouseover', function() {
        actionButton.style.transform = 'translateY(-1px)';
        actionButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      });
      
      actionButton.addEventListener('mouseout', function() {
        actionButton.style.transform = 'translateY(0)';
        actionButton.style.boxShadow = 'none';
      });
      
      formButtonContainer.appendChild(backButton);
      formButtonContainer.appendChild(actionButton);
      container.appendChild(formButtonContainer);
      
      // Success container (initially hidden)
      const successContainer = document.createElement('div');
      successContainer.style.display = 'none';
      successContainer.style.opacity = '0';
      successContainer.style.width = '100%';
      successContainer.style.flexDirection = 'column';
      successContainer.style.alignItems = 'center';
      successContainer.style.justifyContent = 'center';
      successContainer.style.textAlign = 'center';
      successContainer.style.padding = '10px 0';
      successContainer.style.transition = 'opacity 0.3s ease';
      
      // Checkmark animation container
      const checkmarkContainer = document.createElement('div');
      checkmarkContainer.style.width = '60px';
      checkmarkContainer.style.height = '60px';
      checkmarkContainer.style.background = '#f0fff4';
      checkmarkContainer.style.borderRadius = '50%';
      checkmarkContainer.style.display = 'flex';
      checkmarkContainer.style.alignItems = 'center';
      checkmarkContainer.style.justifyContent = 'center';
      checkmarkContainer.style.marginBottom = '10px';
      
      // SVG checkmark with animation
      checkmarkContainer.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 30 30">
          <path class="checkmark-path" d="M5 15 L12 22 L25 8" fill="none" stroke="#38a169" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" 
            style="stroke-dasharray: 30; stroke-dashoffset: 30; animation: checkmark 0.8s ease forwards;">
          </path>
        </svg>
        <style>
          @keyframes checkmark {
            to {
              stroke-dashoffset: 0;
            }
          }
        </style>
      `;
      
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Edit request sent successfully!';
      successMessage.style.color = '#38a169';
      successMessage.style.fontWeight = '600';
      successMessage.style.fontSize = '14px';
      
      const doneButton = document.createElement('button');
      doneButton.textContent = 'Done';
      doneButton.style.marginTop = '15px';
      doneButton.style.background = '#000';
      doneButton.style.color = '#fff';
      doneButton.style.border = 'none';
      doneButton.style.borderRadius = '20px';
      doneButton.style.padding = '8px 20px';
      doneButton.style.fontSize = '13px';
      doneButton.style.fontWeight = '600';
      doneButton.style.cursor = 'pointer';
      
      successContainer.appendChild(checkmarkContainer);
      successContainer.appendChild(successMessage);
      successContainer.appendChild(doneButton);
      container.appendChild(successContainer);
      
      // Fade in the form elements
      setTimeout(() => {
        formTitle.style.opacity = '1';
        editRequestContainer.style.opacity = '1';
        formButtonContainer.style.opacity = '1';
      }, 50);
      
      // Cancel button click handler - return to original state
      const resetForm = () => {
        // Hide form elements
        formTitle.style.opacity = '0';
        editRequestContainer.style.opacity = '0';
        emailContainer.style.opacity = '0';
        formButtonContainer.style.opacity = '0';
        successContainer.style.opacity = '0';
        
        // After fade out, remove form and restore original content
        setTimeout(() => {
          // Remove form elements
          container.removeChild(formTitle);
          container.removeChild(editRequestContainer);
          container.removeChild(emailContainer);
          container.removeChild(formButtonContainer);
          container.removeChild(successContainer);
          
          // Reset container
          container.style.width = '';
          container.style.alignItems = 'center';
          container.style.padding = '12px 15px';
          
          // Show original content
          headerText.style.display = '';
          buttonsContainer.style.display = '';
          trustContainer.style.display = '';
          
          // Fade in original content
          setTimeout(() => {
            headerText.style.opacity = '1';
            buttonsContainer.style.opacity = '1';
            trustContainer.style.opacity = '1';
          }, 50);
        }, 300);
      };
      
      backButton.addEventListener('click', resetForm);
      doneButton.addEventListener('click', resetForm);
      
      // Continue button click handler
      actionButton.addEventListener('click', () => {
        const editText = editInput.value.trim();
        
        if (editRequestContainer.style.display !== 'none') {
          // First step - validate and proceed to email input
          if (!editText) {
            alert('Please describe your requested changes');
            return;
          }
          
          // Hide edit request, show email input
          editRequestContainer.style.opacity = '0';
          setTimeout(() => {
            editRequestContainer.style.display = 'none';
            emailContainer.style.display = 'block';
            
            // Change button text
            actionButton.textContent = 'Send Request';
            
            // Fade in email container
            setTimeout(() => {
              emailContainer.style.opacity = '1';
            }, 50);
          }, 300);
          
        } else {
          // Second step - validate email and submit
          const email = emailInput.value.trim();
          
          if (!email) {
            alert('Please enter your email address');
            return;
          }
          
          if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address');
            return;
          }
          
          // Disable button during submission
          actionButton.disabled = true;
          actionButton.textContent = 'Sending...';
          
          // Make POST request
          fetch('https://api.altan.ai/galaxia/hook/pKE5EV', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              edit: editText,
              email: email
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
          })
          .then(() => {
            // Hide form elements
            emailContainer.style.opacity = '0';
            formButtonContainer.style.opacity = '0';
            formTitle.style.opacity = '0';
            
            // After fade out, show success message
            setTimeout(() => {
              emailContainer.style.display = 'none';
              formButtonContainer.style.display = 'none';
              formTitle.style.display = 'none';
              
              // Show and fade in success message
              successContainer.style.display = 'flex';
              setTimeout(() => {
                successContainer.style.opacity = '1';
              }, 50);
              
              // Return to original state after some time
              setTimeout(() => {
                resetForm();
              }, 5000);
            }, 300);
          })
          .catch(error => {
            console.error('Error:', error);
            alert('There was an error sending your request. Please try again.');
            actionButton.disabled = false;
            actionButton.textContent = 'Send Request';
          });
        }
      });
    }, 300);
  };
  
  // Update request button click event
  requestButton.addEventListener('click', function() {
    createInPlaceEditForm();
  });
});
