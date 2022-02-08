package com.circ.quickchat.service;

import DTO.SimpleConversationDTO;
import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.Conversation;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.ChatRepository;
import com.circ.quickchat.repositories.ConversationRepository;
import com.circ.quickchat.utils.Alerts.ChatAlert;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ConversationService {

	private final ConversationRepository conversationRepository;

	private final ChatRepository chatRepository;

	private final UserService userService;

	private final ChatAlert chatAlert;

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

	public List<Conversation> getConversationThatContainsUser(User user) {
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

	public void  deleteUserInConversation(Conversation conversation, User user) {
		if (conversation.getChat().getUsers().size() == 1) {
			delete(conversation);
		} else {
			conversation.getChat().setUsers(conversation.getChat().getUsers().stream().filter(usr -> !usr.getId().equals(user.getId()))
					.collect(Collectors.toSet()));
			chatAlert.deleteUserInChat(conversation.getId(), conversation.getChat(), user);
			save(conversation);
		}
	}
	
	public List<Conversation> findAll() {
		return conversationRepository.findAll();
	}
	
}
