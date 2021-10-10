package com.circ.quickchat.config.interceptors;

import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.circ.quickchat.entity.User;
import com.circ.quickchat.utils.Alerts.UserAlert;

@Component
public class NewConnInterceptor implements HandshakeInterceptor{
	
	@Autowired
	private Map<String, User> sessionKeyToUser;
	

	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Map<String, Object> attributes) throws Exception {
		Map<String, String[]> queryParams = HttpUtils.parseQueryString(request.getURI().getQuery());
		if (queryParams.containsKey("sessionId")) {
			String sessionId = queryParams.get("sessionId")[0];
			attributes.put("sessionId", sessionId);
			if (!sessionKeyToUser.containsKey(sessionId)) {
				throw new InternalError("Bad sessionId");
				//TODO handle exception
			}
		}
		return true;
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
			Exception exception) {
		int x = 1;
	}

}