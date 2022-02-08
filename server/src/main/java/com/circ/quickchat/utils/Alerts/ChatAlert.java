package com.circ.quickchat.utils.Alerts;


import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.Conversation;
import com.circ.quickchat.entity.Group;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.UserAndChat;
import com.circ.quickchat.websocket.WebsocketMessage;
import constant.MessageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ChatAlert {
	
	@Autowired
	private UserUtilCommun userUtilCommun;
	
//	public void addUserInChat(Group group, User user) {
//		WebsocketMessage websocketMessage = WebsocketMessage.builder().content(UserAndChat.builder()
//				.user(user.toUserDTO()).chatId(group.getId()).build()).messageType(MessageType.ADD_USER_CHAT).build();
//
//		userUtilCommun.sendToUsers(websocketMessage, group.getChat().getUsers().stream()
//				.filter(usr -> usr.getCurrentChat() != null && usr.getCurrentChat().equals(group.getChat()))
//				.map(User::getSessionId).collect(Collectors.toList()));
//
//		group.getChat().getUsers().add(user);
//		sendChatToUser(group.toSimpleGroupDTO(), user.getSessionId());
//	}
	
	public void addUserInChat(Group group, User user) {
		WebsocketMessage websocketMessage = WebsocketMessage.builder().content(UserAndChat.builder()
				.user(user.toUserDTO()).chatId(group.getId()).build()).messageType(MessageType.ADD_USER_CHAT).build();
		
		userUtilCommun.sendToUsers(websocketMessage, group.getChat().getUsers().stream()
				.filter(usr -> usr.getCurrentChat() != null && usr.getCurrentChat().equals(group.getChat()))
				.map(User::getSessionId).collect(Collectors.toList()));
		sendChatToUser(group.toSimpleGroupDTO(), user.getSessionId());
	}

	public void addUserInConversation(Conversation conversation, User user) {
		sendChatToUser(conversation.toSimpleConversationDTO(user.getId()), user.getSessionId());
	}

	public void deleteUserInChat(Long id, Chat chat, User user) {
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.content(UserAndChat.builder().chatId(id).user(user.toUserDTO()).build())
				.messageType(MessageType.DELETE_USER_CHAT).build();
		userUtilCommun.sendToUsers(websocketMessage, chat.getUsers().stream()
				.filter(usr -> usr.getCurrentChat() != null && usr.getCurrentChat().equals(chat))
				.map(User::getSessionId).collect(Collectors.toList()));
	}

	public void removeUserInGroup(Group group, User user) {
		deleteUserInChat(group.getId(), group.getChat(), user);
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.content(group.toPushedOutOfGroupDTO()).messageType(MessageType.PUSHED_USER_OUT).build();
		userUtilCommun.sendToUser(user.getSessionId(), websocketMessage);
	}

	public void sendChatToUser(Object chat, String sessionId) {
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.content(chat).messageType(MessageType.NEW_CHAT).build();
		userUtilCommun.sendToUser(sessionId, websocketMessage);
	}
}
