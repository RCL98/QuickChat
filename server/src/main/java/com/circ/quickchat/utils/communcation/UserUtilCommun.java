package com.circ.quickchat.utils.communcation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserUtilCommun {

	@Autowired
	public SimpMessageSendingOperations send;
	
	public void sendToUser(String sessionId, Object message) {
			send.convertAndSendToUser(sessionId, "/usertell", message);
	}
	
	public void sendToUsers(Object message, List<String> sessionsIds) {
		if (sessionsIds != null) {
			sessionsIds.forEach(id -> send.convertAndSendToUser(id, "/usertell", message));
		}
	}

}
