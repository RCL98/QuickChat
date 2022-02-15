package main

import (
	"fmt"
	"go_secure/database"
	"go_secure/http_server"

	"gorm.io/gorm"
)

// User has one CreditCard, CreditCardID is the foreign key
type Author struct {
	gorm.Model
	Name     string
	Messages []Message `gorm:"foreignKey:AuthorId"`
}

type Message struct {
	gorm.Model
	Content  string
	AuthorId uint
}

func main() {
	fmt.Println("Go server started")
	database.MigrateDatabase()
	sv := http_server.Secure_Server{Port: "8090"}
	sv.Run()
}
