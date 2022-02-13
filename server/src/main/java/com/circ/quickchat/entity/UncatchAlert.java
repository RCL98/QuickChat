package com.circ.quickchat.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Builder
@Table(name = "uncatch_alert")
public class UncatchAlert {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "alert_content")
	private String contentAlert;
	
	@ManyToOne
	@JoinColumn(name = "user_id")	
	private User user;
	
	
}
