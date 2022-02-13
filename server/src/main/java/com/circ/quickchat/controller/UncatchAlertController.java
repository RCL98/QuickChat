package com.circ.quickchat.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.circ.quickchat.service.UncatchAlertService;

import DTO.SynchronizationDTO;

@RestController
public class UncatchAlertController {
	
	@Autowired
	private UncatchAlertService uncatchAlertService;
	
	@GetMapping("/synchronization/{sessionId}")
	public SynchronizationDTO getSynchronizationDTO(@PathVariable String sessionId) throws IOException {
		return SynchronizationDTO.builder().alerts(uncatchAlertService.getWsMesagesForUser(sessionId)).build();
	}
}
