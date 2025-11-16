// Main entry point for new-room components
export { default as RoomContainer } from './RoomContainer';
export { RoomConfigProvider, useRoomConfig } from './contexts/RoomConfigContext';
export type { RoomConfig, RoomMode, Thread, Message, Tab } from './types/room.types';

