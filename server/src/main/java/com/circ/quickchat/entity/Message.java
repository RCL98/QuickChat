package com.circ.quickchat.entity;

import DTO.MessageDTO;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.*;
import java.sql.Timestamp;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@Entity
@Table(name = "messages")
@SuperBuilder(toBuilder = true)
public class Message {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	
	@ManyToOne
	@JoinColumn(name = "chat_id")
	@JsonIgnoreProperties("messages")	
	private Chat chat;
	
	@Column(name = "author_id")
	private Long authorId;
	
	@Column(name = "author_name")
	private String authorName;
	
	@Column(name = "created_at")
	private Timestamp createdAt;
	
	@Column(name = "content")
	private String content;

	public MessageDTO toMessageDTO() {
		return MessageDTO.builder().id(id).authorId(authorId)
				.authorName(authorName).content(content).createdAt(createdAt).build();
	}

}
