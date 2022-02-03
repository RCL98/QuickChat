package com.circ.quickchat.controller;

import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.circ.quickchat.entity.Group;
import com.circ.quickchat.entity.Message;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.service.GroupService;
import com.circ.quickchat.service.UserService;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;

import DTO.SimpleGroupDTO;
import constant.MessageType;

@RestController
public class GroupController {
	
	@Autowired
	private GroupService groupService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private UserUtilCommun userUtilCommun;
	

	//endpoint for websocket client
	@MessageMapping("/chat")
	public void processMessage(Message message,  SimpMessageHeaderAccessor  headerAccessor) {
		String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		message = message.toBuilder().authorId(user.getId()).authorName(user.getName()).build();
		groupService.sendMessage(message, sessionId);
	}
	
	@PostMapping("/groups/create/{sessionId}")
	public SimpleGroupDTO createNewGroup(@RequestBody  Group group, @PathVariable String sessionId) {
		User userThatCreatedChat = userService.getUserBySessionId(sessionId);
		List<Long> usersThatWillBeAddedInChat = group.getChat().getUsers().stream().map(usr -> usr.getId())
				.collect(Collectors.toList());
		Group groupFromDb = userService.addUsersInNewChat(group, usersThatWillBeAddedInChat);
		groupFromDb.getChat().getUsers().add(userThatCreatedChat);
		return groupService.save(groupFromDb).toSimpleGroupDTO();
	}
	
	@MessageMapping("/groups/addUsers/{groupId}")
	public void addUserInChat(@DestinationVariable Long groupId, @Payload List<Long> users,
			SimpMessageHeaderAccessor  headerAccessor) {
		Group group = groupService.getGroupById(groupId);
		String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
		User user = userService.getUserBySessionId(sessionId);
		if (!group.getChat().getUsers().stream().anyMatch(usr -> usr.getId().equals(user.getId()))) {
			throw new InternalError("User " + user.getId() + " that try to add another user isn't into chat!");
		}
		userService.addUsersInChat(group, users);
	}
	
	@MessageMapping("/groups/get/{groupId}/user/{sessionId}")
	@Transactional
	public void getGroup(@DestinationVariable String sessionId, @DestinationVariable Long groupId) {
		Group group = groupService.getGroupById(groupId);
		User user = userService.getUserBySessionId(sessionId);
		user.setCurrentChat(group.getChat());
		userService.save(user);
		userUtilCommun.sendToUser(sessionId, WebsocketMessage.builder().messageType(MessageType.REQUESTED_CHAT)
				.content(group.toGroupDTO()).build());
	}
	
	@MessageMapping("/groups/change-name")
	public void updateGroup(SimpleGroupDTO simpleGroupDTO, SimpMessageHeaderAccessor  headerAccessor) {
		String sessionId = headerAccessor.getSessionAttributes().get("sessionId").toString();
		Group group = groupService.getGroupById(simpleGroupDTO.getId());
		User userThatUpdateGroup = userService.getUserBySessionId(sessionId);
		if (!group.getChat().getUsers().stream()
				.anyMatch(usr -> usr.getId().equals(userThatUpdateGroup.getId()))) {
			throw new InternalError("User that try to change name for group isn't into group!");
		}
		group.setName(simpleGroupDTO.getName());
		groupService.save(group);
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.messageType(MessageType.UPDATE_GROUP_NAME).content(group.toSimpleGroupDTO()).build();
		userUtilCommun.sendToUsers(websocketMessage, group.getChat().getUsers().stream()
				.filter(usr -> !usr.getSessionId().equals(sessionId)).map(usr -> usr.getSessionId())
				.collect(Collectors.toList()));
	}
	
}
