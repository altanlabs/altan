/**
 * State Shape Validator
 * Validates that the room state structure matches expected schema
 * Helps prevent bugs from property name mismatches and structural changes
 */

import type { RoomState } from '../types/state';

/**
 * Expected shape of the flattened room state
 * This defines all top-level properties that should exist in state.room
 */
const EXPECTED_ROOM_STATE_SHAPE: Record<string, string> = {
  // From roomSlice (core room data)
  room: 'object|null',
  userRooms: 'array',
  userRoomsPagination: 'object',
  searchRooms: 'object',
  account: 'object|null',
  roomContext: 'any',
  authorization_requests: 'array',

  // From messagesSlice
  messages: 'object',
  messagesContent: 'object',
  messagesExecutions: 'object',
  executions: 'object',

  // From messagePartsSlice
  messageParts: 'object',

  // From threadsSlice
  threads: 'object',
  mainThread: 'string|null',
  thread: 'object',
  temporaryThread: 'object|null',

  // From membersSlice
  members: 'object',
  me: 'object|null',

  // From tabsSlice
  tabs: 'object',

  // From voiceSlice
  voiceConversations: 'object',

  // From lifecycleSlice
  activationLifecycles: 'object',
  responseLifecycles: 'object',
  runningResponses: 'object',

  // From uiSlice
  drawerOpen: 'boolean',
  isRealtimeCall: 'boolean',
  contextMenu: 'any',
  uploadProgress: 'any',
  isUploading: 'boolean',
  initialized: 'object',
  loading: 'object',
};

/**
 * Type mappings for validation
 */
const typeMatches = (value: any, expectedType: string): boolean => {
  const actualType = Array.isArray(value) ? 'array' : typeof value;

  // Handle union types (e.g., "string|null")
  const allowedTypes = expectedType.split('|');

  // Check if null is explicitly allowed
  if (value === null && allowedTypes.includes('null')) {
    return true;
  }

  // Check if undefined is explicitly allowed
  if (value === undefined && allowedTypes.includes('undefined')) {
    return true;
  }

  // 'any' type allows everything except undefined
  if (allowedTypes.includes('any') && value !== undefined) {
    return true;
  }

  // Check if actual type matches any of the allowed types
  return allowedTypes.includes(actualType);
};

/**
 * Validate a single property of the room state
 */
