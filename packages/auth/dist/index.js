'use strict';

var require$$0 = require('react');
var axios = require('axios');
var reactRouterDom = require('react-router-dom');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=require$$0,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var reactJsxRuntime_development = {};

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_development;

function requireReactJsxRuntime_development () {
	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
	hasRequiredReactJsxRuntime_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	var React = require$$0;

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	var FAUX_ITERATOR_SYMBOL = '@@iterator';
	function getIteratorFn(maybeIterable) {
	  if (maybeIterable === null || typeof maybeIterable !== 'object') {
	    return null;
	  }

	  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

	  if (typeof maybeIterator === 'function') {
	    return maybeIterator;
	  }

	  return null;
	}

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function getWrappedName(outerType, innerType, wrapperName) {
	  var displayName = outerType.displayName;

	  if (displayName) {
	    return displayName;
	  }

	  var functionName = innerType.displayName || innerType.name || '';
	  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
	} // Keep in sync with react-reconciler/getComponentNameFromFiber


	function getContextName(type) {
	  return type.displayName || 'Context';
	} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


	function getComponentNameFromType(type) {
	  if (type == null) {
	    // Host root, text node or just invalid type.
	    return null;
	  }

	  {
	    if (typeof type.tag === 'number') {
	      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
	    }
	  }

	  if (typeof type === 'function') {
	    return type.displayName || type.name || null;
	  }

	  if (typeof type === 'string') {
	    return type;
	  }

	  switch (type) {
	    case REACT_FRAGMENT_TYPE:
	      return 'Fragment';

	    case REACT_PORTAL_TYPE:
	      return 'Portal';

	    case REACT_PROFILER_TYPE:
	      return 'Profiler';

	    case REACT_STRICT_MODE_TYPE:
	      return 'StrictMode';

	    case REACT_SUSPENSE_TYPE:
	      return 'Suspense';

	    case REACT_SUSPENSE_LIST_TYPE:
	      return 'SuspenseList';

	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_CONTEXT_TYPE:
	        var context = type;
	        return getContextName(context) + '.Consumer';

	      case REACT_PROVIDER_TYPE:
	        var provider = type;
	        return getContextName(provider._context) + '.Provider';

	      case REACT_FORWARD_REF_TYPE:
	        return getWrappedName(type, type.render, 'ForwardRef');

	      case REACT_MEMO_TYPE:
	        var outerName = type.displayName || null;

	        if (outerName !== null) {
	          return outerName;
	        }

	        return getComponentNameFromType(type.type) || 'Memo';

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            return getComponentNameFromType(init(payload));
	          } catch (x) {
	            return null;
	          }
	        }

	      // eslint-disable-next-line no-fallthrough
	    }
	  }

	  return null;
	}

	var assign = Object.assign;

	// Helpers to patch console.logs to avoid logging during side-effect free
	// replaying on render function. This currently only patches the object
	// lazily which won't cover if the log function was extracted eagerly.
	// We could also eagerly patch the method.
	var disabledDepth = 0;
	var prevLog;
	var prevInfo;
	var prevWarn;
	var prevError;
	var prevGroup;
	var prevGroupCollapsed;
	var prevGroupEnd;

	function disabledLog() {}

	disabledLog.__reactDisabledLog = true;
	function disableLogs() {
	  {
	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      prevLog = console.log;
	      prevInfo = console.info;
	      prevWarn = console.warn;
	      prevError = console.error;
	      prevGroup = console.group;
	      prevGroupCollapsed = console.groupCollapsed;
	      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

	      var props = {
	        configurable: true,
	        enumerable: true,
	        value: disabledLog,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        info: props,
	        log: props,
	        warn: props,
	        error: props,
	        group: props,
	        groupCollapsed: props,
	        groupEnd: props
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    disabledDepth++;
	  }
	}
	function reenableLogs() {
	  {
	    disabledDepth--;

	    if (disabledDepth === 0) {
	      /* eslint-disable react-internal/no-production-logging */
	      var props = {
	        configurable: true,
	        enumerable: true,
	        writable: true
	      }; // $FlowFixMe Flow thinks console is immutable.

	      Object.defineProperties(console, {
	        log: assign({}, props, {
	          value: prevLog
	        }),
	        info: assign({}, props, {
	          value: prevInfo
	        }),
	        warn: assign({}, props, {
	          value: prevWarn
	        }),
	        error: assign({}, props, {
	          value: prevError
	        }),
	        group: assign({}, props, {
	          value: prevGroup
	        }),
	        groupCollapsed: assign({}, props, {
	          value: prevGroupCollapsed
	        }),
	        groupEnd: assign({}, props, {
	          value: prevGroupEnd
	        })
	      });
	      /* eslint-enable react-internal/no-production-logging */
	    }

	    if (disabledDepth < 0) {
	      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
	    }
	  }
	}

	var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
	var prefix;
	function describeBuiltInComponentFrame(name, source, ownerFn) {
	  {
	    if (prefix === undefined) {
	      // Extract the VM specific prefix used by each line.
	      try {
	        throw Error();
	      } catch (x) {
	        var match = x.stack.trim().match(/\n( *(at )?)/);
	        prefix = match && match[1] || '';
	      }
	    } // We use the prefix to ensure our stacks line up with native stack frames.


	    return '\n' + prefix + name;
	  }
	}
	var reentry = false;
	var componentFrameCache;

	{
	  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
	  componentFrameCache = new PossiblyWeakMap();
	}

	function describeNativeComponentFrame(fn, construct) {
	  // If something asked for a stack inside a fake render, it should get ignored.
	  if ( !fn || reentry) {
	    return '';
	  }

	  {
	    var frame = componentFrameCache.get(fn);

	    if (frame !== undefined) {
	      return frame;
	    }
	  }

	  var control;
	  reentry = true;
	  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

	  Error.prepareStackTrace = undefined;
	  var previousDispatcher;

	  {
	    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
	    // for warnings.

	    ReactCurrentDispatcher.current = null;
	    disableLogs();
	  }

	  try {
	    // This should throw.
	    if (construct) {
	      // Something should be setting the props in the constructor.
	      var Fake = function () {
	        throw Error();
	      }; // $FlowFixMe


	      Object.defineProperty(Fake.prototype, 'props', {
	        set: function () {
	          // We use a throwing setter instead of frozen or non-writable props
	          // because that won't throw in a non-strict mode function.
	          throw Error();
	        }
	      });

	      if (typeof Reflect === 'object' && Reflect.construct) {
	        // We construct a different control for this case to include any extra
	        // frames added by the construct call.
	        try {
	          Reflect.construct(Fake, []);
	        } catch (x) {
	          control = x;
	        }

	        Reflect.construct(fn, [], Fake);
	      } else {
	        try {
	          Fake.call();
	        } catch (x) {
	          control = x;
	        }

	        fn.call(Fake.prototype);
	      }
	    } else {
	      try {
	        throw Error();
	      } catch (x) {
	        control = x;
	      }

	      fn();
	    }
	  } catch (sample) {
	    // This is inlined manually because closure doesn't do it for us.
	    if (sample && control && typeof sample.stack === 'string') {
	      // This extracts the first frame from the sample that isn't also in the control.
	      // Skipping one frame that we assume is the frame that calls the two.
	      var sampleLines = sample.stack.split('\n');
	      var controlLines = control.stack.split('\n');
	      var s = sampleLines.length - 1;
	      var c = controlLines.length - 1;

	      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
	        // We expect at least one stack frame to be shared.
	        // Typically this will be the root most one. However, stack frames may be
	        // cut off due to maximum stack limits. In this case, one maybe cut off
	        // earlier than the other. We assume that the sample is longer or the same
	        // and there for cut off earlier. So we should find the root most frame in
	        // the sample somewhere in the control.
	        c--;
	      }

	      for (; s >= 1 && c >= 0; s--, c--) {
	        // Next we find the first one that isn't the same which should be the
	        // frame that called our sample function and the control.
	        if (sampleLines[s] !== controlLines[c]) {
	          // In V8, the first line is describing the message but other VMs don't.
	          // If we're about to return the first line, and the control is also on the same
	          // line, that's a pretty good indicator that our sample threw at same line as
	          // the control. I.e. before we entered the sample frame. So we ignore this result.
	          // This can happen if you passed a class to function component, or non-function.
	          if (s !== 1 || c !== 1) {
	            do {
	              s--;
	              c--; // We may still have similar intermediate frames from the construct call.
	              // The next one that isn't the same should be our match though.

	              if (c < 0 || sampleLines[s] !== controlLines[c]) {
	                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
	                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
	                // but we have a user-provided "displayName"
	                // splice it in to make the stack more readable.


	                if (fn.displayName && _frame.includes('<anonymous>')) {
	                  _frame = _frame.replace('<anonymous>', fn.displayName);
	                }

	                {
	                  if (typeof fn === 'function') {
	                    componentFrameCache.set(fn, _frame);
	                  }
	                } // Return the line we found.


	                return _frame;
	              }
	            } while (s >= 1 && c >= 0);
	          }

	          break;
	        }
	      }
	    }
	  } finally {
	    reentry = false;

	    {
	      ReactCurrentDispatcher.current = previousDispatcher;
	      reenableLogs();
	    }

	    Error.prepareStackTrace = previousPrepareStackTrace;
	  } // Fallback to just using the name if we couldn't make it throw.


	  var name = fn ? fn.displayName || fn.name : '';
	  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

	  {
	    if (typeof fn === 'function') {
	      componentFrameCache.set(fn, syntheticFrame);
	    }
	  }

	  return syntheticFrame;
	}
	function describeFunctionComponentFrame(fn, source, ownerFn) {
	  {
	    return describeNativeComponentFrame(fn, false);
	  }
	}

	function shouldConstruct(Component) {
	  var prototype = Component.prototype;
	  return !!(prototype && prototype.isReactComponent);
	}

	function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

	  if (type == null) {
	    return '';
	  }

	  if (typeof type === 'function') {
	    {
	      return describeNativeComponentFrame(type, shouldConstruct(type));
	    }
	  }

	  if (typeof type === 'string') {
	    return describeBuiltInComponentFrame(type);
	  }

	  switch (type) {
	    case REACT_SUSPENSE_TYPE:
	      return describeBuiltInComponentFrame('Suspense');

	    case REACT_SUSPENSE_LIST_TYPE:
	      return describeBuiltInComponentFrame('SuspenseList');
	  }

	  if (typeof type === 'object') {
	    switch (type.$$typeof) {
	      case REACT_FORWARD_REF_TYPE:
	        return describeFunctionComponentFrame(type.render);

	      case REACT_MEMO_TYPE:
	        // Memo may contain any component type so we recursively resolve it.
	        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

	      case REACT_LAZY_TYPE:
	        {
	          var lazyComponent = type;
	          var payload = lazyComponent._payload;
	          var init = lazyComponent._init;

	          try {
	            // Lazy may contain any component type so we recursively resolve it.
	            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
	          } catch (x) {}
	        }
	    }
	  }

	  return '';
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var loggedTypeFailures = {};
	var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame.setExtraStackFrame(null);
	    }
	  }
	}

	function checkPropTypes(typeSpecs, values, location, componentName, element) {
	  {
	    // $FlowFixMe This is okay but Flow doesn't know it.
	    var has = Function.call.bind(hasOwnProperty);

	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.

	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            // eslint-disable-next-line react-internal/prod-error-codes
	            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
	            err.name = 'Invariant Violation';
	            throw err;
	          }

	          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
	        } catch (ex) {
	          error$1 = ex;
	        }

	        if (error$1 && !(error$1 instanceof Error)) {
	          setCurrentlyValidatingElement(element);

	          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

	          setCurrentlyValidatingElement(null);
	        }

	        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error$1.message] = true;
	          setCurrentlyValidatingElement(element);

	          error('Failed %s type: %s', location, error$1.message);

	          setCurrentlyValidatingElement(null);
	        }
	      }
	    }
	  }
	}

	var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

	function isArray(a) {
	  return isArrayImpl(a);
	}

	/*
	 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
	 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
	 *
	 * The functions in this module will throw an easier-to-understand,
	 * easier-to-debug exception with a clear errors message message explaining the
	 * problem. (Instead of a confusing exception thrown inside the implementation
	 * of the `value` object).
	 */
	// $FlowFixMe only called in DEV, so void return is not possible.
	function typeName(value) {
	  {
	    // toStringTag is needed for namespaced types like Temporal.Instant
	    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
	    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
	    return type;
	  }
	} // $FlowFixMe only called in DEV, so void return is not possible.


	function willCoercionThrow(value) {
	  {
	    try {
	      testStringCoercion(value);
	      return false;
	    } catch (e) {
	      return true;
	    }
	  }
	}

	function testStringCoercion(value) {
	  // If you ended up here by following an exception call stack, here's what's
	  // happened: you supplied an object or symbol value to React (as a prop, key,
	  // DOM attribute, CSS property, string ref, etc.) and when React tried to
	  // coerce it to a string using `'' + value`, an exception was thrown.
	  //
	  // The most common types that will cause this exception are `Symbol` instances
	  // and Temporal objects like `Temporal.Instant`. But any object that has a
	  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
	  // exception. (Library authors do this to prevent users from using built-in
	  // numeric operators like `+` or comparison operators like `>=` because custom
	  // methods are needed to perform accurate arithmetic or comparison.)
	  //
	  // To fix the problem, coerce this object or symbol value to a string before
	  // passing it to React. The most reliable way is usually `String(value)`.
	  //
	  // To find which value is throwing, check the browser or debugger console.
	  // Before this exception was thrown, there should be `console.error` output
	  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
	  // problem and how that type was used: key, atrribute, input value prop, etc.
	  // In most cases, this console output also shows the component and its
	  // ancestor components where the exception happened.
	  //
	  // eslint-disable-next-line react-internal/safe-string-coercion
	  return '' + value;
	}
	function checkKeyStringCoercion(value) {
	  {
	    if (willCoercionThrow(value)) {
	      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

	      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
	    }
	  }
	}

	var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
	var RESERVED_PROPS = {
	  key: true,
	  ref: true,
	  __self: true,
	  __source: true
	};
	var specialPropKeyWarningShown;
	var specialPropRefWarningShown;
	var didWarnAboutStringRefs;

	{
	  didWarnAboutStringRefs = {};
	}

	function hasValidRef(config) {
	  {
	    if (hasOwnProperty.call(config, 'ref')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.ref !== undefined;
	}

	function hasValidKey(config) {
	  {
	    if (hasOwnProperty.call(config, 'key')) {
	      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

	      if (getter && getter.isReactWarning) {
	        return false;
	      }
	    }
	  }

	  return config.key !== undefined;
	}

	function warnIfStringRefCannotBeAutoConverted(config, self) {
	  {
	    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
	      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

	      if (!didWarnAboutStringRefs[componentName]) {
	        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);

	        didWarnAboutStringRefs[componentName] = true;
	      }
	    }
	  }
	}

	function defineKeyPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingKey = function () {
	      if (!specialPropKeyWarningShown) {
	        specialPropKeyWarningShown = true;

	        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingKey.isReactWarning = true;
	    Object.defineProperty(props, 'key', {
	      get: warnAboutAccessingKey,
	      configurable: true
	    });
	  }
	}

	function defineRefPropWarningGetter(props, displayName) {
	  {
	    var warnAboutAccessingRef = function () {
	      if (!specialPropRefWarningShown) {
	        specialPropRefWarningShown = true;

	        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
	      }
	    };

	    warnAboutAccessingRef.isReactWarning = true;
	    Object.defineProperty(props, 'ref', {
	      get: warnAboutAccessingRef,
	      configurable: true
	    });
	  }
	}
	/**
	 * Factory method to create a new React element. This no longer adheres to
	 * the class pattern, so do not use new to call it. Also, instanceof check
	 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
	 * if something is a React Element.
	 *
	 * @param {*} type
	 * @param {*} props
	 * @param {*} key
	 * @param {string|object} ref
	 * @param {*} owner
	 * @param {*} self A *temporary* helper to detect places where `this` is
	 * different from the `owner` when React.createElement is called, so that we
	 * can warn. We want to get rid of owner and replace string `ref`s with arrow
	 * functions, and as long as `this` and owner are the same, there will be no
	 * change in behavior.
	 * @param {*} source An annotation object (added by a transpiler or otherwise)
	 * indicating filename, line number, and/or other information.
	 * @internal
	 */


	var ReactElement = function (type, key, ref, self, source, owner, props) {
	  var element = {
	    // This tag allows us to uniquely identify this as a React Element
	    $$typeof: REACT_ELEMENT_TYPE,
	    // Built-in properties that belong on the element
	    type: type,
	    key: key,
	    ref: ref,
	    props: props,
	    // Record the component responsible for creating this element.
	    _owner: owner
	  };

	  {
	    // The validation flag is currently mutative. We put it on
	    // an external backing store so that we can freeze the whole object.
	    // This can be replaced with a WeakMap once they are implemented in
	    // commonly used development environments.
	    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
	    // the validation flag non-enumerable (where possible, which should
	    // include every environment we run tests in), so the test framework
	    // ignores it.

	    Object.defineProperty(element._store, 'validated', {
	      configurable: false,
	      enumerable: false,
	      writable: true,
	      value: false
	    }); // self and source are DEV only properties.

	    Object.defineProperty(element, '_self', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: self
	    }); // Two elements created in two different places should be considered
	    // equal for testing purposes and therefore we hide it from enumeration.

	    Object.defineProperty(element, '_source', {
	      configurable: false,
	      enumerable: false,
	      writable: false,
	      value: source
	    });

	    if (Object.freeze) {
	      Object.freeze(element.props);
	      Object.freeze(element);
	    }
	  }

	  return element;
	};
	/**
	 * https://github.com/reactjs/rfcs/pull/107
	 * @param {*} type
	 * @param {object} props
	 * @param {string} key
	 */

	function jsxDEV(type, config, maybeKey, source, self) {
	  {
	    var propName; // Reserved names are extracted

	    var props = {};
	    var key = null;
	    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
	    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
	    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
	    // but as an intermediary step, we will use jsxDEV for everything except
	    // <div {...props} key="Hi" />, because we aren't currently able to tell if
	    // key is explicitly declared to be undefined or not.

	    if (maybeKey !== undefined) {
	      {
	        checkKeyStringCoercion(maybeKey);
	      }

	      key = '' + maybeKey;
	    }

	    if (hasValidKey(config)) {
	      {
	        checkKeyStringCoercion(config.key);
	      }

	      key = '' + config.key;
	    }

	    if (hasValidRef(config)) {
	      ref = config.ref;
	      warnIfStringRefCannotBeAutoConverted(config, self);
	    } // Remaining properties are added to a new props object


	    for (propName in config) {
	      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	        props[propName] = config[propName];
	      }
	    } // Resolve default props


	    if (type && type.defaultProps) {
	      var defaultProps = type.defaultProps;

	      for (propName in defaultProps) {
	        if (props[propName] === undefined) {
	          props[propName] = defaultProps[propName];
	        }
	      }
	    }

	    if (key || ref) {
	      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

	      if (key) {
	        defineKeyPropWarningGetter(props, displayName);
	      }

	      if (ref) {
	        defineRefPropWarningGetter(props, displayName);
	      }
	    }

	    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
	  }
	}

	var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
	var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

	function setCurrentlyValidatingElement$1(element) {
	  {
	    if (element) {
	      var owner = element._owner;
	      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
	      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
	    } else {
	      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
	    }
	  }
	}

	var propTypesMisspellWarningShown;

	{
	  propTypesMisspellWarningShown = false;
	}
	/**
	 * Verifies the object is a ReactElement.
	 * See https://reactjs.org/docs/react-api.html#isvalidelement
	 * @param {?object} object
	 * @return {boolean} True if `object` is a ReactElement.
	 * @final
	 */


	function isValidElement(object) {
	  {
	    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	  }
	}

	function getDeclarationErrorAddendum() {
	  {
	    if (ReactCurrentOwner$1.current) {
	      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

	      if (name) {
	        return '\n\nCheck the render method of `' + name + '`.';
	      }
	    }

	    return '';
	  }
	}

	function getSourceInfoErrorAddendum(source) {
	  {
	    if (source !== undefined) {
	      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
	      var lineNumber = source.lineNumber;
	      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
	    }

	    return '';
	  }
	}
	/**
	 * Warn if there's no key explicitly set on dynamic arrays of children or
	 * object keys are not valid. This allows us to keep track of children between
	 * updates.
	 */


	var ownerHasKeyUseWarning = {};

	function getCurrentComponentErrorInfo(parentType) {
	  {
	    var info = getDeclarationErrorAddendum();

	    if (!info) {
	      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

	      if (parentName) {
	        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
	      }
	    }

	    return info;
	  }
	}
	/**
	 * Warn if the element doesn't have an explicit key assigned to it.
	 * This element is in an array. The array could grow and shrink or be
	 * reordered. All children that haven't already been validated are required to
	 * have a "key" property assigned to it. Error statuses are cached so a warning
	 * will only be shown once.
	 *
	 * @internal
	 * @param {ReactElement} element Element that requires a key.
	 * @param {*} parentType element's parent's type.
	 */


	function validateExplicitKey(element, parentType) {
	  {
	    if (!element._store || element._store.validated || element.key != null) {
	      return;
	    }

	    element._store.validated = true;
	    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

	    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
	      return;
	    }

	    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
	    // property, it may be the creator of the child that's responsible for
	    // assigning it a key.

	    var childOwner = '';

	    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
	      // Give the component that originally created this child.
	      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
	    }

	    setCurrentlyValidatingElement$1(element);

	    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

	    setCurrentlyValidatingElement$1(null);
	  }
	}
	/**
	 * Ensure that every element either is passed in a static location, in an
	 * array with an explicit keys property defined, or in an object literal
	 * with valid key property.
	 *
	 * @internal
	 * @param {ReactNode} node Statically passed child of any type.
	 * @param {*} parentType node's parent's type.
	 */


	function validateChildKeys(node, parentType) {
	  {
	    if (typeof node !== 'object') {
	      return;
	    }

	    if (isArray(node)) {
	      for (var i = 0; i < node.length; i++) {
	        var child = node[i];

	        if (isValidElement(child)) {
	          validateExplicitKey(child, parentType);
	        }
	      }
	    } else if (isValidElement(node)) {
	      // This element was passed in a valid location.
	      if (node._store) {
	        node._store.validated = true;
	      }
	    } else if (node) {
	      var iteratorFn = getIteratorFn(node);

	      if (typeof iteratorFn === 'function') {
	        // Entry iterators used to provide implicit keys,
	        // but now we print a separate warning for them later.
	        if (iteratorFn !== node.entries) {
	          var iterator = iteratorFn.call(node);
	          var step;

	          while (!(step = iterator.next()).done) {
	            if (isValidElement(step.value)) {
	              validateExplicitKey(step.value, parentType);
	            }
	          }
	        }
	      }
	    }
	  }
	}
	/**
	 * Given an element, validate that its props follow the propTypes definition,
	 * provided by the type.
	 *
	 * @param {ReactElement} element
	 */


	function validatePropTypes(element) {
	  {
	    var type = element.type;

	    if (type === null || type === undefined || typeof type === 'string') {
	      return;
	    }

	    var propTypes;

	    if (typeof type === 'function') {
	      propTypes = type.propTypes;
	    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
	    // Inner props are checked in the reconciler.
	    type.$$typeof === REACT_MEMO_TYPE)) {
	      propTypes = type.propTypes;
	    } else {
	      return;
	    }

	    if (propTypes) {
	      // Intentionally inside to avoid triggering lazy initializers:
	      var name = getComponentNameFromType(type);
	      checkPropTypes(propTypes, element.props, 'prop', name, element);
	    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
	      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

	      var _name = getComponentNameFromType(type);

	      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
	    }

	    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
	      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
	    }
	  }
	}
	/**
	 * Given a fragment, validate that it can only be provided with fragment props
	 * @param {ReactElement} fragment
	 */


	function validateFragmentProps(fragment) {
	  {
	    var keys = Object.keys(fragment.props);

	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];

	      if (key !== 'children' && key !== 'key') {
	        setCurrentlyValidatingElement$1(fragment);

	        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

	        setCurrentlyValidatingElement$1(null);
	        break;
	      }
	    }

	    if (fragment.ref !== null) {
	      setCurrentlyValidatingElement$1(fragment);

	      error('Invalid attribute `ref` supplied to `React.Fragment`.');

	      setCurrentlyValidatingElement$1(null);
	    }
	  }
	}

	var didWarnAboutKeySpread = {};
	function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
	  {
	    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
	    // succeed and there will likely be errors in render.

	    if (!validType) {
	      var info = '';

	      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
	        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
	      }

	      var sourceInfo = getSourceInfoErrorAddendum(source);

	      if (sourceInfo) {
	        info += sourceInfo;
	      } else {
	        info += getDeclarationErrorAddendum();
	      }

	      var typeString;

	      if (type === null) {
	        typeString = 'null';
	      } else if (isArray(type)) {
	        typeString = 'array';
	      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
	        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
	        info = ' Did you accidentally export a JSX literal instead of a component?';
	      } else {
	        typeString = typeof type;
	      }

	      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
	    }

	    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
	    // TODO: Drop this when these are no longer allowed as the type argument.

	    if (element == null) {
	      return element;
	    } // Skip key warning if the type isn't valid since our key validation logic
	    // doesn't expect a non-string/function type and can throw confusing errors.
	    // We don't want exception behavior to differ between dev and prod.
	    // (Rendering will throw with a helpful message and as soon as the type is
	    // fixed, the key warnings will appear.)


	    if (validType) {
	      var children = props.children;

	      if (children !== undefined) {
	        if (isStaticChildren) {
	          if (isArray(children)) {
	            for (var i = 0; i < children.length; i++) {
	              validateChildKeys(children[i], type);
	            }

	            if (Object.freeze) {
	              Object.freeze(children);
	            }
	          } else {
	            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
	          }
	        } else {
	          validateChildKeys(children, type);
	        }
	      }
	    }

	    {
	      if (hasOwnProperty.call(props, 'key')) {
	        var componentName = getComponentNameFromType(type);
	        var keys = Object.keys(props).filter(function (k) {
	          return k !== 'key';
	        });
	        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

	        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
	          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

	          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

	          didWarnAboutKeySpread[componentName + beforeExample] = true;
	        }
	      }
	    }

	    if (type === REACT_FRAGMENT_TYPE) {
	      validateFragmentProps(element);
	    } else {
	      validatePropTypes(element);
	    }

	    return element;
	  }
	} // These two functions exist to still get child warnings in dev
	// even with the prod transform. This means that jsxDEV is purely
	// opt-in behavior for better messages but that we won't stop
	// giving you warnings if you use production apis.

	function jsxWithValidationStatic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, true);
	  }
	}
	function jsxWithValidationDynamic(type, props, key) {
	  {
	    return jsxWithValidation(type, props, key, false);
	  }
	}

	var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
	// for now we can ship identical prod functions

	var jsxs =  jsxWithValidationStatic ;

	reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_development.jsx = jsx;
	reactJsxRuntime_development.jsxs = jsxs;
	  })();
	}
	return reactJsxRuntime_development;
}

