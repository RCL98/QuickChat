package com.circ.quickchat.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;

@Setter
@Getter
@SuperBuilder
@Entity
@Table(name = "photos")
public class Photo {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "big_photo_uri")
	private String bigPhotoUri;
	
	@Column(name = "jpeg_photo_uri")
	private String jpegPhotoUri;

	public Photo() {
		// Constructor is empty because use of Entity and SuperBuilder annotations
	}

}
