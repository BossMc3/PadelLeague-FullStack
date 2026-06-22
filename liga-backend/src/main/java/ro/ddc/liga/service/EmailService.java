package ro.ddc.liga.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;
    
    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Send an email verification code to the user.
     */
    public boolean sendVerificationEmail(String toEmail, String fullName, String verificationCode) {
        Context context = new Context();
        context.setVariable("nume", fullName);
        context.setVariable("cod", verificationCode);
        context.setVariable("link_actiune", frontendUrl + "/verify-email");

        String htmlBody = templateEngine.process("email-template", context);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("PadelLeague — Verify Your Email");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Send a password reset email.
     */
    public boolean sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        Context context = new Context();
        context.setVariable("nume", fullName);
        context.setVariable("cod", resetToken);
        context.setVariable("link_actiune", frontendUrl + "/reset-password");

        String htmlBody = templateEngine.process("email-template", context);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("PadelLeague — Reset Your Password");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