if (process.env.NODE_ENV === 'production') {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}

var jsxRuntimeExports = jsxRuntime.exports;

const AUTH_BASE_URL = "https://api.altan.ai/tables";
const REFRESH_TOKEN_INTERVAL = 25 * 60 * 1000; // 25 minutes (before 30 min expiry)

const createAuthenticatedApi = (tableId, storageKey = 'auth_user') => {
    const api = axios.create({
        baseURL: AUTH_BASE_URL,
        withCredentials: true,
    });
    // Add request interceptor to inject the auth token
    api.interceptors.request.use((config) => {
        // Always try localStorage first
        const token = localStorage.getItem(`${storageKey}_token`);
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    });
    // Add response interceptor to handle errors
    api.interceptors.response.use((response) => response, (error) => {
        var _a;
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}_token`);
        }
        return Promise.reject(error);
    });
    return api;
};

const AuthContext = require$$0.createContext(null);
// Add refresh token interval constant
function AuthProvider({ children, tableId, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, }) {
    const [user, setUser] = require$$0.useState(null);
    const [error, setError] = require$$0.useState(null);
    const [isLoading, setIsLoading] = require$$0.useState(true);
    // Create the API instance first
    const api = require$$0.useMemo(() => createAuthenticatedApi(tableId, storageKey), [tableId, storageKey]);
    const mapUserData = (userData) => (Object.assign({ id: Number(userData.id || 0), email: userData.email || "", name: userData.name, surname: userData.surname, avatar: Array.isArray(userData.avatar) ? userData.avatar : [], verified: Boolean(userData.verified) }, Object.fromEntries(Object.entries(userData).filter(([key]) => !["id", "email", "name", "surname", "avatar", "verified"].includes(key)))));
    // Define logout first since other functions depend on it
    const logout = require$$0.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield api.post(`/auth/logout?table_id=${tableId}`);
        }
        finally {
            if (authenticationOptions.persistSession) {
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}_token`);
            }
            setUser(null);
        }
    }), [api, storageKey, authenticationOptions.persistSession, tableId]);
    // Now we can use logout in refreshToken
    const refreshToken = require$$0.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = localStorage.getItem(`${storageKey}_token`);
            if (!token)
                return;
            const { data: { access_token } } = yield api.post(`/auth/refresh?table_id=${tableId}`);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(`${storageKey}_token`, access_token);
            }
        }
        catch (error) {
            console.error('Token refresh failed:', error);
            yield logout();
        }
    }), [api, storageKey, authenticationOptions.persistSession, logout, tableId]);
    // Initialize auth state from storage
    require$$0.useEffect(() => {
        if (authenticationOptions.persistSession) {
            const storedUser = localStorage.getItem(storageKey);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setIsLoading(false);
    }, [storageKey, authenticationOptions.persistSession]);
    // Notify on auth state changes
    require$$0.useEffect(() => {
        onAuthStateChange === null || onAuthStateChange === void 0 ? void 0 : onAuthStateChange(user);
    }, [user, onAuthStateChange]);
    // Add refresh token interval
    require$$0.useEffect(() => {
        if (!user)
            return;
        // Initial refresh after 25 minutes
        const refreshInterval = setInterval(refreshToken, REFRESH_TOKEN_INTERVAL);
        return () => {
            clearInterval(refreshInterval);
        };
    }, [user, refreshToken]);
    // Update login to start refresh cycle
    const login = require$$0.useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password }) {
        var _b, _c;
        try {
            setIsLoading(true);
            setError(null);
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const { data: { access_token } } = yield api.post(`/auth/login?table_id=${tableId}`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (authenticationOptions.persistSession && access_token) {
                localStorage.setItem(`${storageKey}_token`, access_token);
            }
            // Add tableId to /me request
            const { data: userData } = yield api.get(`/auth/me?table_id=${tableId}`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            const authUser = mapUserData(userData);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(authUser));
            }
            setUser(authUser);
        }
        catch (err) {
            const errorMessage = ((_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detail) || "Invalid email or password";
            setError(new Error(errorMessage));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [api, storageKey, authenticationOptions.persistSession, tableId]);
    const register = require$$0.useCallback((_a) => __awaiter(this, void 0, void 0, function* () {
        var _b, _c;
        var { email, password, name, surname } = _a, additionalFields = __rest(_a, ["email", "password", "name", "surname"]);
        try {
            setIsLoading(true);
            setError(null);
            const response = yield api.post(`/auth/register?table_id=${tableId}`, Object.assign({ email,
                password,
                name,
                surname }, additionalFields));
            if (response.status === 200) {
                yield login({ email, password });
            }
        }
        catch (err) {
            const errorMessage = ((_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detail) || "Registration failed";
            setError(new Error(errorMessage));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [api, login, tableId]);
    // Update checkAuth to use token
    require$$0.useEffect(() => {
        const checkAuth = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = localStorage.getItem(`${storageKey}_token`);
                if (!token) {
                    setUser(null);
                    return;
                }
                const { data: userData } = yield api.get(`/auth/me?table_id=${tableId}`);
                const authUser = mapUserData(userData);
                setUser(authUser);
                if (authenticationOptions.persistSession) {
                    localStorage.setItem(storageKey, JSON.stringify(authUser));
                }
            }
            catch (error) {
                setUser(null);
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}_token`);
            }
            finally {
                setIsLoading(false);
            }
        });
        checkAuth();
    }, [api, storageKey, authenticationOptions.persistSession, tableId]);
    const resetPassword = require$$0.useCallback((email) => __awaiter(this, void 0, void 0, function* () {
        // Implement password reset logic here
        throw new Error("Not implemented");
    }), []);
    const updateProfile = require$$0.useCallback((updates) => __awaiter(this, void 0, void 0, function* () {
        if (!user) {
            throw new Error("No user logged in");
        }
        try {
            setIsLoading(true);
            setError(null);
            const apiUpdates = Object.assign({}, updates);
            // Special handling for avatar field
            if ('avatar' in updates) {
                if (updates.avatar === null) {
                    // If explicitly set to null, remove the avatar
                    apiUpdates.avatar = [];
                }
                else if (typeof updates.avatar === 'string') {
                    // If it's a base64 string (from file upload), create new media object
                    apiUpdates.avatar = [{
                            file_name: 'avatar.jpg',
                            mime_type: 'image/jpeg',
                            file_content: updates.avatar
                        }];
                }
                else {
                    // If it's already an array of media objects, use as is
                    apiUpdates.avatar = updates.avatar;
                }
            }
            const response = yield api.patch(`/auth/update?table_id=${tableId}`, apiUpdates);
            const updatedUser = mapUserData(response.data.user);
            setUser(updatedUser);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(updatedUser));
            }
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Profile update failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [user, api, storageKey, authenticationOptions.persistSession, tableId]);
    const continueWithGoogle = require$$0.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            setError(null);
            const authWindow = window.open(`https://api.altan.ai/tables/auth/google/authorize?table_id=${tableId}&redirect_url=${encodeURIComponent(window.location.origin)}`, "Auth", "width=600,height=600,scrollbars=yes");
            const userData = yield new Promise((resolve, reject) => {
                let authTimeout;
                function handleAuth(event) {
                    // Verify origin
                    if (event.origin !== "https://api.altan.ai")
                        return;
                    // Clear timeout first
                    if (authTimeout)
                        clearTimeout(authTimeout);
                    // Remove listener
                    window.removeEventListener("message", handleAuth);
                    const response = event.data;
                    if (response.error) {
                        reject(new Error(response.error));
                    }
                    else if (response.success) {
                        resolve(response);
                    }
                    else {
                        reject(new Error("Invalid response format"));
                    }
                }
                window.addEventListener("message", handleAuth);
                authTimeout = setTimeout(() => {
                    window.removeEventListener("message", handleAuth);
                    reject(new Error("Authentication timed out"));
                }, 120000);
            });
            // Handle successful authentication
            const { access_token, user: googleUser } = userData;
            if (authenticationOptions.persistSession && access_token) {
                localStorage.setItem(`${storageKey}_token`, access_token);
                // Set the token in the API instance
                api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
            }
            // Verify the token works by making a /me call
            const { data: verifiedUser } = yield api.get(`/auth/me?table_id=${tableId}`);
            const authUser = mapUserData(verifiedUser);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(authUser));
            }
            setUser(authUser);
            return authUser;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Authentication failed";
            setError(new Error(errorMessage));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [api, tableId, storageKey, authenticationOptions.persistSession]);
    const value = require$$0.useMemo(() => ({
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        continueWithGoogle: () => __awaiter(this, void 0, void 0, function* () {
            yield continueWithGoogle();
        }),
        api,
    }), [user, isLoading, error, login, logout, register, resetPassword, updateProfile, continueWithGoogle, api]);
    return jsxRuntimeExports.jsx(AuthContext.Provider, { value: value, children: children });
}
function useAuth() {
    const context = require$$0.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

function ProtectedRoute({ children, redirectTo = "/login", }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return jsxRuntimeExports.jsx("div", { children: "Loading..." }); // Or your loading component
    }
    if (!isAuthenticated) {
        return jsxRuntimeExports.jsx(reactRouterDom.Navigate, { to: redirectTo, replace: true });
    }
    return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: children });
}

function GoogleIcon() {
    return (jsxRuntimeExports.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", viewBox: "0 0 32 32", width: "20", height: "20", children: [jsxRuntimeExports.jsx("defs", { children: jsxRuntimeExports.jsx("path", { id: "A", d: "M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" }) }), jsxRuntimeExports.jsx("clipPath", { id: "B", children: jsxRuntimeExports.jsx("use", { xlinkHref: "#A" }) }), jsxRuntimeExports.jsxs("g", { transform: "matrix(.727273 0 0 .727273 -.954545 -1.45455)", children: [jsxRuntimeExports.jsx("path", { d: "M0 37V11l17 13z", clipPath: "url(#B)", fill: "#fbbc05" }), jsxRuntimeExports.jsx("path", { d: "M0 11l17 13 7-6.1L48 14V0H0z", clipPath: "url(#B)", fill: "#ea4335" }), jsxRuntimeExports.jsx("path", { d: "M0 37l30-23 7.9 1L48 0v48H0z", clipPath: "url(#B)", fill: "#34a853" }), jsxRuntimeExports.jsx("path", { d: "M48 48L17 24l-4-3 35-10z", clipPath: "url(#B)", fill: "#4285f4" })] })] }));
}

function SignIn(_a) {
    var _b, _c;
    var { appearance = { theme: 'light' }, companyName, signUpUrl = '/sign-up', routing = 'path', withSignUp = true } = _a, props = __rest(_a, ["appearance", "companyName", "signUpUrl", "routing", "withSignUp"]);
    const { continueWithGoogle, login, isLoading, isAuthenticated, error } = useAuth();
    const [email, setEmail] = require$$0.useState(((_b = props.initialValues) === null || _b === void 0 ? void 0 : _b.emailAddress) || "");
    const [password, setPassword] = require$$0.useState(((_c = props.initialValues) === null || _c === void 0 ? void 0 : _c.password) || "");
    // Theme styles object
    const theme = {
        light: {
            background: "bg-white",
            card: "bg-white",
            text: "text-gray-900",
            textMuted: "text-gray-600",
            input: "bg-white text-gray-900 border-gray-300",
            button: "bg-black hover:bg-gray-900 text-white",
            googleButton: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
            error: {
                background: "bg-red-50",
                text: "text-red-800",
                icon: "text-red-400"
            }
        },
        dark: {
            background: "bg-gray-900",
            card: "bg-gray-800",
            text: "text-white",
            textMuted: "text-gray-300",
            input: "bg-gray-800 text-white border-gray-600",
            button: "bg-white hover:bg-gray-100 text-black",
            googleButton: "bg-gray-800 hover:bg-gray-700 text-white border-gray-600",
            error: {
                background: "bg-red-900/20",
                text: "text-red-200",
                icon: "text-red-400"
            }
        }
    }[appearance.theme || 'light'];
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        yield login({ email, password });
    });
    if (isAuthenticated)
        return null;
    const handleSignUpClick = (e) => {
        e.preventDefault();
        if (routing === 'hash') {
            window.location.hash = signUpUrl;
        }
        else {
            window.location.href = signUpUrl;
        }
    };
    return (jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full mx-auto space-y-8", children: [jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("h2", { className: `text-center text-3xl font-bold ${theme.text}`, children: companyName ? `Sign in to ${companyName}` : "Sign in" }), jsxRuntimeExports.jsx("p", { className: `mt-2 text-center text-sm ${theme.textMuted}`, children: "Welcome back! Please sign in to continue" })] }), jsxRuntimeExports.jsx("button", { onClick: () => continueWithGoogle(), className: `w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${theme.googleButton}`, children: jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [jsxRuntimeExports.jsx(GoogleIcon, {}), jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Continue with Google" })] }) }), jsxRuntimeExports.jsxs("div", { className: "relative", children: [jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: jsxRuntimeExports.jsx("div", { className: `w-full border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}` }) }), jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: jsxRuntimeExports.jsx("span", { className: `px-2 ${theme.card} ${theme.textMuted}`, children: "or" }) })] }), jsxRuntimeExports.jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("label", { htmlFor: "email", className: `block text-sm font-medium ${theme.text}`, children: "Email address" }), jsxRuntimeExports.jsx("input", { id: "email", type: "email", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: email, onChange: (e) => setEmail(e.target.value) })] }), jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("label", { htmlFor: "password", className: `block text-sm font-medium ${theme.text}`, children: "Password" }), jsxRuntimeExports.jsx("input", { id: "password", type: "password", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: password, onChange: (e) => setPassword(e.target.value) })] }), error && (jsxRuntimeExports.jsx("div", { className: `rounded-md ${theme.error.background} p-4`, children: jsxRuntimeExports.jsxs("div", { className: "flex", children: [jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: jsxRuntimeExports.jsx("svg", { className: `h-5 w-5 ${theme.error.icon}`, viewBox: "0 0 20 20", fill: "currentColor", children: jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), jsxRuntimeExports.jsx("div", { className: "ml-3", children: jsxRuntimeExports.jsx("p", { className: `text-sm font-medium ${theme.error.text}`, children: error.message }) })] }) })), jsxRuntimeExports.jsx("button", { type: "submit", className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button}`, disabled: isLoading, children: isLoading ? "Signing in..." : "Continue" })] }), jsxRuntimeExports.jsxs("div", { className: `mt-8 border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`, children: [withSignUp && (jsxRuntimeExports.jsxs("div", { className: "text-center mb-4", children: [jsxRuntimeExports.jsx("span", { className: theme.textMuted, children: "Don't have an account? " }), jsxRuntimeExports.jsx("a", { href: signUpUrl, onClick: handleSignUpClick, className: "text-blue-600 hover:text-blue-400", children: "Sign up" })] })), jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-center space-x-2 text-xs ${theme.textMuted}`, children: [jsxRuntimeExports.jsx("span", { children: "Secured by" }), jsxRuntimeExports.jsx("img", { src: appearance.theme === "dark"
                                    ? "https://altan.ai/logos/horizontalWhite.png"
                                    : "https://altan.ai/logos/horizontalBlack.png", alt: "Altan", className: "h-3" })] })] })] }));
}

