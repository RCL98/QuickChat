package com.circ.quickchat.controller;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.ChatRepository;
import com.circ.quickchat.service.UserService;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;

import DTO.WritingDTO;
import constant.MessageType;

@RestController
@RequestMapping("/writer")
public class WriterController {
	
	@Autowired
	private UserUtilCommun userUtilCommun;
	
	@Autowired
	private ChatRepository chatRepository;
	
	@Autowired
	private UserService userService;
	
	@MessageMapping("/writing")
	public void currentlyWriting(SimpMessageHeaderAccessor  headerAccessor) {
		alertUserWriteAction(headerAccessor, true);
	}
	
	
	@MessageMapping("/stopped-writing")
	public void stoppedWriting(SimpMessageHeaderAccessor  headerAccessor) {
		alertUserWriteAction(headerAccessor, false);
	}
	
	private void alertUserWriteAction(SimpMessageHeaderAccessor headerAccessor, Boolean isWriting) {
		String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
		User userThatWrite = userService.getUserBySessionId(sessionId);
		Long chatId = userThatWrite.getCurrentChat().getId();
		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new InternalError("Chat with id: " + chatId +
						" doesn't exist"));
		WebsocketMessage messageWebsocketsMessage = WebsocketMessage.builder().messageType( MessageType.UPDATE_WHO_IS_WRITING)
				.content(WritingDTO.builder().id(userThatWrite.getId()).isWriting(isWriting).build()).build();
		userUtilCommun.sendToUsers(messageWebsocketsMessage, chat.getUsers()
				.stream().filter(usr -> !usr.getSessionId().equals(sessionId) && usr.getCurrentChat() != null
						&& usr.getCurrentChat().equals(chat)).map(User::getSessionId).collect(Collectors.toList()));
	}

}
