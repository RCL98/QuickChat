package com.circ.quickchat.controller;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import DTO.RegisteredUserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.circ.quickchat.entity.User;
import com.circ.quickchat.service.UserService;
import com.circ.quickchat.utils.Alerts.UserAllert;

import DTO.UserDTO;

@RestController
public class UserController {
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private UserAllert userAlert;
	

	@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
	@PostMapping("/user/create")
	public User createTemporaryUser(@RequestBody User user) {
		user.setSessionId(UUID.randomUUID().toString());
		user.setIsTemp(true);
		return userService.save(user);
	}

	@GetMapping("/user/auth/{sessionId}")
	public RegisteredUserDTO getRegisteredUser(@PathVariable String sessionId) {
		return userService.getUserBySessionId(sessionId).toRegisteredUserDTO();
	}

	@MessageMapping("/user/register")
	public void userRegister(SimpMessageHeaderAccessor  headerAccessor) {
		String sessionId = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		user.setIsTemp(false);
		userService.save(user);
	}

	@MessageMapping("/user/change/name")
	public void processChangeUserName(String newName, SimpMessageHeaderAccessor  headerAccessor) {
		String sessionId = Objects.requireNonNull(headerAccessor.getSessionAttributes()).get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		user.setName(newName);
		User newUser = userService.save(user);
		userAlert.updateUser(newUser);
	}
	
	@GetMapping("/users/{sessionId}")
	public List<UserDTO> getUsers(@PathVariable String sessionId) {
		return userService.getUsers(sessionId);
	}
	
}
