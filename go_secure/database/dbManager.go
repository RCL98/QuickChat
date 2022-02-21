package database

import (
	"fmt"
	"go_secure/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const dbName = "anonymous_quickchat.db"

var AuthDbConn *gorm.DB
var UserToDB map[string]*gorm.DB = make(map[string]*gorm.DB)

func MigrateAuthTable() {
	var err error
	AuthDbConn, err = gorm.Open(sqlite.Open(dbName))

	if err != nil {
		fmt.Println(err)
	}

	AuthDbConn.AutoMigrate(&AuthTable{})
}

func SaveAuthUser(authUser AuthTable) {
	AuthDbConn.Create(&authUser)
}

func GetUserBySessionId(sessionId string) AuthTable {
	var authUser AuthTable
	AuthDbConn.Find(&authUser, "session_id = ?", sessionId)
	return authUser
}

func GetAuthUser(login string) AuthTable {
	authUser := AuthTable{}
	AuthDbConn.Find(&authUser, "username = ?", login)
	return authUser
}

func MigrateDatabase(sessionId string) {
	var err error
	UserToDB[sessionId], err = gorm.Open(sqlite.Open(sessionId + ".db"))

	if err != nil {
		utils.Logg(err)
	}
	UserToDB[sessionId].AutoMigrate(&Message{})
	UserToDB[sessionId].AutoMigrate(&User{})
	UserToDB[sessionId].AutoMigrate(&Chat{})
	UserToDB[sessionId].AutoMigrate(&SecurityInfo{})
	UserToDB[sessionId].AutoMigrate(&User{})

}

func AddUsers(sessionId string, users []User) {
	UserToDB[sessionId].Create(users)
}

func CloseConnectionDB(sessionId string) {
	sqlDB, err := UserToDB[sessionId].DB()
	if err != nil {
		utils.Logg(err)
	}
	sqlDB.Close()
}

func GetUsers(sessionId string) []User {
	var users []User
	UserToDB[sessionId].Find(&users)
	return users
}

func AddUser(sessionId string, user *User) {
	UserToDB[sessionId].Create(user)
}

func UpdateUser(sessionId string, user User) {
	UserToDB[sessionId].Save(&user)
}

func AddMessage(sessionId string, message *Message) {
	UserToDB[sessionId].Create(message)
}

func AddChat(sessionId string, chat *Chat) {
	UserToDB[sessionId].Create(chat)
}

func AddUserInChat(sessionId string, user User, chatId uint) {
	var chat Chat
	dbConn := UserToDB[sessionId]
	dbConn.Find(&chat, "id = ?", chatId)
	chat.Users = append(chat.Users, user)
	dbConn.Save(&chat)
}

func GetChat(sessionId string, chatId uint64) Chat {
	var chat Chat
	UserToDB[sessionId].Find(&chat, "id = ?", chatId)
	return chat
}

func GetUserById(sessionId string, userId uint) User {
	var user User
	UserToDB[sessionId].Find(&user, "id = ?", userId)
	return user
}

func GetSimpleChats(sessionId string) {
	var chats []Chat
	UserToDB[sessionId].Find(&chats)
	chatsMessage := make([]SimpleChatDTO, len(chats))
	for i, chat := range chats {
		chatsMessage[i].ChatType = chat.Type
		chatsMessage[i].Name = chat.Name
		chatsMessage[i].Id = chat.ID

		var lastMessage Message
		if len(chat.Messages) > 0 {
			lastMessage = chat.Messages[len(chat.Messages)-1]
		}
		chatsMessage[i].LastMessage = ConstructMessageDTO(sessionId, lastMessage)
	}
}

func ConstructMessageDTO(sessionId string, message Message) MessageDTO {
	return MessageDTO{Id: message.ID, Content: message.Content, AuthorId: message.AuthorId,
		CreatedAt: message.CreatedAt, ChatId: message.ChatId, AuthorName: GetUserById(sessionId, message.AuthorId).Name}
}

func ConstructChatDTO(sessionId string, chat Chat) ChatDTO {
	messagesDTO := make([]MessageDTO, len(chat.Messages))

	for i, message := range chat.Messages {
		messagesDTO[i] = ConstructMessageDTO(sessionId, message)
	}

	usersDTO := make([]UserDTO, len(chat.Users))

	for i, user := range chat.Users {
		usersDTO[i].Name = user.Name
		usersDTO[i].Id = user.ID
	}
	return ChatDTO{id: chat.ID, name: chat.Name, chatType: chat.Type, users: usersDTO, messages: messagesDTO}
}
