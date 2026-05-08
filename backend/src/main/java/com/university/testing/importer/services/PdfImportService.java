package com.university.testing.importer.services;

import com.university.testing.auth.data.GroupRepository;
import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.models.Group;
import com.university.testing.shared.models.User;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PdfImportService {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public List<User> importStudentsFromPdf(MultipartFile file) throws IOException {
        List<User> importedUsers = new java.util.ArrayList<>();

        try (PDDocument document = Loader.loadPDF(file.getInputStream().readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            Pattern pattern = Pattern.compile("^\\d+\\s+(\\d+)\\s+([А-Яа-яЁё ]+?)\\s+\\d{2}\\.\\d{2}\\.\\d{4}", Pattern.MULTILINE);
            String[] lines = text.split("\n");

            for (String line : lines) {
                Matcher matcher = pattern.matcher(line.trim());
                if (matcher.find()) {
                    String zachetNumber = matcher.group(1);
                    String fio = matcher.group(2).trim();
                    String email = zachetNumber + "@edu.rut-miit.ru";

                    User student = userRepository.findByEmail(email).orElseGet(() -> {
                        User newUser = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode("password" + zachetNumber))
                                .role(User.Role.STUDENT)
                                .fullName(fio)
                                .build();
                        return userRepository.save(newUser);
                    });
                    importedUsers.add(student);
                }
            }
        }
        return importedUsers;
    }
}