package DTO;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
@Setter
public class RegisteredUserDTO {
    protected Long id;
    protected String name;
    protected Boolean isTemp;
}
