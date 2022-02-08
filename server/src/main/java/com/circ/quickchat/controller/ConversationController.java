package com.circ.quickchat.controller;

import java.util.*;

import com.circ.quickchat.entity.*;
import com.circ.quickchat.utils.Alerts.ChatAlert;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;
import constant.MessageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import com.circ.quickchat.service.ConversationService;
import com.circ.quickchat.service.UserService;

import DTO.SimpleConversationDTO;

import javax.transaction.Transactional;

@RestController
public class ConversationController {
	
	@Autowired
	private ConversationService conversationService;
	
	@Autowired 
	private UserService userService;

	@Autowired
	private UserUtilCommun userUtilCommun;

	@Autowired
	private ChatAlert chatAlert;
	
	@PostMapping("/conversations/create/{sessionId}/{partnerId}")
	public SimpleConversationDTO createConversation(@RequestBody ConversationInfo conversationInfo, 
			@PathVariable String sessionId, @PathVariable Long partnerId) {
		Set<User> userSet = new HashSet<>();
		List<ConversationInfo> info = new ArrayList<>();
		User userThatCreatedConv = userService.getUserBySessionId(sessionId);
		conversationInfo.setUserId(userThatCreatedConv.getId());
		info.add(conversationInfo);
		info.add(ConversationInfo.builder().name(userThatCreatedConv.getName()).userId(partnerId).build());
		userSet.add(userThatCreatedConv);
		User anotherUser = userService.getUserForId(partnerId);
		userSet.add(anotherUser);
		Chat newChat = Chat.builder().users(userSet).messages(new ArrayList<>()).build();
		Conversation conversation = conversationService.save(Conversation.builder().chat(newChat)
				.conversationsInfo(info).build());
		chatAlert.addUserInConversation(conversation, anotherUser);
		return conversation.toSimpleConversationDTO(userThatCreatedConv.getId());
	}
	
	@MessageMapping("/conversations/get/{convId}/user/{sessionId}")
	@Transactional
	public void getConversation(@DestinationVariable Long convId, @DestinationVariable String sessionId) {
		Conversation conversation =  conversationService.findById(convId);
		User currentUser = userService.getUserBySessionId(sessionId);
		currentUser.setCurrentChat(conversation.getChat());
		userService.save(currentUser);
		userUtilCommun.sendToUser(sessionId, WebsocketMessage.builder().messageType(MessageType.REQUESTED_CHAT)
				.content(conversation.toConversationDTO(currentUser.getId())).build());
	}
	
	@MessageMapping("/conversations/change-name")
	public void updateConversation(SimpleConversationDTO simpleConversationDTO, SimpMessageHeaderAccessor headerAccessor) {
		String sessionId = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("sessionId").toString();
		conversationService.updateConversationForUser(sessionId, simpleConversationDTO);
	}

	@MessageMapping("/conversations/get-out/{convId}")
	public void getMeOutOfConversation(@DestinationVariable Long convId, SimpMessageHeaderAccessor headerAccessor) {
		String sessionId = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		Conversation conversation = conversationService.findById(convId);
		conversationService.deleteUserInConversation(conversation, user);
	}
	
}
