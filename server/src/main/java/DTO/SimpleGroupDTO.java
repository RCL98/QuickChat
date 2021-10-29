package DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import constant.ChatTypes;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SimpleGroupDTO {
	private Long id;

	@Builder.Default
	private ChatTypes type = ChatTypes.GROUP;

	private String name;
}
