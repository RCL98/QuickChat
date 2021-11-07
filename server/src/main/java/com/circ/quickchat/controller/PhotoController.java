package com.circ.quickchat.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.circ.quickchat.service.PhotoService;

import DTO.PhotoUploadDTO;

@RestController
@RequestMapping("/photos")
public class PhotoController {
	
	@Autowired
	private PhotoService photoService;
	
	@PostMapping("/upload")
	public void uploadPhoto(@RequestParam("file") MultipartFile file,
			@RequestParam("userSessionId") String sessionId) throws IOException {
		photoService.uploadPhoto(PhotoUploadDTO.builder().file(file)
				.userSessionId(sessionId).build());
	}
	
	@GetMapping("/get/{userId}")
	public  ResponseEntity<byte[]> getUserPhotoProfile(@PathVariable Long userId) throws IOException{
		byte[] resource = photoService.getPhotoForUser(userId);
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(resource);
	}
	
	@PostMapping("/group/upload")
	public void uploadPhotoGroup(@RequestParam("file") MultipartFile file,
			@RequestParam("groupId") Long groupId, @RequestParam("sessionId") String sessionId) throws IOException {
		photoService.uploadPhotoForGroup(groupId, file, sessionId);
	}
	
	@DeleteMapping("/group/{groupId}/{sessionId}")
	public void deletePhotoGroup(@PathVariable Long groupId, @PathVariable String sessionId) {
		photoService.deletePhotoForGroup(groupId, sessionId);
	}
	
	@DeleteMapping("/user/{sessionId}")
	public void deletePhototForUser(@PathVariable String sessionId) {
		photoService.deletePhototForUser(sessionId);
	}
	
	@GetMapping("/group/get/{groupId}")
	public  ResponseEntity<byte []> getGroupProfilePhoto(@PathVariable Long groupId) throws IOException{
		byte[] resource = photoService.getPhotoForGroup(groupId);
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(resource);
	}
}
