package com.circ.quickchat.config.interceptors;

import com.circ.quickchat.entity.Conversation;
import com.circ.quickchat.entity.Group;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.service.ConversationService;
import com.circ.quickchat.service.GroupService;
import com.circ.quickchat.service.UserService;
import com.circ.quickchat.utils.Alerts.UserAllert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

import java.util.List;


public class ConnHandler extends WebSocketHandlerDecorator {

	public ConnHandler(WebSocketHandler delegate) {
		super(delegate);
	}

	@Autowired
	private UserAllert userAlert;

	@Autowired
	private UserService userService;

	@Autowired
	private GroupService groupService;

	@Autowired
	private ConversationService conversationService;

	@Override
	public synchronized void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {

		String sessionId = session.getAttributes().get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		List<Group> groups = groupService.getChatThatContainsUser(user);
		List<Conversation> conversations = conversationService.getConversationThatContainsUser(user);
		if (groups != null) {
			groups.forEach(group -> groupService.deleteUserInGroup(group, user));
		}
		if (conversations != null) {
			conversations.forEach(conversation -> conversationService.deleteUserInConversation(conversation, user));
		}
		userService.deleteUser(user);
	}

}
