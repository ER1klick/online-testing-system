package com.university.testing.importer.controllers;

import com.university.testing.importer.services.PdfImportService;
import com.university.testing.shared.dtos.StudentDto;
import com.university.testing.shared.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {
    private final PdfImportService pdfImportService;

    @PostMapping("/pdf")
    public ResponseEntity<List<StudentDto>> importPdf(@RequestParam("file") MultipartFile file) throws IOException {
        List<User> users = pdfImportService.importStudentsFromPdf(file);

        List<com.university.testing.shared.dtos.StudentDto> dtos = users.stream().map(u ->
                com.university.testing.shared.dtos.StudentDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .build()
        ).toList();

        return ResponseEntity.ok(dtos);
    }




}