package com.parkease.dto;

import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
	private String token;
	private String type = "Bearer";
	private String id;
	private String name;
	private String email;
	private String role;

	public JwtResponse(String accessToken, String id, String name, String email, String role) {
		this.token = accessToken;
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
	}
}
