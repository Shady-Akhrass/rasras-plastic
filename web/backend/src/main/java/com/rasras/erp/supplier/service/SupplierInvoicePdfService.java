package com.rasras.erp.supplier.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.rasras.erp.company.CompanyInfo;
import com.rasras.erp.company.CompanyInfoRepository;
import com.rasras.erp.supplier.dto.SupplierInvoiceDto;
import com.rasras.erp.supplier.dto.SupplierInvoiceItemDto;
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
public class SupplierInvoicePdfService {

    private final CompanyInfoRepository companyInfoRepository;

    // ── Brand Color Palette (LIGHTER / SOFTER THEME) ─────────────────
    private static final Color BRAND_PRIMARY = new Color(90, 168, 125);   // Soft Sage Green
    private static final Color BRAND_SECONDARY = new Color(60, 120, 90);  // Muted Green (Text)
    private static final Color BRAND_ACCENT = new Color(120, 190, 150);   // Accent
    
    // ── Backgrounds ──────────────────────────────────────────────────
    private static final Color BRAND_LIGHT = new Color(248, 253, 249);
    private static final Color BRAND_VERY_LIGHT = new Color(242, 253, 246);
    private static final Color TABLE_HEADER_BG = new Color(230, 248, 238);

    // ── Neutral Palette ──────────────────────────────────────────────
    private static final Color SLATE_900 = new Color(30, 41, 59);
    private static final Color SLATE_700 = new Color(71, 85, 105);
    private static final Color SLATE_500 = new Color(100, 116, 139);
    private static final Color SLATE_400 = new Color(148, 163, 184);
    private static final Color SLATE_200 = new Color(226, 232, 240);
    // FIXED: Added missing SLATE_100 definition
    private static final Color SLATE_100 = new Color(241, 245, 249); 
    private static final Color WHITE = Color.WHITE;

    // ── Status Colors ────────────────────────────────────────────────
    private static final Color SUCCESS = new Color(34, 197, 94);
    private static final Color WARNING = new Color(234, 179, 8);
    private static final Color DANGER = new Color(239, 68, 68);

    // ── Table Colors ─────────────────────────────────────────────────
    private static final Color ROW_EVEN = WHITE;
    private static final Color ROW_ODD = BRAND_LIGHT;

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

    public byte[] generateInvoicePdf(SupplierInvoiceDto invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4, 30, 30, 25, 25);
            PdfWriter.getInstance(document, out);
            document.open();

            initFonts();

            addHeader(document, invoice);
            addInfoCards(document, invoice);
            addItemsTable(document, invoice);
            addSummarySection(document, invoice);
            addNotesSection(document);
            addFooter(document);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // FONT INITIALIZATION
    // ─────────────────────────────────────────────────────────────────

