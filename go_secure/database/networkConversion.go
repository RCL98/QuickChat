package database

import (
	"github.com/mitchellh/mapstructure"
	"go_secure/http_server"
	"gorm.io/gorm"
)

func MessageDTOToMessage(messageDTO MessageDTO) Message {
	model := gorm.Model{ID: messageDTO.Id, CreatedAt: messageDTO.CreatedAt}
	return Message{Model: model, AuthorId: messageDTO.AuthorId, Content: messageDTO.Content, ChatId: messageDTO.ChatId}
}

func ChatDTOToChat(chatDTO ChatDTO) Chat {
	model := gorm.Model{ID: chatDTO.id}
	users := make([]User, len(chatDTO.users))
	messages := make([]Message, len(chatDTO.messages))

	for i, user := range chatDTO.users {
		userRes := GetUserById(user.Id)
		if userRes.ID == 0 {
			users[i].Name = user.Name
			AddUser(&users[i])
		} else {
			users[i] = GetUserById(user.Id)
		}
	}

	for i, message := range chatDTO.messages {
		messages[i] = MessageDTOToMessage(message)
		AddMessage(&messages[i])
	}

	return Chat{Model: model, Name: chatDTO.name, Type: chatDTO.chatType, Users: users, Messages: messages}
}

func Synchronize(dto SynchronizationDTO) {
	all := dto.alerts

	for i := range all {
		wsMessage := WsMessageDTO{}
		mapstructure.Decode(all[i], &wsMessage)
		if wsMessage.messageType == http_server.CLEAR_MESSAGE {
			messageDTO := MessageDTO{}
			mapstructure.Decode(wsMessage.content, &messageDTO)
			message := MessageDTOToMessage(messageDTO)
			AddMessage(&message)
		}
	}
}
