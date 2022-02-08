package com.circ.quickchat.service;

import java.io.File;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.circ.quickchat.entity.Group;
import com.circ.quickchat.entity.Photo;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.UserRepository;
import com.circ.quickchat.utils.Alerts.ChatAlert;

import DTO.UserDTO;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private ChatAlert chatAlert;

    @Autowired
    private ConversationInfoService chaConversationInfoService;

    public void addUsersInChat(Group chat, List<Long> usersIds) {
        for (Long userId :
                usersIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new InternalError(String.format("A user with the id: %d doesn't exist.", userId)));

            chatAlert.addUserInChat(chat, user);
            chat.getChat().getUsers().add(user);
        }
        groupService.save(chat);
    }

    public Group addUsersInNewChat(Group group, List<Long> usersId) {
        group.getChat().setUsers(new HashSet<>());
        Group temporaryGroupDb = groupService.save(group);
        Set<User> users = getAllForIds(usersId);

        temporaryGroupDb.getChat().setUsers(users);

        users.forEach(usr -> chatAlert.addUserInChat(group, usr));
        return groupService.save(group);
    }

    public User getUserBySessionId(String sessionId) {
        return userRepository.findOneBySessionId(sessionId)
                .orElseThrow(() -> new InternalError("User with sessionId: " +
                        sessionId + " doesn't exist into db"));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(User user) {
        chaConversationInfoService.deleteAll(chaConversationInfoService.findAllByUserId(user.getId()));
        Photo photo = user.getPhoto();
        if (photo != null) {
            File deleteFile = new File(photo.getBigPhotoUri());
            deleteFile.delete();
        }
        userRepository.deleteById(user.getId());

    }

    public List<UserDTO> getUsers(String sessionId) {
        return userRepository.findAll().stream().filter(user -> !user.getSessionId().equals(sessionId))
                .map(User::toUserDTO).collect(Collectors.toList());
    }

    public void saveAll(Collection<User> users) {
        userRepository.saveAll(users);
    }

    public Set<User> getAllForIds(List<Long> ids) {
        return new HashSet<>(userRepository.findAllById(ids));
    }

    public User getUserForId(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new InternalError("Doesn exist an user with thid id!"));
    }

}
