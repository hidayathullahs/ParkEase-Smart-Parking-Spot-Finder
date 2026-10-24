package com.parkease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkEaseApplication {

	public static void main(String[] args) {
		String mongoUri = System.getenv("MONGODB_URI");
		if (mongoUri == null || mongoUri.isBlank() || (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://"))) {
			System.err.println("================================================================================");
			System.err.println("FATAL CONFIGURATION ERROR ON RENDER:");
			System.err.println("The 'MONGODB_URI' environment variable is missing or invalid!");
			System.err.println("Current value: [" + (mongoUri == null ? "NOT SET / NULL" : (mongoUri.isEmpty() ? "EMPTY STRING" : "INVALID FORMAT")) + "]");
			System.err.println("Please set MONGODB_URI in Render (Dashboard -> Blueprints or parkease-backend -> Environment).");
			System.err.println("Format: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority");
			System.err.println("================================================================================");
		}

		String jwtSecret = System.getenv("JWT_SECRET");
		if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 32) {
			System.err.println("================================================================================");
			System.err.println("FATAL CONFIGURATION ERROR ON RENDER:");
			System.err.println("The 'JWT_SECRET' environment variable is missing or shorter than 32 characters (256 bits)!");
			System.err.println("================================================================================");
		}

		SpringApplication.run(ParkEaseApplication.class, args);
	}

}
