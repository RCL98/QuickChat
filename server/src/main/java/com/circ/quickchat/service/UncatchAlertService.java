package com.circ.quickchat.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.circ.quickchat.entity.UncatchAlert;
import com.circ.quickchat.entity.User;
import com.circ.quickchat.repositories.UncatchAlertRepository;
import com.circ.quickchat.websocket.WebsocketMessage;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UncatchAlertService {
	
	private final UncatchAlertRepository uncatchAlertRepository;
	
	private final UserService userService;
	
	public void saveWsMessageForUser(WebsocketMessage message, User user) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ObjectOutputStream oo = new ObjectOutputStream(baos);
		oo.writeObject(message);
		UncatchAlert uncatchAlert = UncatchAlert.builder().contentAlert(baos.toString()).user(user).build();
		uncatchAlertRepository.save(uncatchAlert);
	}
	
	public List<WebsocketMessage> getWsMesagesForUser(String sessionId) throws IOException {
		User user = userService.getUserBySessionId(sessionId);
		List<UncatchAlert> alerts = uncatchAlertRepository.findUncatchAlertsByUser(user);
		List<WebsocketMessage> wsMessages = alerts.stream().map(alert -> {
			byte[] content = alert.getContentAlert().getBytes();
			ObjectInputStream ois;
			try {
				ois = new ObjectInputStream(new ByteArrayInputStream(content));
				Object contentObject = ois.readObject();
				return (WebsocketMessage)contentObject;
			} catch (IOException e) {
				e.printStackTrace();
				throw new InternalError("Some error at deserialization");
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
				throw new InternalError("Some error at deserialization");
			}
		}).collect(Collectors.toList());
		deleteAlerts(alerts);
		return wsMessages;
	}
	
	public void deleteAlerts(Collection<UncatchAlert> alerts) {
		uncatchAlertRepository.deleteAll(alerts);
	}
}