    private void initFonts() {
        bfRegular = loadClasspathFont("fonts/arial.ttf");
        bfBold = loadClasspathFont("fonts/arialbd.ttf");

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
        titleFont = new Font(bfBold, 22, Font.NORMAL, BRAND_SECONDARY);
        subtitleFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_500);
        brandFont = new Font(bfBold, 15, Font.NORMAL, BRAND_PRIMARY);
        brandSubFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_500);
        invoiceNoFont = new Font(bfBold, 11, Font.NORMAL, BRAND_PRIMARY);

        sectionFont = new Font(bfBold, 12, Font.NORMAL, BRAND_SECONDARY);
        labelFont = new Font(bfBold, 8, Font.NORMAL, SLATE_500);
        valueFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);
        valueBoldFont = new Font(bfBold, 10, Font.NORMAL, SLATE_900);
        
        tableHeaderFont = new Font(bfBold, 9, Font.NORMAL, BRAND_SECONDARY);
        tableCellFont = new Font(bfRegular, 9, Font.NORMAL, SLATE_700);
        
        totalLabelFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_700);
        totalValueFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);
        
        grandTotalLabelFont = new Font(bfBold, 12, Font.NORMAL, BRAND_SECONDARY);
        grandTotalValueFont = new Font(bfBold, 13, Font.NORMAL, BRAND_SECONDARY);
        
        footerFont = new Font(bfRegular, 8, Font.NORMAL, SLATE_500);
        footerSubFont = new Font(bfRegular, 7, Font.NORMAL, SLATE_400);
        timestampFont = new Font(bfRegular, 8, Font.NORMAL, SLATE_400);
        timestampLabelFont = new Font(bfBold, 8, Font.NORMAL, SLATE_500);
    }

    // ─────────────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────────────

    private void addHeader(Document document, SupplierInvoiceDto invoice) throws DocumentException {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setSpacingAfter(0);

        PdfPCell wrapperCell = new PdfPCell();
        wrapperCell.setBorder(Rectangle.NO_BORDER);
        wrapperCell.setBackgroundColor(BRAND_VERY_LIGHT);
        wrapperCell.setPadding(10); 

        PdfPTable header = new PdfPTable(3);
        header.setWidthPercentage(100);
        header.setWidths(new float[] { 1f, 0.6f, 1f }); 

        CompanyInfo companyInfo = companyInfoRepository.findAll().stream().findFirst().orElse(null);
        String companyEn = companyInfo != null ? safe(companyInfo.getCompanyNameEn()) : "RasRas Plastics";
        String companyAr = companyInfo != null ? safe(companyInfo.getCompanyNameAr()) : "رصرص لخامات البلاستيك";

        // LEFT
        PdfPCell leftCol = new PdfPCell();
        leftCol.setBorder(Rectangle.NO_BORDER);
        leftCol.setBackgroundColor(BRAND_VERY_LIGHT);
        leftCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        leftCol.setHorizontalAlignment(Element.ALIGN_LEFT);
        leftCol.setPadding(8); 
        
        Paragraph enTitle = new Paragraph("SUPPLIER INVOICE", subtitleFont);
        leftCol.addElement(enTitle);
        Paragraph brand = new Paragraph(companyEn, brandFont);
        brand.setSpacingBefore(3);
        leftCol.addElement(brand);
        header.addCell(leftCol);

        // CENTER
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

        // RIGHT
        PdfPCell rightCol = new PdfPCell();
        rightCol.setBorder(Rectangle.NO_BORDER);
        rightCol.setBackgroundColor(BRAND_VERY_LIGHT);
        rightCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightCol.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        rightCol.setPadding(8);

        PdfPTable rightContent = new PdfPTable(1);
        rightContent.setWidthPercentage(100);
        rightContent.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell rTitle = new PdfPCell(new Phrase("فاتورة مورد", titleFont));
        rTitle.setBorder(Rectangle.NO_BORDER);
        rTitle.setHorizontalAlignment(Element.ALIGN_LEFT); 
        rTitle.setPadding(0);
        rTitle.setPaddingBottom(3);
        rightContent.addCell(rTitle);

        PdfPCell rInv = new PdfPCell(new Phrase(safe(invoice.getInvoiceNumber()), invoiceNoFont));
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

        // Accent Bar (Thin 0.5f)
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingAfter(2);
        PdfPCell barCell = createCell(Rectangle.NO_BORDER, BRAND_PRIMARY);
        barCell.setFixedHeight(0.5f); 
        bar.addCell(barCell);
        document.add(bar);

        addTimestamp(document);
    }

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
    // INFO CARDS
    // ─────────────────────────────────────────────────────────────────

    private void addInfoCards(Document document, SupplierInvoiceDto invoice) throws DocumentException {
        addSectionTitle(document, "تفاصيل الفاتورة");
        PdfPTable grid = rtlTable(3, 100, new float[] { 1, 1, 1 });
        grid.setSpacingAfter(15);

        addCard(grid, "المورد", safe(invoice.getSupplierNameAr()));
        addCard(grid, "رقم فاتورة المورد", safe(invoice.getSupplierInvoiceNo()));
        addStatusCard(grid, safe(invoice.getStatus()));
        addCard(grid, "تاريخ الفاتورة", invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().toString() : "—");
        addCard(grid, "تاريخ الاستحقاق", invoice.getDueDate() != null ? invoice.getDueDate().toString() : "—");
        addCard(grid, "رقم الفاتورة", safe(invoice.getInvoiceNumber()));

        document.add(grid);
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

        if (s.contains("unpaid") || s.contains("غير مدفوع")) { mappedStatus = "غير مدفوع"; bg = WARNING; } 
        else if (s.contains("paid") || s.contains("مدفوع")) { mappedStatus = "مدفوع"; bg = SUCCESS; } 
        else if (s.contains("pending") || s.contains("معلق")) { mappedStatus = "معلق"; bg = WARNING; } 
        else if (s.contains("cancel") || s.contains("ملغ")) { mappedStatus = "ملغي"; bg = DANGER; } 
        else { mappedStatus = status != null ? status : "—"; bg = BRAND_PRIMARY; }

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
    // ITEMS TABLE
    // ─────────────────────────────────────────────────────────────────

    private void addItemsTable(Document document, SupplierInvoiceDto invoice) throws DocumentException {
        addSectionTitle(document, "بنود الفاتورة");
        float[] widths = { 0.9f, 2.8f, 0.8f, 0.9f, 1.2f, 0.9f, 1.4f };
        PdfPTable table = new PdfPTable(widths.length);
        table.setWidthPercentage(100);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(widths);
        table.setHeaderRows(1);
        table.setSpacingAfter(8);

        String[] headers = { "#", "الصنف", "الكمية", "الوحدة", "السعر", "الخصم", "الإجمالي" };
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

        if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
            int idx = 0;
            for (SupplierInvoiceItemDto item : invoice.getItems()) {
                Color bg = (idx % 2 == 0) ? ROW_EVEN : ROW_ODD;
                addDataCell(table, String.valueOf(idx + 1), bg, Element.ALIGN_CENTER);
                addDataCell(table, safe(item.getItemNameAr()), bg, Element.ALIGN_RIGHT);
                addDataCell(table, fmt(item.getQuantity()), bg, Element.ALIGN_CENTER);
                addDataCell(table, safe(item.getUnitNameAr()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(item.getUnitPrice()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(item.getDiscountAmount()), bg, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(item.getTotalPrice()), bg, Element.ALIGN_CENTER);
                idx++;
            }
        } else {
            PdfPCell empty = new PdfPCell(new Phrase("لا توجد عناصر", tableCellFont));
            empty.setColspan(7);
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
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────

    private void addSummarySection(Document document, SupplierInvoiceDto invoice) throws DocumentException {
        PdfPTable outer = new PdfPTable(2);
        outer.setWidthPercentage(100);
        outer.setWidths(new float[] { 1.4f, 1f });
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
        summary.setWidths(new float[] { 1f, 1.2f });
        summary.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        addSummaryRow(summary, "المجموع الفرعي", invoice.getSubTotal(), false, invoice.getCurrency());
        addSummaryRow(summary, "الخصم", invoice.getDiscountAmount(), false, invoice.getCurrency());
        addSummaryRow(summary, "الضريبة (VAT)", invoice.getTaxAmount(), false, invoice.getCurrency());
        
        BigDecimal sub = nvl(invoice.getSubTotal());
        BigDecimal disc = nvl(invoice.getDiscountAmount());
        BigDecimal tax = nvl(invoice.getTaxAmount());
        BigDecimal total = nvl(invoice.getTotalAmount());
        BigDecimal delivery = total.subtract(sub.subtract(disc).add(tax));

        addSummaryRow(summary, "مصاريف الشحن", delivery, false, invoice.getCurrency());
        addSummaryRow(summary, "الإجمالي النهائي", invoice.getTotalAmount(), true, invoice.getCurrency());

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
        
        // Use SLATE_100 for normal rows, Accent for Grand Total
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

        Paragraph p = new Paragraph("هذه الفاتورة صادرة وفقاً للشروط والأحكام المتفق عليها مع المورد.", new Font(bfRegular, 10, Font.NORMAL, SLATE_700));
        p.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p);

        t.addCell(cell);
        document.add(t);
    }

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
        Paragraph p1 = new Paragraph("تم إنشاء هذه الفاتورة آلياً من نظام رصرص لإدارة الموارد", footerFont);
        p1.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p1);
        Paragraph p2 = new Paragraph("Generated by RasRas ERP System  •  www.rasrasplastic.com", footerSubFont);
        p2.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p2);
        
        ft.addCell(fc);
        document.add(ft);
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        wrapper.setSpacingAfter(6);

        PdfPCell wc = rtlCell(Rectangle.NO_BORDER, null);
        wc.setPaddingBottom(4);
        
        PdfPTable inner = new PdfPTable(2);
        inner.setWidthPercentage(100);
        inner.setWidths(new float[] { 0.4f, 99.6f });
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

    private String fmt(Object val) {
        if (val == null) return "0";
        if (val instanceof BigDecimal) return ((BigDecimal) val).stripTrailingZeros().toPlainString();
        return String.valueOf(val);
    }

    private String safe(String v) { return v != null ? v : "—"; }
    private BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private Image loadLogo(String logoPath) {
        try {
            ClassPathResource res = new ClassPathResource("images/logo.png");
            if (res.exists()) return Image.getInstance(res.getURL());
            File f = new File("src/main/resources/images/logo.png");
            if (f.exists()) return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {}
        return null;
    }
}