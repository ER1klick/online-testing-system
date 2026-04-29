package com.university.testing.importer.services;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class PdfImportService {
    public String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(file.getInputStream().readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
}