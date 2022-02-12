package database

import "time"

type WebsocketMessage struct {
	Content     interface{} `json:"content"`
	MessageType string      `json:"messageType"`
}

type MessageDTO struct {
	Id         uint      `json:"id"`
	Content    string    `json:"content"`
	AuthorId   uint      `json:"authorId"`
	AuthorName string    `json:"authorName"`
	CreatedAt  time.Time `json:"createdAt"`
	ChatId     uint      `json:"chatId"`
}

type UserDTO struct {
	Id   uint   `json:"id"`
	Name string `json:"name"`
}

type ChatDTO struct {
	id       uint         `json:"id"`
	name     string       `json:"name"`
	chatType string       `json:"type"`
	users    []UserDTO    `json:"users"`
	messages []MessageDTO `json:"messages"`
}

type SimpleChatDTO struct {
	Id          uint
	Name        string
	LastMessage MessageDTO
	ChatType    string
}
