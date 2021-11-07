package com.circ.quickchat.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.circ.quickchat.entity.Group;
import com.circ.quickchat.entity.Photo;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.PhotoRepository;
import com.circ.quickchat.utils.communcation.UserUtilCommun;
import com.circ.quickchat.websocket.WebsocketMessage;

import DTO.PhotoUploadDTO;
import constant.MessageType;


@Service
public class PhotoService {
	
	@Value("${photo.directory}")
	private String photoDirectoryPath;
	
	@Autowired
	private PhotoRepository photoRepository;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private UserUtilCommun userUtilCommun;
	
	@Autowired 
	private GroupService groupService;
	
	@Autowired
	private ConversationService conversationService;
	
	@PostConstruct
	public void initDirectoryPhotos() {
		File directoryPhotosFile = new File(photoDirectoryPath);
		if (!directoryPhotosFile.exists()) {
			directoryPhotosFile.mkdir();
		}
	}
	
	
	public void uploadPhoto(PhotoUploadDTO photoUploadDTO) throws IOException {
		MultipartFile file = photoUploadDTO.getFile();
		User usr = userService.getUserBySessionId(photoUploadDTO.getUserSessionId());
		Photo prevPhoto = usr.getPhoto();
		Photo photo = savePhoto(file);
		usr.setPhoto(photo);
		userService.save(usr);
		deletePhoto(prevPhoto);
		List<Map<String, Object>> convsInfo = conversationService.findAll()
				.stream().filter(conv -> {
					List<Long> users = conv.getConversationsInfo().stream().map(cInfo -> cInfo.getUserId())
							.collect(Collectors.toList());
					Boolean isGoodConv = users.stream().anyMatch(userId -> userId.equals(usr.getId()));
					return isGoodConv;
				}).map(conv -> {
					Map<String, Object> infoConvMap = new HashMap<String, Object>();
					List<Long> users = conv.getConversationsInfo().stream().map(cInfo -> cInfo.getUserId())
							.collect(Collectors.toList());
					Long userId  = users.stream().filter(usrId -> !usrId.equals(usr.getId())).findAny().get();
					infoConvMap.put("userId", userId);
					infoConvMap.put("convId", conv.getId());
					return infoConvMap;
				}).collect(Collectors.toList());
		
		convsInfo.forEach(infoConvMap -> {
			String sessionId = userService.getUserForId((Long)infoConvMap.get("userId")).getSessionId();
			Map<String, Long> messageMap = new HashMap<String, Long>();
			messageMap.put("userId", usr.getId());
			messageMap.put("convId", (Long)infoConvMap.get("convId"));
			WebsocketMessage websocketMessage = WebsocketMessage.builder().messageType(MessageType.UPDATE_USER_PHOTO)
					.content(messageMap).build();
			userUtilCommun.sendToUser(sessionId, websocketMessage);

		});
 	}
	
	public void uploadPhotoForGroup(Long groupId, MultipartFile file, String sessionId) throws IOException {
		Group group =groupService.getGroupById(groupId);
		Photo prevPhoto= group.getPhoto();
		Photo photo = savePhoto(file);
		group.setPhoto(photo);
		groupService.save(group);
		deletePhoto(prevPhoto);
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.content(groupId).messageType(MessageType.UPDATE_GROUP_PHOTO)
				.build();
		userUtilCommun.sendToUsers(websocketMessage, group.getChat().getUsers()
				.stream().map(usr -> usr.getSessionId())
				.filter(filSessionId -> !filSessionId.equals(sessionId))
				.collect(Collectors.toList()));
		
	}
	
	public void deletePhotoForGroup(Long groupId, String sessionId) {
		Group group = groupService.getGroupById(groupId);
		Photo photo = group.getPhoto();
		group.setPhoto(photo);
		groupService.save(group);
		deletePhoto(photo);
		WebsocketMessage websocketMessage = WebsocketMessage.builder()
				.content(groupId).messageType(MessageType.UPDATE_GROUP_PHOTO)
				.build();
		userUtilCommun.sendToUsers(websocketMessage, group.getChat().getUsers()
				.stream().map(usr -> usr.getSessionId())
				.filter(filSessionId -> !filSessionId.equals(sessionId))
				.collect(Collectors.toList()));
	}
	
	public void deletePhototForUser(String sessionId) {
		User usr = userService.getUserBySessionId(sessionId);
		Photo photo = usr.getPhoto();
		usr.setPhoto(null);
		userService.save(usr);
		deletePhoto(photo);
		List<Map<String, Object>> convsInfo = conversationService.findAll()
				.stream().filter(conv -> {
					List<Long> users = conv.getConversationsInfo().stream().map(cInfo -> cInfo.getUserId())
							.collect(Collectors.toList());
					Boolean isGoodConv = users.stream().anyMatch(userId -> userId.equals(usr.getId()));
					return isGoodConv;
				}).map(conv -> {
					Map<String, Object> infoConvMap = new HashMap<String, Object>();
					List<Long> users = conv.getConversationsInfo().stream().map(cInfo -> cInfo.getUserId())
							.collect(Collectors.toList());
					Long userId  = users.stream().filter(usrId -> !usrId.equals(usr.getId())).findAny().get();
					infoConvMap.put("userId", userId);
					infoConvMap.put("convId", conv.getId());
					return infoConvMap;
				}).collect(Collectors.toList());
		
		convsInfo.forEach(infoConvMap -> {
			String sessionId2 = userService.getUserForId((Long)infoConvMap.get("userId")).getSessionId();
			Map<String, Long> messageMap = new HashMap<String, Long>();
			messageMap.put("userId", usr.getId());
			messageMap.put("convId", (Long)infoConvMap.get("convId"));
			WebsocketMessage websocketMessage = WebsocketMessage.builder().messageType(MessageType.UPDATE_USER_PHOTO)
					.content(messageMap).build();
			userUtilCommun.sendToUser(sessionId2, websocketMessage);

		});
		
	}
	
	
	public byte[] getPhotoForGroup(Long groupId) throws IOException {
		Group group = groupService.getGroupById(groupId);
		Photo photo = group.getPhoto();
		String photoUri = photo.getBigPhotoUri();
		return getPhotoBytes(photoUri);
	}
	
	public byte[] getPhotoForUser(Long userId) throws IOException {
		User usr = userService.getUserForId(userId);
		Photo photo = usr.getPhoto();
		if (photo != null) {
			String photoUri = photo.getBigPhotoUri();
			return getPhotoBytes(photoUri);
		}
		return null;
	}
	
	private Photo savePhoto(MultipartFile file) throws IOException {
		String photoUri = photoDirectoryPath + "/" + UUID.randomUUID();
		File photoFile = new File(photoUri);
		InputStream inFile = file.getInputStream();
		Files.copy(inFile,photoFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
		Photo photo = Photo.builder().bigPhotoUri(photoUri).build();
		inFile.close();
		return photoRepository.save(photo);
	}
	
	private byte[] getPhotoBytes(String photoUri) throws IOException {
		File photoFile = new File(photoUri);
		InputStream in = new FileInputStream(photoFile);
		byte[] imagesBytes = new byte[in.available()];
		in.read(imagesBytes);
		in.close();
		return imagesBytes;
	}
	
	
	public void deletePhoto(Photo photo) {
		if (photo != null) {
			File file = new File(photo.getBigPhotoUri());
			if (file.exists()) {
				file.delete();
			}
			photoRepository.delete(photo);
		}
	}
}
