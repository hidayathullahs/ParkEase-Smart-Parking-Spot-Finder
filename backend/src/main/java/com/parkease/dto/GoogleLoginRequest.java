package com.parkease.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String tokenId; // The ID token from Google
    private String googleId;
    private String email;
    private String name;
    private String photo;
}
