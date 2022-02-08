package com.circ.quickchat.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import javax.persistence.*;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@Table(name = "chats")
@Entity
public class Chat {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	protected Long id;
	
	@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
	@JoinTable(name = "users_to_chat",
			joinColumns = @JoinColumn(name = "chat_id"),
			inverseJoinColumns = @JoinColumn(name = "user_id")
			)
	private Set<User> users;
	
	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JoinColumn(name = "chat_id")
	protected List<Message> messages;

	public Chat() {
		// Constructor is empty because use of Entity and SuperBuilder annotations
	}

}
