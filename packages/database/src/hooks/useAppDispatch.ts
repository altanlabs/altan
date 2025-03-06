import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/types";

// Let the hook infer the correct dispatch type (including async thunks)
export const useAppDispatch = () => useDispatch<AppDispatch>(); 