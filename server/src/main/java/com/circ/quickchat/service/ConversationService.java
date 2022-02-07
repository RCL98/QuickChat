package com.circ.quickchat.service;

import DTO.SimpleConversationDTO;
import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.Conversation;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.ChatRepository;
import com.circ.quickchat.repositories.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConversationService {
	
	@Autowired
	private ConversationRepository conversationRepository;

	@Autowired
	private ChatRepository chatRepository;

	@Autowired
	private UserService userService;

	public Conversation save(Conversation conversation) {
		Chat chatDb = chatRepository.save(conversation.getChat());
		conversation.setId(chatDb.getId());
		conversation.setChat(chatDb);
		return conversationRepository.save(conversation);
	}

	public void delete(Conversation conversation) {
		userService.saveAll(
				conversation.getChat().getUsers().stream()
				.filter(usr -> usr.getCurrentChat() != null && usr.getCurrentChat().equals(conversation.getChat())).peek(usr -> usr.setCurrentChat(null)).collect(Collectors.toList()));
		conversationRepository.delete(conversation);
	}
	
	public Conversation findById(Long id) {
		return conversationRepository.findById(id).orElseThrow(() -> new InternalError("it doesn't exist a conversation with this id!"));
	}

	public List<Conversation> getChatThatContainsUser(User user) {
		return conversationRepository.findAll()
				.stream().filter(conv -> conv.getChat().getUsers().stream()
						.anyMatch(usr -> usr.getId().equals(user.getId())))
				.collect(Collectors.toList());
	}
	
	public void updateConversationForUser(String userSessionId, SimpleConversationDTO simpleConversationDTO) {
		User user = userService.getUserBySessionId(userSessionId);
		Conversation conversation = conversationRepository.findById(simpleConversationDTO.getId())
				.orElseThrow(() -> new InternalError("In db doesn't exist a conversation with id: "
		+ simpleConversationDTO.getId()));
		conversation.getConversationsInfo().stream().filter(convInfo -> convInfo.getUserId().equals(user.getId()))
		.findAny().orElseThrow(() -> new InternalError("User that want to change name isn't into conversation"))
		.setName(simpleConversationDTO.getName());
		conversationRepository.save(conversation);
	}
	
	public List<Conversation> findAll() {
		return conversationRepository.findAll();
	}
	
}