function SignUp(_a) {
    var _b, _c;
    var { appearance = { theme: 'light' }, companyName, signInUrl = '/sign-in', routing = 'path', withSignIn = true } = _a, props = __rest(_a, ["appearance", "companyName", "signInUrl", "routing", "withSignIn"]);
    const { continueWithGoogle, register, isLoading, isAuthenticated, error } = useAuth();
    const [email, setEmail] = require$$0.useState(((_b = props.initialValues) === null || _b === void 0 ? void 0 : _b.emailAddress) || "");
    const [password, setPassword] = require$$0.useState(((_c = props.initialValues) === null || _c === void 0 ? void 0 : _c.password) || "");
    const [confirmPassword, setConfirmPassword] = require$$0.useState("");
    const [validationError, setValidationError] = require$$0.useState(null);
    // Theme styles object
    const theme = {
        light: {
            background: "bg-white",
            card: "bg-white",
            text: "text-gray-900",
            textMuted: "text-gray-600",
            input: "bg-white text-gray-900 border-gray-300",
            button: "bg-black hover:bg-gray-900 text-white",
            googleButton: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
            error: {
                background: "bg-red-50",
                text: "text-red-800",
                icon: "text-red-400"
            }
        },
        dark: {
            background: "bg-gray-900",
            card: "bg-gray-800",
            text: "text-white",
            textMuted: "text-gray-300",
            input: "bg-gray-800 text-white border-gray-600",
            button: "bg-white hover:bg-gray-100 text-black",
            googleButton: "bg-gray-800 hover:bg-gray-700 text-white border-gray-600",
            error: {
                background: "bg-red-900/20",
                text: "text-red-200",
                icon: "text-red-400"
            }
        }
    }[appearance.theme || 'light'];
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setValidationError(null);
        if (password !== confirmPassword) {
            setValidationError("Passwords don't match");
            return;
        }
        try {
            yield register({
                email,
                password,
                displayName: ""
            });
        }
        catch (err) {
            // Error is already handled by AuthProvider
            // No need to do anything here as the error will be displayed through the error state
        }
    });
    if (isAuthenticated)
        return null;
    const handleSignInClick = (e) => {
        e.preventDefault();
        if (routing === 'hash') {
            window.location.hash = signInUrl;
        }
        else {
            window.location.href = signInUrl;
        }
    };
    return (jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full mx-auto space-y-8", children: [jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("h2", { className: `text-center text-3xl font-bold ${theme.text}`, children: companyName ? `Create your ${companyName} account` : "Create account" }), jsxRuntimeExports.jsx("p", { className: `mt-2 text-center text-sm ${theme.textMuted}`, children: "Get started by creating your account" })] }), jsxRuntimeExports.jsx("button", { onClick: () => continueWithGoogle(), className: `w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${theme.googleButton}`, children: jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [jsxRuntimeExports.jsx(GoogleIcon, {}), jsxRuntimeExports.jsx("span", { className: "ml-2", children: "Continue with Google" })] }) }), jsxRuntimeExports.jsxs("div", { className: "relative", children: [jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: jsxRuntimeExports.jsx("div", { className: `w-full border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}` }) }), jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: jsxRuntimeExports.jsx("span", { className: `px-2 ${theme.card} ${theme.textMuted}`, children: "or" }) })] }), jsxRuntimeExports.jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("label", { htmlFor: "email", className: `block text-sm font-medium ${theme.text}`, children: "Email address" }), jsxRuntimeExports.jsx("input", { id: "email", type: "email", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: email, onChange: (e) => setEmail(e.target.value) })] }), jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("label", { htmlFor: "password", className: `block text-sm font-medium ${theme.text}`, children: "Password" }), jsxRuntimeExports.jsx("input", { id: "password", type: "password", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: password, onChange: (e) => setPassword(e.target.value) })] }), jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("label", { htmlFor: "confirmPassword", className: `block text-sm font-medium ${theme.text}`, children: "Confirm Password" }), jsxRuntimeExports.jsx("input", { id: "confirmPassword", type: "password", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) })] }), (error || validationError) && (jsxRuntimeExports.jsx("div", { className: `rounded-md ${theme.error.background} p-4`, children: jsxRuntimeExports.jsxs("div", { className: "flex", children: [jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: jsxRuntimeExports.jsx("svg", { className: `h-5 w-5 ${theme.error.icon}`, viewBox: "0 0 20 20", fill: "currentColor", children: jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), jsxRuntimeExports.jsx("div", { className: "ml-3", children: jsxRuntimeExports.jsx("p", { className: `text-sm font-medium ${theme.error.text}`, children: validationError || (error === null || error === void 0 ? void 0 : error.message) }) })] }) })), jsxRuntimeExports.jsx("button", { type: "submit", className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button}`, disabled: isLoading, children: isLoading ? "Creating account..." : "Create account" })] }), jsxRuntimeExports.jsxs("div", { className: `mt-8 border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`, children: [withSignIn && (jsxRuntimeExports.jsxs("div", { className: "text-center mb-4", children: [jsxRuntimeExports.jsx("span", { className: theme.textMuted, children: "Already have an account? " }), jsxRuntimeExports.jsx("a", { href: signInUrl, onClick: handleSignInClick, className: "text-blue-600 hover:text-blue-400", children: "Sign in" })] })), jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-center space-x-2 text-xs ${theme.textMuted}`, children: [jsxRuntimeExports.jsx("span", { children: "Secured by" }), jsxRuntimeExports.jsx("img", { src: appearance.theme === "dark"
                                    ? "https://altan.ai/logos/horizontalWhite.png"
                                    : "https://altan.ai/logos/horizontalBlack.png", alt: "Altan", className: "h-3" })] })] })] }));
}

