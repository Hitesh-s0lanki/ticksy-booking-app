package com.bookmyshow.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.StringJoiner;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.springframework.stereotype.Service;

import com.bookmyshow.dto.BookingTicketData;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    // Map/normalize characters that WinAnsiEncoding can't encode
    // (Standard 14 fonts like Helvetica use this encoding)
    private static String sanitizeForWinAnsi(PDFont font, String s) throws IOException {
        if (s == null)
            return "-";

        // quick explicit replacements first
        s = s.replace("\u20B9", "Rs ")
                .replace("\u2022", "- ")
                .replace("\u2013", "-")
                .replace("\u2014", "-")
                .replace("\u00A0", " ");

        StringBuilder out = new StringBuilder(s.length());
        // iterate by code point (handles surrogate pairs)
        for (int i = 0; i < s.length();) {
            int cp = s.codePointAt(i);
            String ch = new String(Character.toChars(cp));
            boolean encodable = true;
            try {
                // Will throw if character can't be encoded by this font/encoding
                font.encode(ch);
            } catch (IllegalArgumentException ex) {
                encodable = false;
            }
            out.append(encodable ? ch : '?');
            i += Character.charCount(cp);
        }
        return out.toString();
    }

    public byte[] buildTicketPdf(BookingTicketData data, byte[] qrPng) {
        try (var doc = new PDDocument()) {
            var page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            // Use built-in fonts only
            PDFont REG = PDType1Font.HELVETICA;
            PDFont BLD = PDType1Font.HELVETICA_BOLD;

            try (var cs = new PDPageContentStream(doc, page)) {
                float margin = 50;
                float y = page.getMediaBox().getHeight() - margin;

                // Header
                cs.beginText();
                cs.setFont(BLD, 22);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(BLD, "Ticksy Ticket"));
                cs.endText();
                y -= 30;

                // Booking ID & Category
                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Booking ID: " + data.bookingId()));
                cs.endText();
                y -= 16;

                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Type: " + data.category()));
                cs.endText();
                y -= 24;

                // Title
                cs.beginText();
                cs.setFont(BLD, 18);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(BLD, String.valueOf(data.title())));
                cs.endText();
                y -= 26;

                // Venue
                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Venue: " + data.venueName()));
                cs.endText();
                y -= 16;

                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Location: " + data.venueLocation()));
                cs.endText();
                y -= 16;

                // Date/Time
                var dateStr = data.showDateTime() != null ? DATE_FMT.format(data.showDateTime()) : "-";
                var timeStr = data.showDateTime() != null ? TIME_FMT.format(data.showDateTime()) : "-";

                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Show: " + dateStr + " • " + timeStr));
                cs.endText();
                y -= 16;

                // Seats
                var seatsJoin = new StringJoiner(", ");
                if (data.seats() != null)
                    data.seats().forEach(seatsJoin::add);

                cs.beginText();
                cs.setFont(REG, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG, "Seats: " + seatsJoin));
                cs.endText();
                y -= 16;

                // Price (use Rs instead of ₹)
                cs.beginText();
                cs.setFont(BLD, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(BLD, "Total: Rs " + String.valueOf(data.totalAmount())));
                cs.endText();
                y -= 20;

                // Order/Payment
                cs.beginText();
                cs.setFont(REG, 10);
                cs.newLineAtOffset(margin, y);
                cs.showText(sanitizeForWinAnsi(REG,
                        "Order: " + nullSafe(data.orderId()) + "  •  Payment: " + nullSafe(data.paymentId())));
                cs.endText();

                // QR on right side
                if (qrPng != null) {
                    BufferedImage qrImg;
                    try (var in = new ByteArrayInputStream(qrPng)) {
                        qrImg = ImageIO.read(in);
                    }
                    var pdImg = LosslessFactory.createFromImage(doc, qrImg);

                    float qrSize = 180;
                    float qrX = page.getMediaBox().getWidth() - margin - qrSize;
                    float qrY = page.getMediaBox().getHeight() - margin - qrSize - 10;
                    cs.drawImage(pdImg, qrX, qrY, qrSize, qrSize);
                }
            }

            try (var baos = new ByteArrayOutputStream()) {
                doc.save(baos);
                return baos.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to build ticket PDF", e);
        }
    }

    private static String nullSafe(String s) {
        return (s == null || s.isBlank()) ? "-" : s;
    }
}