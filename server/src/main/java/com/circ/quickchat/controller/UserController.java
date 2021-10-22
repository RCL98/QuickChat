package com.circ.quickchat.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import com.circ.quickchat.entity.Chat;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.utils.Alerts.UserAlert;

import DTO.UserDTO;

@RestController
public class UserController {
	
	@Autowired
	Map<String, User> sessionKeyToUser;
	
	@Autowired
	UserAlert userAlert;
	
	@Autowired
	Map<String, Chat> chats;

	@CrossOrigin(origins = "http://localhost:3000")
	@PostMapping("/user/create")
	public UserDTO createTemporaryUser(@RequestBody User user) {
		user.setId(UUID.randomUUID().toString());
		user.setSessionId(UUID.randomUUID().toString());
		sessionKeyToUser.put(user.getSessionId(), user);
		return user.toUserDTO();
	}
	
	@MessageMapping("/user/change/name")
	public void processChageUserName(String newName,  SimpMessageHeaderAccessor  headerAccessor) {
		String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
		User user = sessionKeyToUser.get(sessionId);
		chats.values().forEach(chat -> {
			if (chat.getUsers().contains(user)) {
				User newUser = user;
				newUser.setName(newName);
				chat.getUsers().remove(user);
				chat.getUsers().add(newUser);
			}
		});
		sessionKeyToUser.get(sessionId).setName(newName);
		userAlert.updateUser(user);
	}

	@GetMapping("users/{sessionId}")
	public List<User> getUsers(@PathVariable String sessionId) {
		return sessionKeyToUser.entrySet().stream().filter(entry -> !entry.getKey().equals(sessionId)).map(entry ->
				entry.getValue()).collect(Collectors.toList());
	}
}
