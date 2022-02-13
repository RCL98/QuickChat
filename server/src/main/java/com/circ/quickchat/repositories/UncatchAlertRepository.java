package com.circ.quickchat.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.circ.quickchat.entity.UncatchAlert;
import com.circ.quickchat.entity.User;

@Repository
public interface UncatchAlertRepository extends JpaRepository<UncatchAlert, Long>{
	
	public List<UncatchAlert> findUncatchAlertsByUser(User user);
}
