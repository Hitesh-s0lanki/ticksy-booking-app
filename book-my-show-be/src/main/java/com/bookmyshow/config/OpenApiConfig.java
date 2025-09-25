package com.bookmyshow.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ticksyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ticksy Booking API")
                        .description(
                                "REST API documentation for the Ticksy booking platform covering movies, events, venues, showtimes, and bookings.")
                        .version("1.0.0")
                        .contact(new Contact().name("Ticksy Team").email("support@ticksy.app"))
                        .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(new Server().url("/").description("Default")));
    }
}
