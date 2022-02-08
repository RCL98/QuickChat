package com.circ.quickchat.config.interceptors;

import java.util.Map;

import javax.servlet.http.HttpUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.circ.quickchat.service.UserService;

@Component
public class NewConnInterceptor implements HandshakeInterceptor{
	
	
	@Autowired
	private UserService userService;

	private static final String SESSION_ID = "sessionId";
	

	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Map<String, Object> attributes) throws Exception {
		Map<String, String[]> queryParams = HttpUtils.parseQueryString(request.getURI().getQuery());
		if (queryParams.containsKey(SESSION_ID)) {
			String sessionId = queryParams.get(SESSION_ID)[0];
			attributes.put(SESSION_ID, sessionId);
			userService.getUserBySessionId(sessionId);
		}
		return true;
	}


	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Exception exception) {
		// This is an obligatory override
	}

}
