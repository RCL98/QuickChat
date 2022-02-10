package DTO;

import constant.ChatTypes;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
public class GroupDTO {
	private Long id;
	private String name;

	@Builder.Default
	private ChatTypes type = ChatTypes.GROUP;

	private List<MessageDTO> messages;
	private Set<UserDTO> users;
}
