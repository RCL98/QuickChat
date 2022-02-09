package com.circ.quickchat.entity;

import DTO.GroupDTO;
import DTO.PushedOutOfGroupDTO;
import DTO.SimpleGroupDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;
import java.util.stream.Collectors;

@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "groups")
public class Group {
	
	@Id
	private Long id;
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "group_photo_id")
	private Photo photo;
	
	@OneToOne(fetch = FetchType.EAGER, cascade =  CascadeType.ALL)
	@JoinColumn(name = "id")
	private Chat chat;
	
	@Column(name = "group_name")
	private String name;

	public Group() {
		// Constructor is empty because use of Entity and SuperBuilder annotations
	}

	public SimpleGroupDTO toSimpleGroupDTO() {
		return SimpleGroupDTO.builder().id(id).name(name).build();
	}
	
	public GroupDTO toGroupDTO() {
		return GroupDTO.builder().id(id).name(name)
				.users(chat.getUsers().stream().map(User::toUserDTO).collect(Collectors.toSet()))
				.messages(chat.getMessages().stream().map(Message::toMessageDTO).collect(Collectors.toList())).build();
	}

	public PushedOutOfGroupDTO toPushedOutOfGroupDTO() {
		return PushedOutOfGroupDTO.builder().id(chat.getId()).name(name).build();
	}

}
