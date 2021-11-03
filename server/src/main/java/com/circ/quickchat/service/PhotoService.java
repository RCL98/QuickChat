package com.circ.quickchat.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import javax.annotation.PostConstruct;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.circ.quickchat.entity.Photo;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.PhotoRepository;

import DTO.PhotoUploadDTO;


@Service
public class PhotoService {
	
	@Value("${photo.directory}")
	private String photoDirectoryPath;
	
	@Autowired
	private PhotoRepository photoRepository;
	
	@Autowired
	private UserService userService;
	
	@PostConstruct
	public void initDirectoryPhtotos() {
		File directoryPhotosFile = new File(photoDirectoryPath);
		if (!directoryPhotosFile.exists()) {
			directoryPhotosFile.mkdir();
		}
	}
	
	
	public void uploadPhoto(PhotoUploadDTO photoUploadDTO) throws IOException {
		MultipartFile file = photoUploadDTO.getFile();
		String photoUri = photoDirectoryPath + "/" + UUID.randomUUID();
		File photoFile = new File(photoUri);
		User usr = userService.getUserBySessionId(photoUploadDTO.getUserSessionId());
		Files.copy(file.getInputStream(),photoFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
		Photo photo = Photo.builder().bigPhotoUri(photoUri).build();
		photoRepository.save(photo);
		if (usr.getPhoto() != null && usr.getPhoto().getBigPhotoUri() != null) {
			File deleteFile = new File(usr.getPhoto().getBigPhotoUri());
			deleteFile.delete();
		}
		usr.setPhoto(photo);
		userService.save(usr);
	}
	
	public byte[] getPhotoForUser(Long userId) throws IOException {
		User usr = userService.getUserForId(userId);
		Photo photo = usr.getPhoto();
		String photoUri = photo.getBigPhotoUri();
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
