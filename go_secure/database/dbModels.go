package database

import "gorm.io/gorm"

type AuthTable struct {
	gorm.Model
	Username  string `gorm:"unique"`
	Password  string
	SessionId string `gorm:"unique"`
}

type Message struct {
	gorm.Model
	ChatId   uint
	Content  string
	AuthorId uint
}

type User struct {
	gorm.Model
	Name     string
	Messages []Message `gorm:"foreignKey:AuthorId"`
}

type Chat struct {
	gorm.Model
	Name     string
	Type     string
	Messages []Message `gorm:"foreignKey:ChatId"`
	Users    []User    `gorm:"many2many:chat_users;"`
}

type SecurityInfo struct {
	gorm.Model
	Value      string
	ObjectType string `gorm:"unique"`
}

//type SecurityChat struct {
//	UserId    uint
//	ChatId    uint
//	SenderKey string
//}

func getName() {

}
