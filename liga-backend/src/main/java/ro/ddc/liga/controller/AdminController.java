package ro.ddc.liga.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ro.ddc.liga.model.Player;
import ro.ddc.liga.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/pending-organizers")
    public ResponseEntity<List<Player>> getPendingOrganizers() {
        return ResponseEntity.ok(adminService.getPendingOrganizers());
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<String> approveOrganizer(@PathVariable int id) {
        return ResponseEntity.ok(adminService.approveOrganizer(id));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<String> rejectOrganizer(@PathVariable int id) {
        return ResponseEntity.ok(adminService.rejectOrganizer(id));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Player>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
}
