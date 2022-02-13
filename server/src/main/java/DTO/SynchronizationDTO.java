package DTO;

import java.util.List;

import com.circ.quickchat.websocket.WebsocketMessage;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SynchronizationDTO {
	private List<WebsocketMessage> alerts;
}
