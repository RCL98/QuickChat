package com.circ.quickchat.config.interceptors;

import java.util.Map;

import javax.servlet.http.HttpUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.circ.quickchat.entity.User;
import com.circ.quickchat.service.UserService;

@Component
public class NewConnInterceptor implements HandshakeInterceptor{
	
	
	@Autowired
	private UserService userService;
	

	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Map<String, Object> attributes) throws Exception {
		Map<String, String[]> queryParams = HttpUtils.parseQueryString(request.getURI().getQuery());
		if (queryParams.containsKey("sessionId")) {
			String sessionId = queryParams.get("sessionId")[0];
			attributes.put("sessionId", sessionId);
			User user = userService.getUserBySessionId(sessionId);
			user.setAvailable(true);
			userService.save(user);
		}
		return true;
	}


	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Exception exception) {
		
	}

//	@Override
//	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
//			Exception exception) {
//		Map<String, String[]> queryParams = HttpUtils.parseQueryString(request.getURI().getQuery());
//		String sessionId = queryParams.get("sessionId")[0];
//		sessionKeyToUser.get(sessionId).setId(UUID.randomUUID().toString());
//		User newUser = sessionKeyToUser.get(sessionId);
//		userAlert.connectNewUser(newUser);
//		userService.addUserInChat(chats.get(ChatTypes.principalChatId), newUser.getId());
//	}

}
