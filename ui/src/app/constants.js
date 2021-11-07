// SERVER MESSAGE TYPES CONSTANTS
export const MESSAGE = "MESSAGE";
export const UPDATE_CHAT_USER = "UPDATE_CHAT_USER";
export const ADD_USER_CHAT = "ADD_USER_CHAT";
export const DELETE_USER_CHAT = "DELETE_USER_CHAT";
export const UPDATE_GROUP_NAME = "UPDATE_GROUP_NAME";
export const NEW_CHAT = "NEW_CHAT";
export const REQUESTED_CHAT = "REQUESTED_CHAT";
export const UPDATE_WHO_IS_WRITING = "UPDATE_WHO_IS_WRITING";
export const UPDATE_GROUP_PHOTO = "UPDATE_GROUP_PHOTO";
export const UPDATE_USER_PHOTO = "UPDATE_USER_PHOTO";

// CHAT TYPES CONSTANTS
export const GROUP = "GROUP";
export const CONVERSATION = "CONVERSATION";

// APP CONSTANTS
export const principalChatId = "2021";
export const serverHost = process.env.NODE_ENV !== "development" ? "" : "http://localhost:8080";
