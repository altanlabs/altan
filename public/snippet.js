document.addEventListener('DOMContentLoaded',function(){
  // Add URL parameter check
  const urlParams = new URLSearchParams(window.location.search);
  const hideSnippet = urlParams.get('hideSnippet');
  
  // Only create and show the snippet if showSnippet is 'true'
  if (hideSnippet != 'true') {
    const container=document.createElement('div');
    container.style.position='fixed';
    container.style.bottom='20px';
    container.style.right='20px';
    container.style.display='flex';
    container.style.alignItems='center';
    container.style.padding='8px 12px';
    container.style.background='rgba(0, 0, 0, 0.8)';
    container.style.color='#fff';
    container.style.borderRadius='20px';
    container.style.cursor='pointer';
    container.style.fontFamily='Inter, system-ui, -apple-system, sans-serif';
    container.style.zIndex='9999';
    container.style.transition='all 0.2s ease';
    container.addEventListener('mouseover', function() {
      container.style.transform='scale(1.02)';
      container.style.background='rgba(0, 0, 0, 0.9)';
    });
    container.addEventListener('mouseout', function() {
      container.style.transform='scale(1)';
      container.style.background='rgba(0, 0, 0, 0.8)';
    });
    const textSpan=document.createElement('span');
    textSpan.textContent='Made with ';
    textSpan.style.fontSize='13px';
    textSpan.style.fontWeight='500';
    const img=document.createElement('img');
    img.src='https://altan.ai/logos/horizontalWhite.png';
    img.style.height='14px';
    img.style.marginLeft='4px';
    container.addEventListener('click',function(){window.location.href='https://www.altan.ai';});
    container.appendChild(textSpan);
    container.appendChild(img);
    document.body.appendChild(container);
  }
});
