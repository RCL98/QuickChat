package com.circ.quickchat.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
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
	
	@Autowired GroupService groupService;
	
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
	}
	
	public void uploadPhotoForGroup(Long groupId, MultipartFile file) throws IOException {
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
				.stream().map(usr -> usr.getSessionId()).collect(Collectors.toList()));
		
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
		String photoUri = photo.getBigPhotoUri();
		return getPhotoBytes(photoUri);
	}
	
	private Photo savePhoto(MultipartFile file) throws IOException {
		String photoUri = photoDirectoryPath + "/" + UUID.randomUUID();
		File photoFile = new File(photoUri);
		Files.copy(file.getInputStream(),photoFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
		Photo photo = Photo.builder().bigPhotoUri(photoUri).build();
		return photoRepository.save(photo);
	}
	
	private byte[] getPhotoBytes(String photoUri) throws IOException {
		File photoFile = new File(photoUri);
		InputStream in = new FileInputStream(photoFile);
		byte[] imagesBytes = new byte[in.available()];
		in.read(imagesBytes);
		return imagesBytes;
	}
	
	
	public void deletePhoto(Photo photo) {
		File file = new File(photo.getBigPhotoUri());
		if (file.exists()) {
			file.delete();
		}
		photoRepository.delete(photo);
	}
}
