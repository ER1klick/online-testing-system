package com.university.testing.importer.services;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.models.User;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PdfImportService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void importStudentsFromPdf(MultipartFile file, String groupName) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getInputStream().readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            String[] lines = text.split("\n");
            for (String line : lines) {
                String[] parts = line.trim().split("\\s+");

                if (parts.length >= 6 && parts[0].matches("\\d+") && parts[1].matches("\\d+")) {
                    String gradebookNumber = parts[1];

                    int dateIndex = -1;
                    for (int i = 2; i < parts.length; i++) {
                        if (parts[i].matches("\\d{2}\\.\\d{2}\\.\\d{4}")) {
                            dateIndex = i;
                            break;
                        }
                    }

                    if (dateIndex > 2) {
                        StringBuilder fioBuilder = new StringBuilder();
                        for (int i = 2; i < dateIndex; i++) {
                            fioBuilder.append(parts[i]).append(" ");
                        }
                        String fio = fioBuilder.toString().trim();
                        String email = gradebookNumber + "@edu.rut-miit.ru";

                        if (userRepository.findByEmail(email).isEmpty()) {
                            User student = User.builder()
                                    .email(email)
                                    .password(passwordEncoder.encode("password"+gradebookNumber))
                                    .role(User.Role.STUDENT)
                                    .groupName(groupName)
                                    .fullName(fio)
                                    .build();
                            userRepository.save(student);
                        }
                    }
                }
            }
        }
    }
}