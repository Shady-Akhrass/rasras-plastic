package com.rasras.erp.finance;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.rasras.erp.company.CompanyInfo;
import com.rasras.erp.company.CompanyInfoRepository;
import com.rasras.erp.finance.dto.PaymentVoucherDto;
import com.rasras.erp.finance.dto.PaymentVoucherAllocationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentVoucherPdfService {

    private final CompanyInfoRepository companyInfoRepository;

    // ── Brand Color Palette (LIGHT PURPLE THEME) ─────────────────────
    private static final Color BRAND_PRIMARY   = new Color(140, 100, 185);  // Soft Purple
    private static final Color BRAND_SECONDARY = new Color(95, 65, 145);    // Muted Purple (Text)
    private static final Color BRAND_ACCENT    = new Color(170, 140, 210);  // Light Purple Accent

    // ── Backgrounds ──────────────────────────────────────────────────
    private static final Color BRAND_LIGHT      = new Color(252, 249, 255);
    private static final Color BRAND_VERY_LIGHT = new Color(248, 243, 255);
    private static final Color TABLE_HEADER_BG  = new Color(240, 232, 252);

    // ── Neutral Palette ──────────────────────────────────────────────
    private static final Color SLATE_900 = new Color(30, 41, 59);
    private static final Color SLATE_700 = new Color(71, 85, 105);
    private static final Color SLATE_500 = new Color(100, 116, 139);
    private static final Color SLATE_400 = new Color(148, 163, 184);
    private static final Color SLATE_200 = new Color(226, 232, 240);
    private static final Color SLATE_100 = new Color(241, 245, 249);
    private static final Color WHITE     = Color.WHITE;

    // ── Status Colors ────────────────────────────────────────────────
    private static final Color SUCCESS = new Color(34, 197, 94);
    private static final Color WARNING = new Color(234, 179, 8);
    private static final Color DANGER  = new Color(239, 68, 68);

    // ── Table Colors ─────────────────────────────────────────────────
    private static final Color ROW_EVEN = WHITE;
    private static final Color ROW_ODD  = BRAND_LIGHT;

    // ── Fonts ────────────────────────────────────────────────────────
    private BaseFont bfRegular;
    private BaseFont bfBold;
    private Font titleFont, subtitleFont, brandFont, brandSubFont;
    private Font sectionFont, labelFont, valueFont, valueBoldFont;
    private Font tableHeaderFont, tableCellFont;
    private Font totalLabelFont, totalValueFont;
    private Font grandTotalLabelFont, grandTotalValueFont;
    private Font footerFont, footerSubFont, invoiceNoFont;
    private Font timestampFont, timestampLabelFont;

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────

    public byte[] generateVoucherPdf(PaymentVoucherDto voucher) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4, 30, 30, 25, 25);
            PdfWriter.getInstance(document, out);
            document.open();

            initFonts();

            addHeader(document, voucher);
            addInfoCards(document, voucher);
            addAllocationsTable(document, voucher);
            addSummarySection(document, voucher);
            addNotesSection(document);
            addFooter(document);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Error generating Voucher PDF", e);
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // FONT INITIALIZATION
    // ─────────────────────────────────────────────────────────────────

    private void initFonts() {
        bfRegular = loadClasspathFont("fonts/arial.ttf");
        bfBold    = loadClasspathFont("fonts/arialbd.ttf");

        if (bfRegular == null) throw new RuntimeException("Font not found: fonts/arial.ttf");
        if (bfBold == null) bfBold = bfRegular;

        buildFontSet();
    }

    private BaseFont loadClasspathFont(String classpathLocation) {
        try {
            ClassPathResource res = new ClassPathResource(classpathLocation);
            if (!res.exists()) return null;
            try (InputStream is = res.getInputStream()) {
                byte[] fontBytes = is.readAllBytes();
                return BaseFont.createFont(classpathLocation, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
            }
        } catch (Exception e) { return null; }
    }

    private void buildFontSet() {
        titleFont          = new Font(bfBold,    22, Font.NORMAL, BRAND_SECONDARY);
        subtitleFont       = new Font(bfRegular, 10, Font.NORMAL, SLATE_500);
        brandFont          = new Font(bfBold,    15, Font.NORMAL, BRAND_PRIMARY);
        brandSubFont       = new Font(bfRegular, 10, Font.NORMAL, SLATE_500);
        invoiceNoFont      = new Font(bfBold,    11, Font.NORMAL, BRAND_PRIMARY);

        sectionFont        = new Font(bfBold,    12, Font.NORMAL, BRAND_SECONDARY);
        labelFont          = new Font(bfBold,     8, Font.NORMAL, SLATE_500);
        valueFont          = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);
        valueBoldFont      = new Font(bfBold,    10, Font.NORMAL, SLATE_900);

        tableHeaderFont    = new Font(bfBold,     9, Font.NORMAL, BRAND_SECONDARY);
        tableCellFont      = new Font(bfRegular,  9, Font.NORMAL, SLATE_700);

        totalLabelFont     = new Font(bfRegular, 10, Font.NORMAL, SLATE_700);
        totalValueFont     = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);

        grandTotalLabelFont = new Font(bfBold,   12, Font.NORMAL, BRAND_SECONDARY);
        grandTotalValueFont = new Font(bfBold,   13, Font.NORMAL, BRAND_SECONDARY);

        footerFont         = new Font(bfRegular,  8, Font.NORMAL, SLATE_500);
        footerSubFont      = new Font(bfRegular,  7, Font.NORMAL, SLATE_400);
        timestampFont      = new Font(bfRegular,  8, Font.NORMAL, SLATE_400);
        timestampLabelFont = new Font(bfBold,     8, Font.NORMAL, SLATE_500);
    }

    // ─────────────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────────────

    private void addHeader(Document document, PaymentVoucherDto voucher) throws DocumentException {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setSpacingAfter(0);

        PdfPCell wrapperCell = new PdfPCell();
        wrapperCell.setBorder(Rectangle.NO_BORDER);
        wrapperCell.setBackgroundColor(BRAND_VERY_LIGHT);
        wrapperCell.setPadding(10);

        PdfPTable header = new PdfPTable(3);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{1f, 0.6f, 1f});

        CompanyInfo companyInfo = companyInfoRepository.findAll().stream().findFirst().orElse(null);
        String companyEn = companyInfo != null ? safe(companyInfo.getCompanyNameEn()) : "RasRas Plastics";
        String companyAr = companyInfo != null ? safe(companyInfo.getCompanyNameAr()) : "رصرص لخامات البلاستيك";

        // ── LEFT COLUMN: English ──
        PdfPCell leftCol = new PdfPCell();
        leftCol.setBorder(Rectangle.NO_BORDER);
        leftCol.setBackgroundColor(BRAND_VERY_LIGHT);
        leftCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        leftCol.setHorizontalAlignment(Element.ALIGN_LEFT);
        leftCol.setPadding(8);

        Paragraph enTitle = new Paragraph("PAYMENT VOUCHER", subtitleFont);
        leftCol.addElement(enTitle);
        Paragraph brand = new Paragraph(companyEn, brandFont);
        brand.setSpacingBefore(3);
        leftCol.addElement(brand);
        header.addCell(leftCol);

        // ── CENTER COLUMN: Logo ──
        PdfPCell centerCol = new PdfPCell();
        centerCol.setBorder(Rectangle.NO_BORDER);
        centerCol.setBackgroundColor(BRAND_VERY_LIGHT);
        centerCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        centerCol.setHorizontalAlignment(Element.ALIGN_CENTER);
        centerCol.setPadding(5);

        if (companyInfo != null && companyInfo.getLogoPath() != null && !companyInfo.getLogoPath().isEmpty()) {
            try {
                Image logo = loadLogo(companyInfo.getLogoPath().trim());
                if (logo != null) {
                    logo.scaleToFit(80, 80);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    centerCol.addElement(logo);
                }
            } catch (Exception ignored) {}
        }
        header.addCell(centerCol);

        // ── RIGHT COLUMN: Arabic ──
        PdfPCell rightCol = new PdfPCell();
        rightCol.setBorder(Rectangle.NO_BORDER);
        rightCol.setBackgroundColor(BRAND_VERY_LIGHT);
        rightCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightCol.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        rightCol.setPadding(8);

        PdfPTable rightContent = new PdfPTable(1);
        rightContent.setWidthPercentage(100);
        rightContent.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell rTitle = new PdfPCell(new Phrase("سند صرف", titleFont));
        rTitle.setBorder(Rectangle.NO_BORDER);
        rTitle.setHorizontalAlignment(Element.ALIGN_LEFT);
        rTitle.setPadding(0);
        rTitle.setPaddingBottom(3);
        rightContent.addCell(rTitle);

        PdfPCell rInv = new PdfPCell(new Phrase(safe(voucher.getVoucherNumber()), invoiceNoFont));
        rInv.setBorder(Rectangle.NO_BORDER);
        rInv.setHorizontalAlignment(Element.ALIGN_LEFT);
        rInv.setPadding(0);
        rInv.setPaddingBottom(3);
        rightContent.addCell(rInv);

        PdfPCell rComp = new PdfPCell(new Phrase(companyAr, brandSubFont));
        rComp.setBorder(Rectangle.NO_BORDER);
        rComp.setHorizontalAlignment(Element.ALIGN_LEFT);
        rComp.setPadding(0);
        rightContent.addCell(rComp);

        rightCol.addElement(rightContent);
        header.addCell(rightCol);

        wrapperCell.addElement(header);
        wrapper.addCell(wrapperCell);
        document.add(wrapper);

        // ── Accent Bar (thin) ──
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingAfter(2);
        PdfPCell barCell = createCell(Rectangle.NO_BORDER, BRAND_PRIMARY);
        barCell.setFixedHeight(0.5f);
        bar.addCell(barCell);
        document.add(bar);

        addTimestamp(document);
    }

    // ─────────────────────────────────────────────────────────────────
    // TIMESTAMP
    // ─────────────────────────────────────────────────────────────────

    private void addTimestamp(Document document) throws DocumentException {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd  hh:mm:ss a");
        String timestamp = now.format(formatter);

        PdfPTable tsTable = new PdfPTable(1);
        tsTable.setWidthPercentage(100);
        tsTable.setSpacingAfter(10);

        PdfPCell tsCell = new PdfPCell();
        tsCell.setBorder(Rectangle.NO_BORDER);
        tsCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        tsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tsCell.setPadding(4);
        tsCell.setPaddingRight(8);

        Phrase phrase = new Phrase();
        phrase.add(new Chunk("تاريخ الاستخراج:  ", timestampLabelFont));
        phrase.add(new Chunk("\u200E" + timestamp + "\u200E", timestampFont));

        tsCell.setPhrase(phrase);
        tsTable.addCell(tsCell);
        document.add(tsTable);
    }

    // ─────────────────────────────────────────────────────────────────
    // LOGO LOADING
    // ─────────────────────────────────────────────────────────────────

    private Image loadLogo(String logoPath) {
        try {
            ClassPathResource res = new ClassPathResource("images/logo.png");
            if (res.exists()) return Image.getInstance(res.getURL());
            File f = new File("src/main/resources/images/logo.png");
            if (f.exists()) return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {}
        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    // INFO CARDS
    // ─────────────────────────────────────────────────────────────────

    private void addInfoCards(Document document, PaymentVoucherDto voucher) throws DocumentException {
        addSectionTitle(document, "تفاصيل السند");

        PdfPTable grid = rtlTable(3, 100, new float[]{1, 1, 1});
        grid.setSpacingAfter(15);

        // Row 1
        addCard(grid, "المورد", safe(voucher.getSupplierNameAr()));
        addCard(grid, "طريقة الدفع", translatePaymentMethod(voucher.getPaymentMethod()));
        addStatusCard(grid, safe(voucher.getStatus()));

        // Row 2
        addCard(grid, "تاريخ السند",
                voucher.getVoucherDate() != null ? voucher.getVoucherDate().toString() : "—");
        addCard(grid, "رقم السند", safe(voucher.getVoucherNumber()));
        addCard(grid, "المبلغ",
                formatMoney(voucher.getAmount()) + " " + safe(voucher.getCurrency()));

        // Row 3 — conditional based on payment method OR split payment
        if (Boolean.TRUE.equals(voucher.getIsSplitPayment())) {
            grid.addCell(createCell(Rectangle.NO_BORDER, null));
            grid.addCell(createCell(Rectangle.NO_BORDER, null));
            grid.addCell(createCell(Rectangle.NO_BORDER, null));

            if (voucher.getCashAmount() != null && voucher.getCashAmount().compareTo(BigDecimal.ZERO) > 0) {
                addCard(grid, "نقدي", formatMoney(voucher.getCashAmount()));
            }
            if (voucher.getBankAmount() != null && voucher.getBankAmount().compareTo(BigDecimal.ZERO) > 0) {
                addCard(grid, "بنك", formatMoney(voucher.getBankAmount()));
            }
            if (voucher.getChequeAmount() != null && voucher.getChequeAmount().compareTo(BigDecimal.ZERO) > 0) {
                addCard(grid, "شيك", formatMoney(voucher.getChequeAmount()));
            }
            if (voucher.getBankTransferAmount() != null && voucher.getBankTransferAmount().compareTo(BigDecimal.ZERO) > 0) {
                addCard(grid, "تحويل بنكي", formatMoney(voucher.getBankTransferAmount()));
            }
        } else if ("bank".equalsIgnoreCase(voucher.getPaymentMethod())
                || "bank transfer".equalsIgnoreCase(voucher.getPaymentMethod())) {
            addCard(grid, "البنك", safe(voucher.getBankName()));
            addCard(grid, "رقم الحساب", safe(voucher.getAccountNumber()));
            grid.addCell(createCell(Rectangle.NO_BORDER, null));
        } else if ("cheque".equalsIgnoreCase(voucher.getPaymentMethod())
                || "check".equalsIgnoreCase(voucher.getPaymentMethod())) {
            addCard(grid, "رقم الشيك", safe(voucher.getCheckNumber()));
            grid.addCell(createCell(Rectangle.NO_BORDER, null));
            grid.addCell(createCell(Rectangle.NO_BORDER, null));
        }

        document.add(grid);
    }

    private String translatePaymentMethod(String method) {
        if (method == null) return "—";
        switch (method.toLowerCase()) {
            case "cash":          return "نقدي";
            case "bank":
            case "bank transfer": return "تحويل بنكي";
            case "cheque":
            case "check":         return "شيك";
            default:              return method;
        }
    }

    private void addCard(PdfPTable table, String label, String value) {
        PdfPCell card = rtlCell(Rectangle.BOX, WHITE);
        card.setBorderColor(SLATE_200);
        card.setBorderWidth(0.5f);
        card.setPadding(10);
        card.setHorizontalAlignment(Element.ALIGN_RIGHT);

        addRtlParagraph(card, label, labelFont, Element.ALIGN_RIGHT, 0, 2);

        Paragraph vp = new Paragraph();
        vp.setAlignment(Element.ALIGN_RIGHT);
        vp.add(new Chunk("\u200E" + value + "\u200E", valueBoldFont));
        card.addElement(vp);
        table.addCell(card);
    }

    private void addStatusCard(PdfPTable table, String status) {
        PdfPCell card = rtlCell(Rectangle.BOX, WHITE);
        card.setBorderColor(SLATE_200);
        card.setBorderWidth(0.5f);
        card.setPadding(10);
        card.setHorizontalAlignment(Element.ALIGN_RIGHT);

        addRtlParagraph(card, "الحالة", labelFont, Element.ALIGN_RIGHT, 0, 4);

        String s = (status != null ? status.toLowerCase() : "");
        Color bg;
        String mappedStatus;

        if (s.contains("pending") || s.contains("معلق")) {
            mappedStatus = "قيد الانتظار"; bg = WARNING;
        } else if (s.contains("partial") || s.contains("جزئي")) {
            mappedStatus = "مدفوع جزئياً"; bg = WARNING;
        } else if (s.contains("paid") || s.contains("مدفوع") || s.contains("approved") || s.contains("معتمد")) {
            mappedStatus = s.contains("paid") || s.contains("مدفوع") ? "مدفوع" : "معتمد"; bg = SUCCESS;
        } else if (s.contains("cancel") || s.contains("ملغ")) {
            mappedStatus = "ملغي"; bg = DANGER;
        } else {
            mappedStatus = status != null ? status : "—"; bg = BRAND_PRIMARY;
        }

        PdfPTable badge = new PdfPTable(1);
        badge.setWidthPercentage(45);
        badge.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Font badgeFont = new Font(bfBold, 8, Font.NORMAL, WHITE);
        PdfPCell bc = new PdfPCell(new Phrase(mappedStatus, badgeFont));
        bc.setBackgroundColor(bg);
        bc.setBorder(Rectangle.NO_BORDER);
        bc.setPadding(4);
        bc.setHorizontalAlignment(Element.ALIGN_CENTER);
        bc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        badge.addCell(bc);

        card.addElement(badge);
        table.addCell(card);
    }

    // ─────────────────────────────────────────────────────────────────
    // ALLOCATIONS TABLE
    // ─────────────────────────────────────────────────────────────────

    private void addAllocationsTable(Document document, PaymentVoucherDto voucher) throws DocumentException {
        addSectionTitle(document, "الفواتير المسددة");

        float[] widths = {1.5f, 2.8f, 2.2f, 1.8f, 1.8f, 1.8f, 2.4f, 2.4f};
        PdfPTable table = new PdfPTable(widths.length);
        table.setWidthPercentage(100);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(widths);
        table.setHeaderRows(1);
        table.setSpacingAfter(8);

        String[] headers = {"#", "رقم الفاتورة", "الصافي", "الخصم", "الضريبة", "مصاريف", "الإجمالي", "المسدد"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
            cell.setBackgroundColor(TABLE_HEADER_BG);
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            table.addCell(cell);
        }

        if (voucher.getAllocations() != null && !voucher.getAllocations().isEmpty()) {
            int idx = 0;
            for (PaymentVoucherAllocationDto alloc : voucher.getAllocations()) {
                Color bg = (idx % 2 == 0) ? ROW_EVEN : ROW_ODD;

                addDataCell(table, String.valueOf(idx + 1), bg, Element.ALIGN_CENTER);
                addDataCell(table, safe(alloc.getInvoiceNumber()), bg, Element.ALIGN_RIGHT);
                addDataCell(table, formatMoney(alloc.getInvoiceSubTotal()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(alloc.getInvoiceDiscountAmount()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(alloc.getInvoiceTaxAmount()), bg, Element.ALIGN_CENTER);

                BigDecimal otherCosts = nvl(alloc.getInvoiceDeliveryCost()).add(nvl(alloc.getInvoiceOtherCosts()));
                addDataCell(table, formatMoney(otherCosts), bg, Element.ALIGN_CENTER);

                addDataCell(table, formatMoney(alloc.getInvoiceTotal()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(alloc.getAllocatedAmount()), bg, Element.ALIGN_CENTER);

                idx++;
            }
        } else {
            PdfPCell empty = new PdfPCell(new Phrase("لا توجد فواتير مخصصة", tableCellFont));
            empty.setColspan(headers.length);
            empty.setPadding(15);
            empty.setHorizontalAlignment(Element.ALIGN_CENTER);
            empty.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            table.addCell(empty);
        }

        document.add(table);
    }

    private void addDataCell(PdfPTable table, String value, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "", tableCellFont));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(SLATE_200);
        cell.setBorderWidth(0.5f);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.addCell(cell);
    }

    // ─────────────────────────────────────────────────────────────────
    // SUMMARY SECTION
    // ─────────────────────────────────────────────────────────────────

    private void addSummarySection(Document document, PaymentVoucherDto voucher) throws DocumentException {
        PdfPTable outer = new PdfPTable(2);
        outer.setWidthPercentage(100);
        outer.setWidths(new float[]{1.4f, 1f});
        outer.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        outer.setSpacingBefore(5);
        outer.setSpacingAfter(10);

        PdfPCell boxOuter = new PdfPCell();
        boxOuter.setBorder(Rectangle.BOX);
        boxOuter.setBorderColor(SLATE_200);
        boxOuter.setBorderWidth(0.5f);
        boxOuter.setBackgroundColor(BRAND_LIGHT);
        boxOuter.setPadding(0);

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(100);
        summary.setWidths(new float[]{1f, 1.2f});
        summary.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        // Calculate Totals
        BigDecimal totalInvoicesAmount = BigDecimal.ZERO;
        BigDecimal totalPaidInThisVoucher = nvl(voucher.getAmount());
        BigDecimal totalPreviouslyPaid = BigDecimal.ZERO;

        if (voucher.getAllocations() != null) {
            for (PaymentVoucherAllocationDto alloc : voucher.getAllocations()) {
                totalInvoicesAmount = totalInvoicesAmount.add(nvl(alloc.getInvoiceTotal()));
                totalPreviouslyPaid = totalPreviouslyPaid.add(nvl(alloc.getInvoicePreviouslyPaid()));
            }
        }

        BigDecimal remaining = totalInvoicesAmount
                .subtract(totalPreviouslyPaid)
                .subtract(totalPaidInThisVoucher);

        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

        addSummaryRow(summary, "إجمالي الفواتير", totalInvoicesAmount, false, voucher.getCurrency());

        if (totalPreviouslyPaid.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal outstandingBeforeThisVoucher = totalInvoicesAmount.subtract(totalPreviouslyPaid);
            addSummaryRow(summary, "المتبقي", outstandingBeforeThisVoucher, false, voucher.getCurrency());
            addSummaryRow(summary, "المسدد في هذا السند", totalPaidInThisVoucher, false, voucher.getCurrency());
            addSummaryRow(summary, "الرصيد المتبقي", remaining, false, voucher.getCurrency());
        } else {
            addSummaryRow(summary, "المسدد في هذا السند", totalPaidInThisVoucher, false, voucher.getCurrency());
            addSummaryRow(summary, "الرصيد المتبقي", remaining, false, voucher.getCurrency());
        }

        addSummaryRow(summary, "الإجمالي النهائي", totalPaidInThisVoucher, true, voucher.getCurrency());

        boxOuter.addElement(summary);
        outer.addCell(boxOuter);
        outer.addCell(createCell(Rectangle.NO_BORDER, null));
        document.add(outer);
    }

    private void addSummaryRow(PdfPTable table, String label, BigDecimal value, boolean isGrand, String currency) {
        Font lf = isGrand ? grandTotalLabelFont : totalLabelFont;
        Font vf = isGrand ? grandTotalValueFont : totalValueFont;
        Color bg = isGrand ? BRAND_VERY_LIGHT : WHITE;
        int border = Rectangle.BOTTOM;
        Color borderColor = isGrand ? BRAND_ACCENT : SLATE_100;
        float borderW = 0.5f;

        PdfPCell lCell = new PdfPCell(new Phrase(label, lf));
        lCell.setBorder(border);
        lCell.setBorderColor(borderColor);
        lCell.setBorderWidth(borderW);
        lCell.setBackgroundColor(bg);
        lCell.setPadding(9);
        lCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        lCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.addCell(lCell);

        String display = formatMoney(value) + (isGrand ? "  " + (currency != null ? currency : "ج.م") : "");
        PdfPCell vCell = new PdfPCell(new Phrase(display, vf));
        vCell.setBorder(border);
        vCell.setBorderColor(borderColor);
        vCell.setBorderWidth(borderW);
        vCell.setBackgroundColor(bg);
        vCell.setPadding(9);
        vCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        vCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.addCell(vCell);
    }

    // ─────────────────────────────────────────────────────────────────
    // NOTES
    // ─────────────────────────────────────────────────────────────────

    private void addNotesSection(Document document) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        t.setSpacingBefore(5);
        t.setSpacingAfter(10);

        PdfPCell cell = rtlCell(Rectangle.BOX, BRAND_LIGHT);
        cell.setBorderColor(SLATE_200);
        cell.setBorderWidth(0.5f);
        cell.setPadding(12);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph title = new Paragraph("ملاحظات", sectionFont);
        title.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(title);

        Paragraph p = new Paragraph(
                "هذا السند صادر وفقاً للشروط والأحكام المتفق عليها مع المورد.",
                new Font(bfRegular, 10, Font.NORMAL, SLATE_700));
        p.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p);

        t.addCell(cell);
        document.add(t);
    }

    // ─────────────────────────────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────────────────────────────

    private void addFooter(Document document) throws DocumentException {
        PdfPTable sep = new PdfPTable(1);
        sep.setWidthPercentage(100);
        PdfPCell line = createCell(Rectangle.NO_BORDER, SLATE_200);
        line.setFixedHeight(0.5f);
        sep.addCell(line);
        document.add(sep);

        PdfPTable ft = new PdfPTable(1);
        ft.setWidthPercentage(100);
        ft.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ft.setSpacingBefore(6);

        PdfPCell fc = rtlCell(Rectangle.NO_BORDER, null);

        Paragraph p1 = new Paragraph("تم إنشاء هذا السند آلياً من نظام رصرص لإدارة الموارد", footerFont);
        p1.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p1);

        Paragraph p2 = new Paragraph("Generated by RasRas ERP System  •  www.rasrasplastic.com", footerSubFont);
        p2.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p2);

        ft.addCell(fc);
        document.add(ft);
    }

    // ─────────────────────────────────────────────────────────────────
    // SECTION TITLE
    // ─────────────────────────────────────────────────────────────────

    private void addSectionTitle(Document document, String title) throws DocumentException {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        wrapper.setSpacingAfter(6);

        PdfPCell wc = rtlCell(Rectangle.NO_BORDER, null);
        wc.setPaddingBottom(4);

        PdfPTable inner = new PdfPTable(2);
        inner.setWidthPercentage(100);
        inner.setWidths(new float[]{0.4f, 99.6f});
        inner.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell bar = createCell(Rectangle.NO_BORDER, BRAND_PRIMARY);
        bar.setFixedHeight(14);
        inner.addCell(bar);

        PdfPCell tc = new PdfPCell(new Phrase("  " + title, sectionFont));
        tc.setBorder(Rectangle.NO_BORDER);
        tc.setVerticalAlignment(Element.ALIGN_MIDDLE);
        tc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        inner.addCell(tc);

        wc.addElement(inner);
        wrapper.addCell(wc);
        document.add(wrapper);
    }

    // ─────────────────────────────────────────────────────────────────
    // UTILITY HELPERS
    // ─────────────────────────────────────────────────────────────────

    private PdfPTable rtlTable(int cols, float widthPct, float[] widths) throws DocumentException {
        PdfPTable t = new PdfPTable(cols);
        t.setWidthPercentage(widthPct);
        t.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        if (widths != null) t.setWidths(widths);
        return t;
    }

    private PdfPCell rtlCell(int border, Color bg) {
        PdfPCell c = new PdfPCell();
        c.setBorder(border);
        if (bg != null) c.setBackgroundColor(bg);
        c.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        return c;
    }

    private PdfPCell createCell(int border, Color bg) {
        PdfPCell c = new PdfPCell();
        c.setBorder(border);
        if (bg != null) c.setBackgroundColor(bg);
        return c;
    }

    private void addRtlParagraph(PdfPCell cell, String text, Font f, int align, float spacingBefore, float spacingAfter) {
        Paragraph p = new Paragraph(text, f);
        p.setAlignment(align);
        if (spacingBefore > 0) p.setSpacingBefore(spacingBefore);
        if (spacingAfter > 0) p.setSpacingAfter(spacingAfter);
        cell.addElement(p);
    }

    private String formatMoney(BigDecimal amount) {
        return amount != null ? String.format("%,.2f", amount) : "0.00";
    }

    private String safe(String v) { return v != null ? v : "—"; }

    private BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
}