"use strict";var e=require("react/jsx-runtime"),t=require("react"),r=require("axios"),a=require("react-router-dom");function s(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(r[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(a=Object.getOwnPropertySymbols(e);s<a.length;s++)t.indexOf(a[s])<0&&Object.prototype.propertyIsEnumerable.call(e,a[s])&&(r[a[s]]=e[a[s]])}return r}function n(e,t,r,a){return new(r||(r=Promise))((function(s,n){function i(e){try{l(a.next(e))}catch(e){n(e)}}function o(e){try{l(a.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,o)}l((a=a.apply(e,t||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;function i(){const e=window.location.hostname;if(e.endsWith(".preview.altan.ai"))return"https://auth.altan.ai";if(e.endsWith(".altanlabs.com")){const t=function(e){const t=e.split(".");return"www"===t[0]&&t.shift(),t.length>2?t.slice(0,t.length-2).join("."):null}(e);return`https://${t?`${t}.`:""}auth.altanlabs.com`}return`auth.${e}`}const o=e=>{if(!e)return!1;try{const t=(e=>{const t=e.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),r=decodeURIComponent(window.atob(t).split("").map((e=>`%${`00${e.charCodeAt(0).toString(16)}`.slice(-2)}`)).join(""));return JSON.parse(r)})(e),r=Date.now();return 1e3*t.exp>r+1}catch(e){return!1}},l=(e,t)=>{t?e.defaults.headers.common.Authorization=`Bearer ${t}`:(delete e.defaults.headers.common.Authorization,g("logged out"))};let d=!1,c=null;const u=r.create({baseURL:i(),withCredentials:!0}),h=new class{constructor(){this.controllers=new Map}hashString(e){let t=5381;for(let r=0;r<e.length;r++)t=33*t^e.charCodeAt(r);return(t>>>0).toString(36)}getRequestKey(e){const{method:t,url:r,params:a,data:s}=e,n=JSON.stringify({method:t,url:r,params:a,data:s});return this.hashString(n)}add(e){var t;const r=this.getRequestKey(e);this.controllers.has(r)&&(null===(t=this.controllers.get(r))||void 0===t||t.abort("Canceled duplicate request"),this.controllers.delete(r));const a=new AbortController;e.signal=a.signal,this.controllers.set(r,a)}remove(e){let t;t=e.headers&&e.headers["x-request-key"]?e.headers["x-request-key"]:this.getRequestKey(e),this.controllers.delete(t)}cancel(e,t="Operation canceled"){var r;this.controllers.has(e)&&(null===(r=this.controllers.get(e))||void 0===r||r.abort(t),this.controllers.delete(e))}cancelAll(e="Operation canceled"){this.controllers.forEach((t=>{t.abort(e)})),this.controllers.clear()}},m=()=>n(void 0,void 0,void 0,(function*(){return d||(d=!0,c=u.post("/refresh").then((e=>{const t=e.data.access_token;return d=!1,c=null,t})).catch((e=>(d=!1,c=null,Promise.reject(e))))),c})),x=(e=i())=>{const t=r.create({baseURL:e});return console.debug("[@altanlabs/auth] created new API with base url",t.defaults.baseURL),t.interceptors.request.use((r=>n(void 0,void 0,void 0,(function*(){h.add(r);const a=t.defaults.headers.common.Authorization,s=a&&"string"==typeof a&&a.startsWith("Bearer ")?a.substring(7):null;if(s&&o(s))console.debug(`[@altanlabs/auth] [axios api ${e}] request interceptor. valid token`);else{const e=yield m();l(t,e),r.headers.Authorization=`Bearer ${e}`}return r}))),(e=>Promise.reject(e))),t.interceptors.response.use((e=>(h.remove(e.config),e)),(e=>n(void 0,void 0,void 0,(function*(){var r,a;const s=e.config;if(!s)return Promise.reject(e);if(h.remove(s),s._retryCount=s._retryCount||0,401===(null===(r=e.response)||void 0===r?void 0:r.status)&&s._retryCount<1){s._retryCount++;const e=yield m();return l(t,e),s.headers.Authorization=`Bearer ${e}`,t(s)}return(null===(a=e.response)||void 0===a?void 0:a.status)>=500?Promise.reject(new Error("[@altanlabs/auth] A server error occurred. Please try again later.")):Promise.reject(e)})))),t},g=e=>{h.cancelAll(e)},p=t.createContext(null);function v(){const e=t.useContext(p);if(!e)throw new Error("useAuth must be used within an AuthProvider");return e}function f(){const{login:e,logout:t,register:r,resetPassword:a,updateProfile:s,continueWithGoogle:n}=v();return{login:e,logout:t,register:r,resetPassword:a,updateProfile:s,continueWithGoogle:n}}function b(){return e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",viewBox:"0 0 32 32",width:"20",height:"20",children:[e.jsx("defs",{children:e.jsx("path",{id:"A",d:"M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"})}),e.jsx("clipPath",{id:"B",children:e.jsx("use",{xlinkHref:"#A"})}),e.jsxs("g",{transform:"matrix(.727273 0 0 .727273 -.954545 -1.45455)",children:[e.jsx("path",{d:"M0 37V11l17 13z",clipPath:"url(#B)",fill:"#fbbc05"}),e.jsx("path",{d:"M0 11l17 13 7-6.1L48 14V0H0z",clipPath:"url(#B)",fill:"#ea4335"}),e.jsx("path",{d:"M0 37l30-23 7.9 1L48 0v48H0z",clipPath:"url(#B)",fill:"#34a853"}),e.jsx("path",{d:"M48 48L17 24l-4-3 35-10z",clipPath:"url(#B)",fill:"#4285f4"})]})]})}var y=t.memo((r=>{var{src:a,refreshUrl:n="/auth/refresh",targetOrigin:i="*",onRefreshError:o}=r,l=s(r,["src","refreshUrl","targetOrigin","onRefreshError"]);const d=t.useRef(null),c=t.useRef(!1),h=t.useRef(null);return t.useEffect((()=>{const e=e=>{var t;if("*"!==i&&e.origin!==i)return;const{type:r}=e.data;"refresh_token"===r&&(c.current||(c.current=!0,h.current=u.post(n).then((e=>{const t=e.data.access_token;return c.current=!1,h.current=null,t})).catch((e=>(c.current=!1,h.current=null,o&&o(e),Promise.reject(e))))),null===(t=h.current)||void 0===t||t.then((e=>{var t,r;null===(r=null===(t=d.current)||void 0===t?void 0:t.contentWindow)||void 0===r||r.postMessage({type:"new_access_token",token:e},i)})).catch((e=>{console.error("Refresh error in ParentCommunicator:",e)})))};return window.addEventListener("message",e),()=>window.removeEventListener("message",e)}),[n,o,i]),t.useEffect((()=>{const e=()=>{var e,t;null===(t=null===(e=d.current)||void 0===e?void 0:e.contentWindow)||void 0===t||t.postMessage({type:"activate_interface_parenthood"},i)},t=d.current;return null==t||t.addEventListener("load",e),()=>null==t?void 0:t.removeEventListener("load",e)}),[i]),e.jsx("iframe",Object.assign({ref:d,src:a},l))}));function w({appearance:t={theme:"light"},onLogout:r,className:a=""}){const{logout:s}=f(),i={light:{button:"text-red-600 hover:text-red-800"},dark:{button:"text-red-400 hover:text-red-200"}}[t.theme||"light"];return e.jsxs("button",{onClick:()=>n(this,void 0,void 0,(function*(){try{yield s(),null==r||r()}catch(e){console.error("Logout failed:",e)}})),className:`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 ${i.button} ${a}`,children:[e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"})}),e.jsx("span",{children:"Logout"})]})}const j=["id","verified","created_time","last_modified_time","last_modified_by","password","avatar"],N=["name","surname"];exports.AuthProvider=function({children:r,tableId:a,storageKey:i="",onAuthStateChange:o,authenticationOptions:d={persistSession:!0,redirectUrl:"/login"}}){const[c,h]=t.useState(null),[m,g]=t.useState(null),[v,f]=t.useState(!1),[b,y]=t.useState(0),[w,j]=t.useState(!1),N=t.useMemo((()=>x()),[a]),k=e=>Object.assign({id:Number(e.id||0),email:e.email||"",name:e.name,surname:e.surname,avatar:Array.isArray(e.avatar)?e.avatar:[],verified:Boolean(e.verified)},Object.fromEntries(Object.entries(e).filter((([e])=>!["id","email","name","surname","avatar","verified"].includes(e))))),$=t.useCallback((()=>n(this,void 0,void 0,(function*(){try{yield u.post("/logout")}finally{l(N,null),h(null)}}))),[N,d.persistSession,a]);t.useEffect((()=>{null==o||o(c)}),[c,o]);const C=t.useCallback((e=>n(this,[e],void 0,(function*({email:e,password:t}){var r,s;try{f(!0),g(null);const r=new URLSearchParams;r.append("username",e),r.append("password",t);const{data:{access_token:s}}=yield N.post(`/login?table_id=${a}`,r,{headers:{"Content-Type":"application/x-www-form-urlencoded"}});l(N,s),y((e=>e+1))}catch(e){const t=(null===(s=null===(r=e.response)||void 0===r?void 0:r.data)||void 0===s?void 0:s.detail)||"Invalid email or password";throw g(new Error(t)),e}finally{f(!1)}}))),[N,d.persistSession,a]),A=t.useCallback((e=>n(this,void 0,void 0,(function*(){var t,r,{email:n,password:i,name:o,surname:l}=e,d=s(e,["email","password","name","surname"]);try{f(!0),g(null);200===(yield u.post(`/register?table_id=${a}`,Object.assign({email:n,password:i,name:o,surname:l},d))).status&&(yield C({email:n,password:i}))}catch(e){const a=(null===(r=null===(t=e.response)||void 0===t?void 0:t.data)||void 0===r?void 0:r.detail)||"Registration failed";throw g(new Error(a)),e}finally{f(!1)}}))),[N,C,a]),S=t.useCallback((e=>n(this,void 0,void 0,(function*(){throw new Error("Not implemented")}))),[]),P=t.useCallback((e=>n(this,void 0,void 0,(function*(){if(!c)throw new Error("No user logged in");try{f(!0),g(null);const t=Object.assign({},e);"avatar"in e&&(null===e.avatar?t.avatar=[]:"string"==typeof e.avatar?t.avatar=[{file_name:"avatar.jpg",mime_type:"image/jpeg",file_content:e.avatar}]:t.avatar=e.avatar);const r=yield N.patch("/update",t),a=k(r.data.user);h(a)}catch(e){throw g(e instanceof Error?e:new Error("Profile update failed")),e}finally{f(!1)}}))),[c,N,d.persistSession,a]),L=t.useCallback((()=>n(this,void 0,void 0,(function*(){try{f(!0),g(null);window.open(`https://auth.altan.ai/google/authorize?table_id=${a}&redirect_url=${encodeURIComponent(window.location.origin)}`,"Auth","width=600,height=600,scrollbars=yes");const e=yield new Promise(((e,t)=>{let r;function a(s){if(console.log("@altanlabs/auth: signin with google: event.origin:",s.origin),"https://auth.altan.ai"!==s.origin)return;r&&clearTimeout(r),window.removeEventListener("message",a);const n=s.data;n.error?t(new Error(n.error)):n.success?e(n):t(new Error("Invalid response format"))}window.addEventListener("message",a),r=setTimeout((()=>{window.removeEventListener("message",a),t(new Error("Authentication timed out"))}),12e4)})),{access_token:t,user:r}=e;d.persistSession&&t&&l(N,t),y((e=>e+1))}catch(e){const t=e instanceof Error?e.message:"Authentication failed";throw g(new Error(t)),e}finally{f(!1)}}))),[N,a,d.persistSession]);t.useEffect((()=>{(()=>{n(this,void 0,void 0,(function*(){if(a&&!v){f(!0);try{const{data:e}=yield N.get("/me"),t=k(e);h(t)}catch(e){console.debug("@checkAuth: error",e),h(null)}finally{j(!0),f(!1)}}}))})()}),[N,b]);const M=t.useMemo((()=>({user:c,isLoading:v||!w,error:m,isAuthenticated:!!c,login:C,logout:$,register:A,resetPassword:S,updateProfile:P,continueWithGoogle:L,api:N})),[c,w,v,m,C,$,A,S,P,L,N]);return e.jsx(p.Provider,{value:M,children:r})},exports.AuthenticatedIframe=y,exports.Logout=w,exports.ProtectedRoute=function({children:t,redirectTo:r="/login"}){const{isAuthenticated:s,isLoading:n}=v();return n?e.jsx("div",{children:"Loading..."}):s?e.jsx(e.Fragment,{children:t}):e.jsx(a.Navigate,{to:r,replace:!0})},exports.SignIn=function(r){var a,i,{appearance:o={theme:"light"},companyName:l,signUpUrl:d="/sign-up",routing:c="path",withSignUp:u=!0}=r,h=s(r,["appearance","companyName","signUpUrl","routing","withSignUp"]);const{continueWithGoogle:m,login:x,isLoading:g,isAuthenticated:p,error:f}=v(),[y,w]=t.useState((null===(a=h.initialValues)||void 0===a?void 0:a.emailAddress)||""),[j,N]=t.useState((null===(i=h.initialValues)||void 0===i?void 0:i.password)||""),k={light:{background:"bg-white",card:"bg-white",text:"text-gray-900",textMuted:"text-gray-600",input:"bg-white text-gray-900 border-gray-300",button:"bg-black hover:bg-gray-900 text-white",googleButton:"bg-white hover:bg-gray-50 text-gray-700 border-gray-300",error:{background:"bg-red-50",text:"text-red-800",icon:"text-red-400"}},dark:{background:"bg-gray-900",card:"bg-gray-800",text:"text-white",textMuted:"text-gray-300",input:"bg-gray-800 text-white border-gray-600",button:"bg-white hover:bg-gray-100 text-black",googleButton:"bg-gray-800 hover:bg-gray-700 text-white border-gray-600",error:{background:"bg-red-900/20",text:"text-red-200",icon:"text-red-400"}}}[o.theme||"light"];return p?null:e.jsxs("div",{className:"max-w-md w-full mx-auto space-y-8",children:[e.jsxs("div",{children:[e.jsx("h2",{className:`text-center text-3xl font-bold ${k.text}`,children:l?`Sign in to ${l}`:"Sign in"}),e.jsx("p",{className:`mt-2 text-center text-sm ${k.textMuted}`,children:"Welcome back! Please sign in to continue"})]}),e.jsx("button",{onClick:()=>m(),className:`w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${k.googleButton}`,children:e.jsxs("span",{className:"flex items-center",children:[e.jsx(b,{}),e.jsx("span",{className:"ml-2",children:"Continue with Google"})]})}),e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-0 flex items-center",children:e.jsx("div",{className:"w-full border-t "+("dark"===o.theme?"border-gray-700":"border-gray-300")})}),e.jsx("div",{className:"relative flex justify-center text-sm",children:e.jsx("span",{className:`px-2 ${k.card} ${k.textMuted}`,children:"or"})})]}),e.jsxs("form",{className:"mt-8 space-y-6",onSubmit:e=>n(this,void 0,void 0,(function*(){e.preventDefault(),yield x({email:y,password:j})})),children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:`block text-sm font-medium ${k.text}`,children:"Email address"}),e.jsx("input",{id:"email",type:"email",required:!0,className:`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${k.input}`,value:y,onChange:e=>w(e.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:`block text-sm font-medium ${k.text}`,children:"Password"}),e.jsx("input",{id:"password",type:"password",required:!0,className:`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${k.input}`,value:j,onChange:e=>N(e.target.value)})]}),f&&e.jsx("div",{className:`rounded-md ${k.error.background} p-4`,children:e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx("svg",{className:`h-5 w-5 ${k.error.icon}`,viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",clipRule:"evenodd"})})}),e.jsx("div",{className:"ml-3",children:e.jsx("p",{className:`text-sm font-medium ${k.error.text}`,children:f.message})})]})}),e.jsx("button",{type:"submit",className:`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${k.button}`,disabled:g,children:g?"Signing in...":"Continue"})]}),e.jsxs("div",{className:`mt-8 border-t ${"dark"===o.theme?"border-gray-700":"border-gray-200"} pt-6`,children:[u&&e.jsxs("div",{className:"text-center mb-4",children:[e.jsx("span",{className:k.textMuted,children:"Don't have an account? "}),e.jsx("a",{href:d,onClick:e=>{e.preventDefault(),"hash"===c?window.location.hash=d:window.location.href=d},className:"text-blue-600 hover:text-blue-400",children:"Sign up"})]}),e.jsxs("div",{className:`flex items-center justify-center space-x-2 text-xs ${k.textMuted}`,children:[e.jsx("span",{children:"Secured by"}),e.jsx("img",{src:"dark"===o.theme?"https://altan.ai/logos/horizontalWhite.png":"https://altan.ai/logos/horizontalBlack.png",alt:"Altan",className:"h-3"})]})]})]})},exports.SignUp=function(r){var a,i,{appearance:o={theme:"light"},companyName:l,signInUrl:d="/sign-in",routing:c="path",withSignIn:u=!0}=r,h=s(r,["appearance","companyName","signInUrl","routing","withSignIn"]);const{continueWithGoogle:m,register:x,isLoading:g,isAuthenticated:p,error:f}=v(),[y,w]=t.useState((null===(a=h.initialValues)||void 0===a?void 0:a.emailAddress)||""),[j,N]=t.useState((null===(i=h.initialValues)||void 0===i?void 0:i.password)||""),[k,$]=t.useState(""),[C,A]=t.useState(null),S={light:{background:"bg-white",card:"bg-white",text:"text-gray-900",textMuted:"text-gray-600",input:"bg-white text-gray-900 border-gray-300",button:"bg-black hover:bg-gray-900 text-white",googleButton:"bg-white hover:bg-gray-50 text-gray-700 border-gray-300",error:{background:"bg-red-50",text:"text-red-800",icon:"text-red-400"}},dark:{background:"bg-gray-900",card:"bg-gray-800",text:"text-white",textMuted:"text-gray-300",input:"bg-gray-800 text-white border-gray-600",button:"bg-white hover:bg-gray-100 text-black",googleButton:"bg-gray-800 hover:bg-gray-700 text-white border-gray-600",error:{background:"bg-red-900/20",text:"text-red-200",icon:"text-red-400"}}}[o.theme||"light"];return p?null:e.jsxs("div",{className:"max-w-md w-full mx-auto space-y-8",children:[e.jsxs("div",{children:[e.jsx("h2",{className:`text-center text-3xl font-bold ${S.text}`,children:l?`Create your ${l} account`:"Create account"}),e.jsx("p",{className:`mt-2 text-center text-sm ${S.textMuted}`,children:"Get started by creating your account"})]}),e.jsx("button",{onClick:()=>m(),className:`w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${S.googleButton}`,children:e.jsxs("span",{className:"flex items-center",children:[e.jsx(b,{}),e.jsx("span",{className:"ml-2",children:"Continue with Google"})]})}),e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute inset-0 flex items-center",children:e.jsx("div",{className:"w-full border-t "+("dark"===o.theme?"border-gray-700":"border-gray-300")})}),e.jsx("div",{className:"relative flex justify-center text-sm",children:e.jsx("span",{className:`px-2 ${S.card} ${S.textMuted}`,children:"or"})})]}),e.jsxs("form",{className:"mt-8 space-y-6",onSubmit:e=>n(this,void 0,void 0,(function*(){if(e.preventDefault(),A(null),j===k)try{yield x({email:y,password:j,displayName:""})}catch(e){}else A("Passwords don't match")})),children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:`block text-sm font-medium ${S.text}`,children:"Email address"}),e.jsx("input",{id:"email",type:"email",required:!0,className:`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${S.input}`,value:y,onChange:e=>w(e.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"password",className:`block text-sm font-medium ${S.text}`,children:"Password"}),e.jsx("input",{id:"password",type:"password",required:!0,className:`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${S.input}`,value:j,onChange:e=>N(e.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"confirmPassword",className:`block text-sm font-medium ${S.text}`,children:"Confirm Password"}),e.jsx("input",{id:"confirmPassword",type:"password",required:!0,className:`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${S.input}`,value:k,onChange:e=>$(e.target.value)})]}),(f||C)&&e.jsx("div",{className:`rounded-md ${S.error.background} p-4`,children:e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx("svg",{className:`h-5 w-5 ${S.error.icon}`,viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",clipRule:"evenodd"})})}),e.jsx("div",{className:"ml-3",children:e.jsx("p",{className:`text-sm font-medium ${S.error.text}`,children:C||(null==f?void 0:f.message)})})]})}),e.jsx("button",{type:"submit",className:`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${S.button}`,disabled:g,children:g?"Creating account...":"Create account"})]}),e.jsxs("div",{className:`mt-8 border-t ${"dark"===o.theme?"border-gray-700":"border-gray-200"} pt-6`,children:[u&&e.jsxs("div",{className:"text-center mb-4",children:[e.jsx("span",{className:S.textMuted,children:"Already have an account? "}),e.jsx("a",{href:d,onClick:e=>{e.preventDefault(),"hash"===c?window.location.hash=d:window.location.href=d},className:"text-blue-600 hover:text-blue-400",children:"Sign in"})]}),e.jsxs("div",{className:`flex items-center justify-center space-x-2 text-xs ${S.textMuted}`,children:[e.jsx("span",{children:"Secured by"}),e.jsx("img",{src:"dark"===o.theme?"https://altan.ai/logos/horizontalWhite.png":"https://altan.ai/logos/horizontalBlack.png",alt:"Altan",className:"h-3"})]})]})]})},exports.UserProfile=function({appearance:r={theme:"light"},routing:a="path",path:s="/user-profile",showCustomFields:i=!0,editableFields:o=N,hiddenFields:l=[],customPages:d=[],fallback:c}){var u;const{user:h,updateProfile:m,isLoading:x,error:g}=v(),[p,f]=t.useState(!1),[b,y]=t.useState({}),k=t.useRef(null);if(!h)return c||null;const $={light:{background:"bg-gray-50",card:"bg-white",text:"text-gray-900",textSecondary:"text-gray-700",textMuted:"text-gray-500",border:"border-gray-300",primary:"bg-primary-600 hover:bg-primary-700",buttonText:"text-white"},dark:{background:"bg-gray-900",card:"bg-gray-800",text:"text-white",textSecondary:"text-gray-300",textMuted:"text-gray-400",border:"border-gray-700",primary:"bg-primary-500 hover:bg-primary-600",buttonText:"text-white"}}[r.theme||"light"],C=[...j,...l];return e.jsx("div",{className:`max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 ${$.background}`,children:e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:`${$.card} shadow rounded-lg p-6`,children:[e.jsxs("div",{className:"flex justify-between items-start mb-6",children:[e.jsx("h1",{className:`text-2xl font-bold ${$.text}`,children:"Profile Settings"}),e.jsx(w,{appearance:r})]}),e.jsxs("div",{className:"flex items-center space-x-6",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"w-24 h-24 rounded-full overflow-hidden bg-gray-200",children:Array.isArray(h.avatar)&&(null===(u=h.avatar[0])||void 0===u?void 0:u.url)?e.jsx("img",{src:h.avatar[0].url,alt:"Profile",className:"w-full h-full object-cover"}):e.jsx("div",{className:`w-full h-full flex items-center justify-center ${$.textMuted}`,children:e.jsx("svg",{className:"w-12 h-12",fill:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z"})})})}),e.jsx("input",{type:"file",ref:k,onChange:e=>n(this,void 0,void 0,(function*(){var t;const r=null===(t=e.target.files)||void 0===t?void 0:t[0];if(r)try{const e=new FileReader;e.onloadend=()=>n(this,void 0,void 0,(function*(){const t=e.result;yield m({avatar:[{file_name:"avatar.jpg",mime_type:r.type||"image/jpeg",file_content:t.split(",")[1]}]})})),e.readAsDataURL(r)}catch(e){console.error("Failed to update avatar:",e)}})),accept:"image/*",className:"hidden"}),e.jsx("button",{onClick:()=>{var e;return null===(e=k.current)||void 0===e?void 0:e.click()},className:`absolute bottom-0 right-0 p-1.5 rounded-full ${$.primary} ${$.buttonText}`,children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})})]}),e.jsxs("div",{children:[e.jsx("h2",{className:`text-2xl font-bold ${$.text}`,children:h.name||h.email}),Array.isArray(h.avatar)&&h.avatar.length>0&&e.jsx("button",{onClick:()=>m({avatar:[]}),className:`text-sm ${$.textMuted} hover:${$.text}`,children:"Remove avatar"})]})]})]}),e.jsx("div",{className:`${$.card} shadow rounded-lg`,children:e.jsxs("div",{className:"px-4 py-5 sm:p-6",children:[e.jsxs("div",{className:"flex justify-between items-center mb-6",children:[e.jsx("h3",{className:`text-lg font-medium ${$.text}`,children:"Profile Information"}),e.jsx("button",{onClick:p?()=>n(this,void 0,void 0,(function*(){try{yield m(b),f(!1)}catch(e){}})):()=>{y(h),f(!0)},disabled:p&&x,className:`px-4 py-2 rounded-md ${$.primary} ${$.buttonText} disabled:opacity-50`,children:p?x?"Saving...":"Save Changes":"Edit Profile"})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:Object.entries(h).filter((([e])=>!(C.includes(e)||"avatar"===e||!i&&!N.includes(e)))).map((([e,t])=>{let r=t;return Array.isArray(t)?r=t.join(", "):null==t?r="":"object"==typeof t&&(r=JSON.stringify(t)),[e,r]})).map((([t,r])=>e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:`block text-sm font-medium ${$.textMuted}`,children:t.replace(/_/g," ").replace(/\b\w/g,(e=>e.toUpperCase()))}),p&&o.includes(t)?e.jsx("input",{type:"text",value:b[t]||"",onChange:e=>y((r=>Object.assign(Object.assign({},r),{[t]:e.target.value}))),className:`block w-full rounded-md ${$.border} shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${$.card} ${$.text} p-2`}):e.jsx("div",{className:`text-sm ${$.text} p-2 rounded-md ${"bg-white"===$.card?"bg-gray-50":"bg-gray-700"}`,children:r||"Not set"})]},t)))})]})}),g&&e.jsx("div",{className:"rounded-md bg-red-50 dark:bg-red-900 p-4",children:e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx("svg",{className:"h-5 w-5 text-red-400",viewBox:"0 0 20 20",fill:"currentColor",children:e.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",clipRule:"evenodd"})})}),e.jsx("div",{className:"ml-3",children:e.jsx("p",{className:"text-sm font-medium text-red-800 dark:text-red-200",children:g.message})})]})})]})})},exports.createAuthenticatedApi=x,exports.useAuth=v,exports.useAuthAPI=function(e=!0){const r=t.useContext(p);if(!r){if(e)throw new Error("useAuth must be used within an AuthProvider");return null}return r.api},exports.useAuthActions=f,exports.useAuthError=function(){const{error:e}=v();return e},exports.useAuthLoading=function(){const{isLoading:e}=v();return e},exports.useAuthUser=function(){const{user:e,isAuthenticated:t}=v();return{user:e,isAuthenticated:t}};
//# sourceMappingURL=index.js.map