function Logout({ appearance = { theme: 'light' }, onLogout, className = '', }) {
    const { logout } = useAuth();
    const theme = {
        light: {
            button: 'text-red-600 hover:text-red-800',
        },
        dark: {
            button: 'text-red-400 hover:text-red-200',
        }
    }[appearance.theme || 'light'];
    const handleLogout = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield logout();
            onLogout === null || onLogout === void 0 ? void 0 : onLogout();
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    });
    return (jsxRuntimeExports.jsxs("button", { onClick: handleLogout, className: `flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 ${theme.button} ${className}`, children: [jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), jsxRuntimeExports.jsx("span", { children: "Logout" })] }));
}

const ALWAYS_HIDDEN_FIELDS = [
    'id', 'verified', 'created_time', 'last_modified_time', 'last_modified_by', 'password'
];
const DEFAULT_EDITABLE_FIELDS = [
    'name',
    'surname',
    'email',
];
function UserProfile({ appearance = { theme: "light" }, routing = "path", path = "/user-profile", showCustomFields = true, editableFields = DEFAULT_EDITABLE_FIELDS, hiddenFields = [], customPages = [], fallback, }) {
    var _a;
    const { user, updateProfile, isLoading, error } = useAuth();
    const [isEditing, setIsEditing] = require$$0.useState(false);
    const [formData, setFormData] = require$$0.useState({});
    const fileInputRef = require$$0.useRef(null);
    if (!user)
        return fallback || null;
    const themeClasses = {
        light: {
            background: "bg-gray-50",
            card: "bg-white",
            text: "text-gray-900",
            textSecondary: "text-gray-700",
            textMuted: "text-gray-500",
            border: "border-gray-300",
            primary: "bg-primary-600 hover:bg-primary-700",
            buttonText: "text-white",
        },
        dark: {
            background: "bg-gray-900",
            card: "bg-gray-800",
            text: "text-white",
            textSecondary: "text-gray-300",
            textMuted: "text-gray-400",
            border: "border-gray-700",
            primary: "bg-primary-500 hover:bg-primary-600",
            buttonText: "text-white",
        },
    };
    const theme = themeClasses[appearance.theme || "light"];
    const allHiddenFields = [...ALWAYS_HIDDEN_FIELDS, ...hiddenFields];
    const getDisplayFields = () => {
        return Object.entries(user).filter(([key]) => {
            if (allHiddenFields.includes(key))
                return false;
            if (!showCustomFields && !DEFAULT_EDITABLE_FIELDS.includes(key))
                return false;
            return true;
        });
    };
    const handleAvatarChange = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            const reader = new FileReader();
            reader.onloadend = () => __awaiter(this, void 0, void 0, function* () {
                const base64Content = reader.result;
                yield updateProfile({
                    avatar: [{
                            file_name: 'avatar.jpg',
                            mime_type: file.type || 'image/jpeg',
                            file_content: base64Content.split(',')[1]
                        }]
                });
            });
            reader.readAsDataURL(file);
        }
        catch (err) {
            console.error('Failed to update avatar:', err);
        }
    });
    const handleEdit = () => {
        setFormData(user);
        setIsEditing(true);
    };
    const handleCancel = () => {
        setFormData({});
        setIsEditing(false);
    };
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateProfile(formData);
            setIsEditing(false);
        }
        catch (err) {
            // Error handling is managed by AuthProvider
        }
    });
    return (jsxRuntimeExports.jsx("div", { className: `max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 ${theme.background}`, children: jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [jsxRuntimeExports.jsxs("div", { className: `${theme.card} shadow rounded-lg p-6`, children: [jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-6", children: [jsxRuntimeExports.jsx("h1", { className: `text-2xl font-bold ${theme.text}`, children: "Profile Settings" }), jsxRuntimeExports.jsx(Logout, { appearance: appearance })] }), jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-6", children: [jsxRuntimeExports.jsxs("div", { className: "relative", children: [jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full overflow-hidden bg-gray-200", children: Array.isArray(user.avatar) && ((_a = user.avatar[0]) === null || _a === void 0 ? void 0 : _a.url) ? (jsxRuntimeExports.jsx("img", { src: user.avatar[0].url, alt: "Profile", className: "w-full h-full object-cover" })) : (jsxRuntimeExports.jsx("div", { className: `w-full h-full flex items-center justify-center ${theme.textMuted}`, children: jsxRuntimeExports.jsx("svg", { className: "w-12 h-12", fill: "currentColor", viewBox: "0 0 24 24", children: jsxRuntimeExports.jsx("path", { d: "M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z" }) }) })) }), jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleAvatarChange, accept: "image/*", className: "hidden" }), jsxRuntimeExports.jsx("button", { onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: `absolute bottom-0 right-0 p-1.5 rounded-full ${theme.primary} ${theme.buttonText}`, children: jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }) })] }), jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsx("h2", { className: `text-2xl font-bold ${theme.text}`, children: user.name || user.email }), Array.isArray(user.avatar) && user.avatar.length > 0 && (jsxRuntimeExports.jsx("button", { onClick: () => updateProfile({ avatar: [] }), className: `text-sm ${theme.textMuted} hover:${theme.text}`, children: "Remove avatar" }))] })] })] }), jsxRuntimeExports.jsx("div", { className: `${theme.card} shadow rounded-lg`, children: jsxRuntimeExports.jsxs("div", { className: "px-4 py-5 sm:p-6", children: [jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [jsxRuntimeExports.jsx("h3", { className: `text-lg font-medium ${theme.text}`, children: "Profile Information" }), !isEditing ? (jsxRuntimeExports.jsx("button", { onClick: handleEdit, className: `px-4 py-2 rounded-md ${theme.primary} ${theme.buttonText}`, children: "Edit Profile" })) : (jsxRuntimeExports.jsxs("div", { className: "space-x-4", children: [jsxRuntimeExports.jsx("button", { onClick: handleCancel, className: `px-4 py-2 border ${theme.border} rounded-md ${theme.textSecondary}`, children: "Cancel" }), jsxRuntimeExports.jsx("button", { onClick: handleSave, disabled: isLoading, className: `px-4 py-2 rounded-md ${theme.primary} ${theme.buttonText} disabled:opacity-50`, children: isLoading ? "Saving..." : "Save Changes" })] }))] }), jsxRuntimeExports.jsx("div", { className: "space-y-6", children: getDisplayFields().map(([key, value]) => (jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [jsxRuntimeExports.jsx("label", { className: `block text-sm font-medium ${theme.textMuted}`, children: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), isEditing && editableFields.includes(key) ? (jsxRuntimeExports.jsx("input", { type: "text", value: formData[key] || "", onChange: (e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { [key]: e.target.value }))), className: `block w-full rounded-md ${theme.border} shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${theme.card} ${theme.text}` })) : (jsxRuntimeExports.jsx("div", { className: `text-sm ${theme.text}`, children: value || "Not set" }))] }, key))) })] }) }), error && (jsxRuntimeExports.jsx("div", { className: "rounded-md bg-red-50 dark:bg-red-900 p-4", children: jsxRuntimeExports.jsxs("div", { className: "flex", children: [jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), jsxRuntimeExports.jsx("div", { className: "ml-3", children: jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-red-800 dark:text-red-200", children: error.message }) })] }) }))] }) }));
}

exports.AuthProvider = AuthProvider;
exports.Logout = Logout;
exports.ProtectedRoute = ProtectedRoute;
exports.SignIn = SignIn;
exports.SignUp = SignUp;
exports.UserProfile = UserProfile;
exports.useAuth = useAuth;
//# sourceMappingURL=index.js.map
