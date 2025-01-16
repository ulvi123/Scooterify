package com.Tuul.ScooterRentalApp.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@OpenAPIDefinition (
    info = @io.swagger.v3.oas.annotations.info.Info(
        title = "Scooter Rental App API open api specfications",
        contact = @Contact(
            name = "Mr.Robot",
            email = "nasibulvi@gmail.com",
            url = "https://github.com/ulvi123/Scooterify"
        ),
        version = "1.0",
        description = "Open API doucmentation for scooter rental app"
    ),
    servers = {
        @Server(
            description = "Local server env",
            url = "http://localhost:8080"
        )
    },
    security = {
        @SecurityRequirement(name = "Bearer Auth")
    }
    
)
@SecurityScheme(
    name="Bearer Auth",
    description = "JWT auth description",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

}
