package DTO;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder

public class PushedOutOfGroupDTO {
    private Long id;
    private String name;
}
