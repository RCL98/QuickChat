package com.circ.quickchat.entity;

import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.*;

import DTO.ConversationDTO;
import DTO.SimpleConversationDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "conversations")
public class Conversation {
	
	@Id
	private Long id;
	
	@OneToOne(fetch = FetchType.EAGER, cascade =  CascadeType.ALL)
	@JoinColumn(name = "id")
	private Chat chat;
	
	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
	@JoinColumn(name = "conversation_id")
	private List<ConversationInfo> conversationsInfo;

	public Conversation() {
		// Constructor is empty because use of Entity and SuperBuilder annotations
	}

	public ConversationDTO toConversationDTO(Long userConvId) {
		ConversationInfo conversationInfoForCurrentUser = conversationsInfo.stream()
				.filter(convInfo -> convInfo.getUserId().equals(userConvId)).findAny()
				.orElseThrow(() -> new InternalError("This user isn't into covnersation"));
		return ConversationDTO.builder().id(id).users(chat.getUsers())
				.name(conversationInfoForCurrentUser.getName())
				.messages(chat.getMessages().stream().map(Message::toMessageDTO).collect(Collectors.toList())).build();
	}
	
	public SimpleConversationDTO toSimpleConversationDTO(Long userConvId) {
		ConversationInfo conversationInfoForCurrentUser = conversationsInfo.stream()
				.filter(convInfo -> convInfo.getUserId().equals(userConvId)).findAny()
				.orElseThrow(() -> new InternalError("This user isn't into covnersation"));
		Long partnerId = conversationsInfo.stream().map(ConversationInfo::getUserId)
				.filter(userId -> !userId.equals(userConvId)).findAny()
				.orElseThrow(() -> new InternalError("This conv contain only one user!"));
		return SimpleConversationDTO.builder().id(id).name(conversationInfoForCurrentUser.getName())
				.partnerId(partnerId).build();
	}
}
