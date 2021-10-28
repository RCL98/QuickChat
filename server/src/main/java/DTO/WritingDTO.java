package DTO;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class WritingDTO {
	private Long id;
	private Boolean isWriting;
}
