package database

import (
	"go_secure/utils"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const dbName = "anonymous_quickchat.db"

var dbConn *gorm.DB

func MigrateDatabase() {
	var err error
	dbConn, err = gorm.Open(sqlite.Open(dbName))

	if err != nil {
		utils.Logg(err)
	}
	dbConn.AutoMigrate(&Message{})
	dbConn.AutoMigrate(&User{})
	dbConn.AutoMigrate(&Chat{})
	dbConn.AutoMigrate(&SecurityInfo{})
}

func GetSecurityValue(objectType string) string {
	var securityInfo SecurityInfo
	dbConn.Find(&securityInfo, "object_type = ?", objectType)
	return securityInfo.Value
}

func AddSecurityInfo(objectType string, value string) {
	securityInfo := SecurityInfo{Value: value, ObjectType: objectType}
	dbConn.Create(&securityInfo)
}

func AddUsers(users []User) {
	dbConn.Create(users)
}

func GetUsers() []User {
	var users []User
	dbConn.Find(&users)
	return users
}

func AddUser(user *User) {
	dbConn.Create(user)
}

func UpdateUser(user User) {
	dbConn.Save(&user)
}

func AddMessage(message *Message) {
	dbConn.Create(message)
}

func AddChat(chat *Chat) {
	dbConn.Create(chat)
}

func AddUserInChat(user User, chatId uint) {
	var chat Chat
	dbConn.Find(&chat, "id = ?", chatId)
	chat.Users = append(chat.Users, user)
	dbConn.Save(&chat)
}

func GetChat(chatId uint64) Chat {
	var chat Chat
	dbConn.Find(&chat, "id = ?", chatId)
	return chat
}

func GetUserById(userId uint) User {
	var user User
	dbConn.Find(&user, "id = ?", userId)
	return user
}

func GetSimpleChats() {
	var chats []Chat
	dbConn.Find(&chats)
	chatsMessage := make([]SimpleChatDTO, len(chats))
	for i, chat := range chats {
		chatsMessage[i].ChatType = chat.Type
		chatsMessage[i].Name = chat.Name
		chatsMessage[i].Id = chat.ID

		var lastMessage Message
		if len(chat.Messages) > 0 {
			lastMessage = chat.Messages[len(chat.Messages)-1]
		}
		chatsMessage[i].LastMessage = ConstructMessageDTO(lastMessage)
	}
}

func ConstructMessageDTO(message Message) MessageDTO {
	return MessageDTO{Id: message.ID, Content: message.Content, AuthorId: message.AuthorId,
		CreatedAt: message.CreatedAt, ChatId: message.ChatId, AuthorName: GetUserById(message.AuthorId).Name}
}

func ConstructChatDTO(chat Chat) ChatDTO {
	messagesDTO := make([]MessageDTO, len(chat.Messages))

	for i, message := range chat.Messages {
		messagesDTO[i] = ConstructMessageDTO(message)
	}

	usersDTO := make([]UserDTO, len(chat.Users))

	for i, user := range chat.Users {
		usersDTO[i].Name = user.Name
		usersDTO[i].Id = user.ID
	}
	return ChatDTO{id: chat.ID, name: chat.Name, chatType: chat.Type, users: usersDTO, messages: messagesDTO}
}
