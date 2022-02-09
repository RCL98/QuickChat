package com.circ.quickchat.service;

import DTO.MessageDTO;
import DTO.NotificationDTO;
import com.circ.quickchat.entity.*;
import com.circ.quickchat.repositories.ChatRepository;
import com.circ.quickchat.repositories.GroupRepository;
import com.circ.quickchat.utils.Alerts.ChatAlert;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;
import constant.MessageType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GroupService {

    private final UserUtilCommun userUtilCommun;

    private final GroupRepository groupRepository;

    private final ChatRepository chatRepository;
    
    private final ChatAlert chatAlert;

    private final UserService userService;

    @Transactional
    public void sendMessage(Message message, String sessionIdAuthor) {
        Chat chat = chatRepository.findById(message.getChat().getId()).orElseThrow(() -> new InternalError(
                String.format("A chat with id: %d doesn't exist!", message.getId())));
        chat.getMessages().add(message);
        chatRepository.save(chat);
        List<String> usersFromChatWithoutAuthor = new ArrayList<>();
        List<String> usersFromChatNotOn = new ArrayList<>();
        chat.getUsers().forEach(user -> {
            if (!user.getSessionId().equals(sessionIdAuthor)) {
                if (user.getCurrentChat() != null && user.getCurrentChat().getId().equals(chat.getId())) {
                    usersFromChatWithoutAuthor.add(user.getSessionId());
                } else {
                    usersFromChatNotOn.add(user.getSessionId());
                }
            }
        });
        MessageDTO messageDTO = message.toMessageDTO();
        WebsocketMessage websocketMessage = WebsocketMessage.builder().messageType(MessageType.MESSAGE)
                .content(messageDTO).build();
        WebsocketMessage websocketNotification = WebsocketMessage.builder().messageType(MessageType.NOTIFICATION)
                .content(NotificationDTO.builder().chatId(chat.getId())
                        .message(messageDTO).build()).build();
        userUtilCommun.sendToUsers(websocketMessage, usersFromChatWithoutAuthor);
        userUtilCommun.sendToUsers(websocketNotification, usersFromChatNotOn);
    }

    public Group save(Group group) {
        Chat chat = group.getChat();
        Chat chatDB = chatRepository.save(chat);
        group.setChat(chatDB);
        group.setId(chatDB.getId());
        return groupRepository.save(group);
    }

    public List<Group> getChatThatContainsUser(User user) {
        return groupRepository.findAll()
                .stream().filter(group -> group.getChat().getUsers().stream()
                        .anyMatch(usr -> usr.getId().equals(user.getId())))
                .collect(Collectors.toList());
    }

    public Group getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() ->
                new InternalError("Group with id: " + groupId + " doesn't exist"));
        group.getChat().getMessages();
        return group;
    }

    public void deleteGroup(Group group) {
        userService.saveAll(
                group.getChat().getUsers().stream()
                        .filter(usr -> usr.getCurrentChat() != null && usr.getCurrentChat().equals(group.getChat()))
                        .map(usr -> { usr.setCurrentChat(null); return usr; }).collect(Collectors.toList()));
        Photo photo = group.getPhoto();
        if (photo != null) {
            try {
                Files.delete(Paths.get(photo.getBigPhotoUri()));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        groupRepository.delete(group);
    }
    
    public void deleteUserInGroup(Group group, User user) {
        if (group.getChat().getUsers().size() == 1) {
            deleteGroup(group);
        } else {
            group.getChat().setUsers(group.getChat().getUsers().stream().filter(usr -> !usr.getId().equals(user.getId()))
                    .collect(Collectors.toSet()));
            chatAlert.deleteUserInChat(group.getId(), group.getChat(), user);
            save(group);
        }
    }
    public void removeUserFromGroup(Group group, User user) {
        group.getChat().setUsers(group.getChat().getUsers().stream().filter(usr -> !usr.getId().equals(user.getId()))
                .collect(Collectors.toSet()));
        chatAlert.removeUserInGroup(group, user);
        save(group);
    }
}
