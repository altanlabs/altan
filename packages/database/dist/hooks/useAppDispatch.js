"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppDispatch = void 0;
const react_redux_1 = require("react-redux");
// Let the hook infer the correct dispatch type (including async thunks)
const useAppDispatch = () => (0, react_redux_1.useDispatch)();
exports.useAppDispatch = useAppDispatch;
//# sourceMappingURL=useAppDispatch.js.map