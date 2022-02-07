package com.circ.quickchat.utils.Alerts;

import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.service.ChatService;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;
import constant.MessageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserAllert {
	
	
	
	@Autowired
	private UserUtilCommun userUtilCommun;
	
	@Autowired
	private ChatService chatService;
	
	
	
	public void updateUser(User user) {
		List<Chat> chats = chatService.getChatsThatContainUser(user);
		List<String> listUserSessionsId = chats.stream().flatMap(chat -> chat.getUsers().stream()
			.filter(userC -> userC.getCurrentChat() != null && userC.getCurrentChat().equals(chat))
			.map(User::getSessionId)).collect(Collectors.toList());
		userUtilCommun.sendToUsers(WebsocketMessage.builder()
				.messageType(MessageType.UPDATE_CHAT_USER).content(user.toUserDTO()).build(), listUserSessionsId);
	}
}
