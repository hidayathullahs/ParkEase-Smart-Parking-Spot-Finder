package com.parkease.config;

import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return clientSettingsBuilder -> {
            clientSettingsBuilder.applyToClusterSettings(builder ->
                    builder.serverSelectionTimeout(8, TimeUnit.SECONDS)
            );
            clientSettingsBuilder.applyToSocketSettings(builder ->
                    builder.connectTimeout(8, TimeUnit.SECONDS)
                           .readTimeout(15, TimeUnit.SECONDS)
            );
        };
    }
}
