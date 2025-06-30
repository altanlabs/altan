import { useEffect } from 'react';

function withChatbotBubble(WrappedComponent) {
  return function (props) {
    // useEffect(() => {
    //   const script = document.createElement('script');

    //   script.src = "https://app.altan.ai/jssnippet/cbsnippet.js";
    //   script.async = true;
    //   script.id = "e52728fe-d0ca-4de3-8857-65ae9d569d9d";

    //   document.body.appendChild(script);

    //   return () => {
    //     document.body.removeChild(script);
    //   };
    // }, []);

    return <WrappedComponent {...props} />;
  };
}
export default withChatbotBubble;
