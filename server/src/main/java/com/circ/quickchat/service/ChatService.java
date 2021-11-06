package com.circ.quickchat.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.ChatRepository;

@Service
public class ChatService {
	
	@Autowired
	private ChatRepository chatRepository;
	
	public List<Chat> getChatsThatContainUser(User user) {
		return chatRepository.findAll()
				.stream().filter(chat -> chat.getUsers().stream()
						.anyMatch(usr -> usr.getId().equals(user.getId())))
				.collect(Collectors.toList());
	}
	
	public Chat findChatById(Long chatId) {
		return chatRepository.findById(chatId)
				.orElseThrow(() -> new InternalError("Chat with this id doesn't exist"));
	}
}
