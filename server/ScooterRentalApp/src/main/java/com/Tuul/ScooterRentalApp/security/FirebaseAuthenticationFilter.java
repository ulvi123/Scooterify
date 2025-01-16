package com.Tuul.ScooterRentalApp.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationFilter.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        System.out.println("FirebaseAuthenticationFilter is being executed for: " + request.getRequestURI()); // Add
                                                                                                              // this
                                                                                                              // line

        String path = request.getServletPath();
        logger.debug("Checking if filter should be skipped for path: {}", path);
        return  path.equals("/users/register") ||
                path.equals("/users/login") ||
                path.equals("/users") ||
                path.startsWith("/public/") ||
                path.equals("/api/vehicles/pair") ||
                // path.equals("/reservations") ||
                // path.equals("reservations/{reservationId}") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars/") ||
                path.equals("/swagger-ui.html");

    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        logger.info("Request URI: " + request.getRequestURI());
        logger.info("Should Not Filter: " + shouldNotFilter(request));
        logger.debug("Processing request to: {}", request.getServletPath());
        String authHeader = request.getHeader("Authorization");

        logger.info("Auth Header present: " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7).trim();
            logger.info("Attempting to verify token: {}", token.substring(0, 10) + "...");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

            // Create authentication object with Firebase user ID and basic role
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    decodedToken.getUid(),
                    null,
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")));

            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.debug("Authentication successful for user: {}", decodedToken.getUid());

        } catch (FirebaseAuthException e) {
            logger.error("Firebase token verification failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Invalid or expired Firebase token: " + e.getMessage() + "\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

}