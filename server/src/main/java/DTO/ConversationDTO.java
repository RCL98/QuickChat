package DTO;

import com.circ.quickchat.entity.User;
import constant.ChatTypes;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
public class ConversationDTO {
	private Long id;
	private String name;

	@Builder.Default
	private ChatTypes type = ChatTypes.CONVERSATION;

	private List<MessageDTO> messages;
	private Set<User> users;
}
