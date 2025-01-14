package com.Tuul.ScooterRentalApp.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
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
        String path = request.getServletPath();
        // Skip filter for public endpoints
        return 
            path.equals("/users/register") || 
            path.equals("/users/login") ||
            path.equals("/users") || 
            path.startsWith("/public/") || 
            path.equals("/api/vehicles/pair") ||
            path.equals("/reservations") ||
            path.equals("reservations/{reservationId}");
           
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {


        logger.debug("Processing request to: {}", request.getServletPath());  // Add debugging

        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No Bearer token found");  // Add debugging
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            
            // Create authentication object with Firebase user ID and basic role
            Authentication auth = new UsernamePasswordAuthenticationToken(
                decodedToken.getUid(),
                null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
            );
            
            SecurityContextHolder.getContext().setAuthentication(auth);
            logger.debug("Authenticated user {} with Firebase", decodedToken.getUid());
            
        } catch (FirebaseAuthException e) {
            logger.error("Firebase Authentication failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }

   
}