const validateProperty = (
  key: string,
  value: any,
  expectedType: string,
  errors: string[],
  warnings: string[],
): void => {
  if (!typeMatches(value, expectedType)) {
    const actualType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    errors.push(
      `Property '${key}' has incorrect type. Expected: ${expectedType}, Got: ${actualType}`,
    );
  }

  // Additional validation for nested structures
  if (key === 'messages' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`messages.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`messages.allIds is missing or not an array`);
    }
  }

  if (key === 'messageParts' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`messageParts.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`messageParts.allIds is missing or not an array`);
    }
    if (!value.byMessageId || typeof value.byMessageId !== 'object') {
      errors.push(`messageParts.byMessageId is missing or not an object`);
    }
  }

  if (key === 'threads' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`threads.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`threads.allIds is missing or not an array`);
    }
  }

  if (key === 'members' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`members.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`members.allIds is missing or not an array`);
    }
  }

  if (key === 'tabs' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`tabs.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`tabs.allIds is missing or not an array`);
    }
  }

  if (key === 'executions' && value && typeof value === 'object') {
    if (!value.byId || typeof value.byId !== 'object') {
      errors.push(`executions.byId is missing or not an object`);
    }
    if (!Array.isArray(value.allIds)) {
      errors.push(`executions.allIds is missing or not an array`);
    }
  }

  if (key === 'thread' && value && typeof value === 'object') {
    if (!value.drawer || typeof value.drawer !== 'object') {
      errors.push(`thread.drawer is missing or not an object`);
    }
    if (!value.main || typeof value.main !== 'object') {
      errors.push(`thread.main is missing or not an object`);
    }
    if (!value.respond || typeof value.respond !== 'object') {
      errors.push(`thread.respond is missing or not an object`);
    }
  }

  if (key === 'initialized' && value && typeof value === 'object') {
    const requiredKeys = ['room', 'mainThread', 'allThreads', 'userRooms'];
    requiredKeys.forEach((k) => {
      if (typeof value[k] !== 'boolean') {
        warnings.push(`initialized.${k} should be a boolean`);
      }
    });
  }

  if (key === 'loading' && value && typeof value === 'object') {
    const requiredKeys = ['room', 'mainThread', 'allThreads', 'userRooms'];
    requiredKeys.forEach((k) => {
      if (typeof value[k] !== 'boolean') {
        warnings.push(`loading.${k} should be a boolean`);
      }
    });
  }
};

/**
 * Validate the complete room state structure
 */
export const validateRoomState = (
  state: RoomState,
): { isValid: boolean; errors: string[]; warnings: string[]; missingProperties: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingProperties: string[] = [];

  if (!state || typeof state !== 'object') {
    return {
      isValid: false,
      errors: ['Room state is not an object'],
      warnings: [],
      missingProperties: [],
    };
  }

  // Check for expected properties
  Object.keys(EXPECTED_ROOM_STATE_SHAPE).forEach((key) => {
    const expectedType = EXPECTED_ROOM_STATE_SHAPE[key];
    const value = (state as any)[key];

    if (value === undefined && !expectedType.includes('undefined')) {
      missingProperties.push(key);
    } else {
      validateProperty(key, value, expectedType, errors, warnings);
    }
  });

  // Check for unexpected properties (could indicate a bug or migration issue)
  const stateKeys = Object.keys(state);
  const expectedKeys = Object.keys(EXPECTED_ROOM_STATE_SHAPE);
  const unexpectedKeys = stateKeys.filter((key) => !expectedKeys.includes(key));

  if (unexpectedKeys.length > 0) {
    warnings.push(`Unexpected properties found: ${unexpectedKeys.join(', ')}`);
  }

  return {
    isValid: errors.length === 0 && missingProperties.length === 0,
    errors,
    warnings,
    missingProperties,
  };
};

/**
 * Validate and log room state issues (development only)
 */
export const validateAndLogRoomState = (state: RoomState): void => {
  const { isValid, errors, warnings, missingProperties } = validateRoomState(state);

  if (!isValid) {
    console.group('🔴 Room State Validation Failed');
    console.error('State structure does not match expected schema');

    if (missingProperties.length > 0) {
      console.error('Missing properties:', missingProperties);
    }

    if (errors.length > 0) {
      console.error('Errors:', errors);
    }

    if (warnings.length > 0) {
      console.warn('Warnings:', warnings);
    }

    console.groupEnd();
  } else if (warnings.length > 0) {
    console.group('⚠️ Room State Validation Warnings');
    console.warn('State structure is valid but has warnings:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
    console.groupEnd();
  }
};

/**
 * Assert that the room state is valid (throws in development)
 * Use this in critical paths where invalid state would cause bugs
 */
export const assertValidRoomState = (state: RoomState, context?: string): void => {
  const { isValid, errors, missingProperties } = validateRoomState(state);

  if (!isValid) {
    const contextMsg = context ? ` (${context})` : '';
    const errorMsg = [
      `Invalid room state${contextMsg}`,
      missingProperties.length > 0 ? `Missing: ${missingProperties.join(', ')}` : '',
      errors.length > 0 ? `Errors: ${errors.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    throw new Error(errorMsg);
  }
};

/**
 * Check if a specific property exists and has the correct type
 */
export const hasValidProperty = (state: RoomState, propertyPath: string): boolean => {
  const keys = propertyPath.split('.');
  let current: any = state;

  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return current !== undefined;
};

/**
 * Get a property safely with type checking
 */
export const getSafeProperty = <T = any>(
  state: RoomState,
  propertyPath: string,
  defaultValue?: T,
): T | undefined => {
  if (!hasValidProperty(state, propertyPath)) {
    return defaultValue;
  }

  const keys = propertyPath.split('.');
  let current: any = state;

  for (const key of keys) {
    current = current[key];
  }

  return current as T;
};

