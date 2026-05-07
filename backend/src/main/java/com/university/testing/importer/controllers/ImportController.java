package com.university.testing.importer.controllers;

import com.university.testing.importer.services.PdfImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {
    private final PdfImportService pdfImportService;

    @PostMapping("/pdf")
    public ResponseEntity<String> importPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("groupName") String groupName) throws IOException {
        pdfImportService.importStudentsFromPdf(file, groupName);
        return ResponseEntity.ok("Success import");
    }




}