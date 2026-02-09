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

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierInvoicePdfService {

    private final CompanyInfoRepository companyInfoRepository;

    // ── Brand Color Palette ──────────────────────────────────────────
    private static final Color BRAND_PRIMARY = new Color(45, 122, 79);
    private static final Color BRAND_SECONDARY = new Color(26, 90, 56);
    private static final Color BRAND_ACCENT = new Color(69, 163, 113);
    private static final Color BRAND_LIGHT = new Color(248, 253, 249);
    private static final Color BRAND_VERY_LIGHT = new Color(236, 253, 240);

    // ── Neutral Palette ──────────────────────────────────────────────
    private static final Color SLATE_900 = new Color(15, 23, 42);
    private static final Color SLATE_700 = new Color(51, 65, 85);
    private static final Color SLATE_500 = new Color(100, 116, 139);
    private static final Color SLATE_400 = new Color(148, 163, 184);
    private static final Color SLATE_200 = new Color(226, 232, 240);
    private static final Color SLATE_100 = new Color(241, 245, 249);
    private static final Color SLATE_50 = new Color(248, 250, 252);
    private static final Color WHITE = Color.WHITE;

    // ── Status Colors ────────────────────────────────────────────────
    private static final Color SUCCESS = new Color(22, 163, 74);
    private static final Color WARNING = new Color(202, 138, 4);
    private static final Color DANGER = new Color(220, 38, 38);

    // ── Table Colors ─────────────────────────────────────────────────
    private static final Color TABLE_HEADER_BG = BRAND_SECONDARY;
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
    // FONT INITIALIZATION — ROBUST MULTI-FALLBACK
    // ─────────────────────────────────────────────────────────────────

    private void initFonts() {
        // ── Step 1: Try to load Arabic-capable fonts ──
        bfRegular = null;
        bfBold = null;

        // Priority 1: Arial fonts
        bfRegular = tryLoadFont("fonts/arial.ttf");
        bfBold = tryLoadFont("fonts/arialbd.ttf");

        // Priority 2: Cairo fonts fallback
        if (bfRegular == null) {
            bfRegular = tryLoadFont("fonts/Cairo-Regular.ttf");
        }
        if (bfBold == null) {
            bfBold = tryLoadFont("fonts/Cairo-Bold.ttf");
        }

        // Priority 3: System fonts (Windows)
        if (bfRegular == null) {
            bfRegular = tryLoadSystemFont(
                    "C:/Windows/Fonts/arial.ttf",
                    "C:/Windows/Fonts/Arial.ttf",
                    "C:\\Windows\\Fonts\\arial.ttf");
        }
        if (bfBold == null) {
            bfBold = tryLoadSystemFont(
                    "C:/Windows/Fonts/arialbd.ttf",
                    "C:/Windows/Fonts/Arialbd.ttf",
                    "C:\\Windows\\Fonts\\arialbd.ttf");
        }

        // Priority 4: System fonts (Linux)
        if (bfRegular == null) {
            bfRegular = tryLoadSystemFont(
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                    "/usr/share/fonts/TTF/DejaVuSans.ttf");
        }
        if (bfBold == null) {
            bfBold = tryLoadSystemFont(
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf");
        }

        // Priority 5: System fonts (macOS)
        if (bfRegular == null) {
            bfRegular = tryLoadSystemFont(
                    "/System/Library/Fonts/Supplemental/Arial.ttf",
                    "/Library/Fonts/Arial.ttf",
                    "/System/Library/Fonts/Helvetica.ttc");
        }

        // Priority 6: OpenPDF registered fonts — scan system
        if (bfRegular == null) {
            bfRegular = tryRegisteredFonts();
        }

        // ── Step 2: Final fallback to Helvetica (Arabic WILL break) ──
        if (bfRegular == null) {
            log.warn("⚠️ No Arabic-capable font found! Falling back to Helvetica. "
                    + "Arabic text will NOT render correctly. "
                    + "Please place arial.ttf or Cairo-Regular.ttf in src/main/resources/fonts/");
            try {
                bfRegular = BaseFont.createFont(
                        BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                throw new RuntimeException("Cannot load even Helvetica font", e);
            }
        }

        // Bold fallback to regular if not found
        if (bfBold == null) {
            if (bfRegular.getPostscriptFontName().contains("Helvetica")) {
                try {
                    bfBold = BaseFont.createFont(
                            BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
                } catch (Exception e) {
                    bfBold = bfRegular;
                }
            } else {
                bfBold = bfRegular;
            }
        }

        log.info("✅ PDF Font loaded — Regular: {}, Bold: {}",
                bfRegular.getPostscriptFontName(),
                bfBold.getPostscriptFontName());

        // ── Step 3: Create all styled fonts ──
        buildFontSet();
    }

    /**
     * Try loading a font from the classpath (resources folder).
     * Returns null on failure instead of throwing.
     */
    private BaseFont tryLoadFont(String classpathLocation) {
        try {
            ClassPathResource res = new ClassPathResource(classpathLocation);
            if (!res.exists()) {
                return null;
            }

            File tmp = File.createTempFile("pdf_font_", ".ttf");
            tmp.deleteOnExit();

            try (InputStream is = res.getInputStream();
                    java.io.FileOutputStream fos = new java.io.FileOutputStream(tmp)) {
                is.transferTo(fos);
            }

            BaseFont font = BaseFont.createFont(
                    tmp.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            log.info("✅ Loaded font from classpath: {}", classpathLocation);
            return font;

        } catch (Exception e) {
            log.debug("Font not available at classpath:{} — {}", classpathLocation, e.getMessage());
            return null;
        }
    }

    /**
     * Try loading a font from absolute system file paths.
     * Tries each path in order, returns first success or null.
     */
    private BaseFont tryLoadSystemFont(String... paths) {
        for (String path : paths) {
            try {
                File f = new File(path);
                if (f.exists() && f.isFile()) {
                    BaseFont font = BaseFont.createFont(
                            f.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    log.info("✅ Loaded system font: {}", path);
                    return font;
                }
            } catch (Exception e) {
                log.debug("System font not usable: {} — {}", path, e.getMessage());
            }
        }
        return null;
    }

    /**
     * Last resort: register system font directories with OpenPDF and
     * try to find an Arabic-capable font.
     */
    private BaseFont tryRegisteredFonts() {
        try {
            // Register common font directories
            FontFactory.registerDirectories();

            // Try to find any Arabic-supporting font
            String[] candidates = {
                    "arial", "arial unicode ms", "tahoma",
                    "dejavu sans", "liberation sans", "freesans",
                    "noto sans arabic", "droid sans"
            };

            for (String name : candidates) {
                Font f = FontFactory.getFont(name, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 10);
                if (f != null && f.getBaseFont() != null) {
                    log.info("✅ Found registered font: {}", name);
                    return f.getBaseFont();
                }
            }
        } catch (Exception e) {
            log.debug("Registered font search failed: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Build all application fonts from the loaded base fonts.
     */
    private void buildFontSet() {
        titleFont = new Font(bfBold, 24, Font.NORMAL, BRAND_SECONDARY);
        subtitleFont = new Font(bfRegular, 11, Font.NORMAL, SLATE_500);
        brandFont = new Font(bfBold, 16, Font.NORMAL, BRAND_PRIMARY);
        brandSubFont = new Font(bfRegular, 9, Font.NORMAL, SLATE_500);
        sectionFont = new Font(bfBold, 12, Font.NORMAL, BRAND_SECONDARY);
        labelFont = new Font(bfBold, 8, Font.NORMAL, SLATE_500);
        valueFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);
        valueBoldFont = new Font(bfBold, 10, Font.NORMAL, SLATE_900);
        tableHeaderFont = new Font(bfBold, 9, Font.NORMAL, WHITE);
        tableCellFont = new Font(bfRegular, 9, Font.NORMAL, SLATE_700);
        totalLabelFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_700);
        totalValueFont = new Font(bfRegular, 10, Font.NORMAL, SLATE_900);
        grandTotalLabelFont = new Font(bfBold, 12, Font.NORMAL, BRAND_SECONDARY);
        grandTotalValueFont = new Font(bfBold, 13, Font.NORMAL, BRAND_SECONDARY);
        footerFont = new Font(bfRegular, 8, Font.NORMAL, SLATE_500);
        footerSubFont = new Font(bfRegular, 7, Font.NORMAL, SLATE_400);
        invoiceNoFont = new Font(bfBold, 10, Font.NORMAL, BRAND_PRIMARY);
    }

    // ─────────────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────────────

    private void addHeader(Document document, SupplierInvoiceDto invoice)
            throws DocumentException {

        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setSpacingAfter(0);

        PdfPCell wrapperCell = createCell(Rectangle.NO_BORDER, BRAND_VERY_LIGHT);
        wrapperCell.setPadding(18);

        // 3-Column Layout: Arabic Right (Cell 1), Logo Center (Cell 2), English Left (Cell 3)
        // Since it's an RTL table, the first cell added is physically on the right.
        PdfPTable header = rtlTable(3, 100, new float[] { 1, 0.8f, 1 });

        CompanyInfo companyInfo = companyInfoRepository.findAll()
                .stream().findFirst().orElse(null);
        String companyEn = companyInfo != null ? safe(companyInfo.getCompanyNameEn()) : "RasRas Plastics";
        String companyAr = companyInfo != null ? safe(companyInfo.getCompanyNameAr()) : "شركة راس راس للبلاستيك";

        // ── RIGHT column: Arabic Title & Brand ──
        PdfPCell rightCol = createCell(Rectangle.NO_BORDER, null);
        rightCol.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        rightCol.setVerticalAlignment(Element.ALIGN_MIDDLE);

        addRtlParagraph(rightCol, "فاتورة مورد", titleFont, Element.ALIGN_RIGHT);

        Paragraph invNo = new Paragraph();
        invNo.setAlignment(Element.ALIGN_RIGHT);
        invNo.setSpacingBefore(4);
        invNo.add(new Chunk(safe(invoice.getInvoiceNumber()), invoiceNoFont));
        rightCol.addElement(invNo);

        addRtlParagraph(rightCol, companyAr, brandSubFont, Element.ALIGN_RIGHT, 4, 0);

        header.addCell(rightCol);

        // ── CENTER column: Logo ──
        PdfPCell centerCol = createCell(Rectangle.NO_BORDER, null);
        centerCol.setVerticalAlignment(Element.ALIGN_MIDDLE);
        centerCol.setHorizontalAlignment(Element.ALIGN_CENTER);

        if (companyInfo != null && companyInfo.getLogoPath() != null && !companyInfo.getLogoPath().isEmpty()) {
            try {
                Image logo = loadLogo(companyInfo.getLogoPath().trim());
                if (logo != null) {
                    logo.scaleToFit(85, 85);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    centerCol.addElement(logo);
                }
            } catch (Exception ignored) {
            }
        }
        header.addCell(centerCol);

        // ── LEFT column: English Title & Brand ──
        PdfPCell leftCol = createCell(Rectangle.NO_BORDER, null);
        leftCol.setRunDirection(PdfWriter.RUN_DIRECTION_LTR);
        leftCol.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Paragraph enTitle = new Paragraph("SUPPLIER INVOICE", subtitleFont);
        enTitle.setAlignment(Element.ALIGN_LEFT);
        leftCol.addElement(enTitle);

        Paragraph brand = new Paragraph();
        brand.setAlignment(Element.ALIGN_LEFT);
        brand.setSpacingBefore(4);
        brand.add(new Chunk(companyEn, brandFont));
        leftCol.addElement(brand);

        header.addCell(leftCol);

        wrapperCell.addElement(header);
        wrapper.addCell(wrapperCell);
        document.add(wrapper);

        // Accent bar
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        bar.setSpacingAfter(15);
        PdfPCell barCell = createCell(Rectangle.NO_BORDER, BRAND_PRIMARY);
        barCell.setFixedHeight(3);
        bar.addCell(barCell);
        document.add(bar);
    }

    /**
     * Try multiple strategies to load a company logo image.
     */
    private Image loadLogo(String logoPath) {
        // Strategy 0: User specified specific logo
        try {
            // Try classpath first
            ClassPathResource res = new ClassPathResource("images/logo.jpeg");
            if (res.exists())
                return Image.getInstance(res.getURL());

            // Try filesystem dev path
            File f = new File("src/main/resources/images/logo.jpeg");
            if (f.exists())
                return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {
        }

        // Strategy 1: Absolute file
        try {
            File f = new File(logoPath);
            if (f.exists())
                return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {
        }

        // Strategy 2: uploads/ directory
        try {
            File f = new File("uploads/" + logoPath);
            if (f.exists())
                return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {
        }

        // Strategy 3: Classpath
        try {
            ClassPathResource res = new ClassPathResource(logoPath);
            if (res.exists())
                return Image.getInstance(res.getURL());
        } catch (Exception ignored) {
        }

        // Strategy 4: Classpath with static/ prefix
        try {
            ClassPathResource res = new ClassPathResource("static/" + logoPath);
            if (res.exists())
                return Image.getInstance(res.getURL());
        } catch (Exception ignored) {
        }

        // Strategy 5: Dev resources
        try {
            File f = new File("src/main/resources/" + logoPath);
            if (f.exists())
                return Image.getInstance(f.getAbsolutePath());
        } catch (Exception ignored) {
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    // INFO CARDS
    // ─────────────────────────────────────────────────────────────────

    private void addInfoCards(Document document, SupplierInvoiceDto invoice)
            throws DocumentException {

        addSectionTitle(document, "تفاصيل الفاتورة");

        PdfPTable grid = rtlTable(3, 100, new float[] { 1, 1, 1 });
        grid.setSpacingAfter(15);

        addCard(grid, "المورد", safe(invoice.getSupplierNameAr()));
        addCard(grid, "رقم فاتورة المورد", safe(invoice.getSupplierInvoiceNo()));
        addStatusCard(grid, safe(invoice.getStatus()));

        addCard(grid, "تاريخ الفاتورة",
                invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().toString() : "—");
        addCard(grid, "تاريخ الاستحقاق",
                invoice.getDueDate() != null ? invoice.getDueDate().toString() : "—");
        addCard(grid, "رقم الفاتورة", safe(invoice.getInvoiceNumber()));

        document.add(grid);
    }

    private void addCard(PdfPTable table, String label, String value) {
        PdfPCell card = rtlCell(Rectangle.BOX, WHITE);
        card.setBorderColor(SLATE_200);
        card.setBorderWidth(0.5f);
        card.setPadding(10);

        addRtlParagraph(card, label, labelFont, Element.ALIGN_RIGHT, 0, 2);
        addRtlParagraph(card, value, valueBoldFont, Element.ALIGN_RIGHT);

        table.addCell(card);
    }

    private void addStatusCard(PdfPTable table, String status) {
        PdfPCell card = rtlCell(Rectangle.BOX, WHITE);
        card.setBorderColor(SLATE_200);
        card.setBorderWidth(0.5f);
        card.setPadding(10);

        addRtlParagraph(card, "الحالة", labelFont, Element.ALIGN_RIGHT, 0, 4);

        Color bg;
        String mappedStatus;
        String s = (status != null ? status.toLowerCase() : "");

        if (s.contains("unpaid") || s.contains("غير مدفوع")) {
            mappedStatus = "غير مدفوع";
            bg = WARNING; // Yellow-ish
        } else if (s.contains("paid") || s.contains("مدفوع") || s.contains("مكتمل") || s.contains("complete")) {
            mappedStatus = "مدفوع";
            bg = SUCCESS; // Green
        } else if (s.contains("معلق") || s.contains("pending") || s.contains("جزئي") || s.contains("partial")) {
            mappedStatus = "معلق";
            bg = WARNING;
        } else if (s.contains("ملغ") || s.contains("cancel")) {
            mappedStatus = "ملغي";
            bg = DANGER;
        } else {
            mappedStatus = status != null ? status : "—";
            bg = BRAND_PRIMARY;
        }

        PdfPTable badge = new PdfPTable(1);
        badge.setWidthPercentage(45);
        badge.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Font badgeFont = new Font(bfBold, 8, Font.NORMAL, WHITE);
        PdfPCell bc = new PdfPCell(new Phrase(mappedStatus, badgeFont));
        bc.setBackgroundColor(bg);
        bc.setBorder(Rectangle.NO_BORDER);
        bc.setPadding(4);
        bc.setPaddingLeft(8);
        bc.setPaddingRight(8);
        bc.setHorizontalAlignment(Element.ALIGN_CENTER);
        bc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        badge.addCell(bc);

        card.addElement(badge);
        table.addCell(card);
    }

    // ─────────────────────────────────────────────────────────────────
    // ITEMS TABLE
    // ─────────────────────────────────────────────────────────────────

    private void addItemsTable(Document document, SupplierInvoiceDto invoice)
            throws DocumentException {

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
            cell.setPadding(7);
            cell.setPaddingLeft(4);
            cell.setPaddingRight(4);
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
                addDataCell(table, safe(item.getItemNameAr()), bg, Element.ALIGN_LEFT);
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
            empty.setBackgroundColor(SLATE_50);
            empty.setBorderColor(SLATE_200);
            empty.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            table.addCell(empty);
        }

        document.add(table);
    }

    private void addDataCell(PdfPTable table, String value, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "", tableCellFont));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setPaddingLeft(4);
        cell.setPaddingRight(4);
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

    private void addSummarySection(Document document, SupplierInvoiceDto invoice)
            throws DocumentException {

        PdfPTable outer = new PdfPTable(2);
        outer.setWidthPercentage(100);
        outer.setWidths(new float[] { 1f, 1.4f });
        outer.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        outer.setSpacingBefore(5);
        outer.setSpacingAfter(10);

        // ── Summary box (RIGHT in RTL = first cell) ──
        PdfPCell boxOuter = new PdfPCell();
        boxOuter.setBorder(Rectangle.BOX);
        boxOuter.setBorderColor(SLATE_200);
        boxOuter.setBorderWidth(0.5f);
        boxOuter.setBackgroundColor(BRAND_LIGHT);
        boxOuter.setPadding(0);

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(100);
        summary.setWidths(new float[] { 1.2f, 1f });
        summary.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        addSummaryRow(summary, "المجموع الفرعي", invoice.getSubTotal(), false);
        addSummaryRow(summary, "الخصم", invoice.getDiscountAmount(), false);
        addSummaryRow(summary, "الضريبة (VAT)", invoice.getTaxAmount(), false);

        BigDecimal sub = nvl(invoice.getSubTotal());
        BigDecimal disc = nvl(invoice.getDiscountAmount());
        BigDecimal tax = nvl(invoice.getTaxAmount());
        BigDecimal total = nvl(invoice.getTotalAmount());
        BigDecimal delivery = total.subtract(sub.subtract(disc).add(tax));

        addSummaryRow(summary, "مصاريف الشحن", delivery, false);
        addSummaryRow(summary, "الإجمالي النهائي", invoice.getTotalAmount(), true);

        boxOuter.addElement(summary);
        outer.addCell(boxOuter);

        // ── Spacer (LEFT in RTL = second cell) ──
        PdfPCell spacer = new PdfPCell();
        spacer.setBorder(Rectangle.NO_BORDER);
        outer.addCell(spacer);

        document.add(outer);
    }

    private void addSummaryRow(PdfPTable table, String label, BigDecimal value,
            boolean isGrand) {

        Font lf = isGrand ? grandTotalLabelFont : totalLabelFont;
        Font vf = isGrand ? grandTotalValueFont : totalValueFont;
        Color bg = isGrand ? BRAND_VERY_LIGHT : WHITE;

        int border = Rectangle.BOTTOM;
        Color borderColor = isGrand ? BRAND_ACCENT : SLATE_100;
        float borderW = isGrand ? 1f : 0.5f;

        PdfPCell lCell = new PdfPCell(new Phrase(label, lf));
        lCell.setBorder(border);
        lCell.setBorderColor(borderColor);
        lCell.setBorderWidth(borderW);
        lCell.setBackgroundColor(bg);
        lCell.setPadding(9);
        lCell.setPaddingTop(isGrand ? 11 : 7);
        lCell.setPaddingBottom(isGrand ? 11 : 7);
        lCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        lCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.addCell(lCell);

        String display = formatMoney(value);
        if (isGrand)
            display += "  ر.س";

        PdfPCell vCell = new PdfPCell(new Phrase(display, vf));
        vCell.setBorder(border);
        vCell.setBorderColor(borderColor);
        vCell.setBorderWidth(borderW);
        vCell.setBackgroundColor(bg);
        vCell.setPadding(9);
        vCell.setPaddingTop(isGrand ? 11 : 7);
        vCell.setPaddingBottom(isGrand ? 11 : 7);
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

        // Title centered
        Paragraph title = new Paragraph("ملاحظات", sectionFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        cell.addElement(title);

        // Content centered
        Font nf = new Font(bfRegular, 10, Font.NORMAL, SLATE_700);
        Paragraph p = new Paragraph("هذه الفاتورة صادرة وفقاً للشروط والأحكام المتفق عليها مع المورد.", nf);
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
        PdfPCell sc = createCell(Rectangle.NO_BORDER, SLATE_200);
        sc.setFixedHeight(1);
        sep.addCell(sc);
        document.add(sep);

        PdfPTable ft = new PdfPTable(1);
        ft.setWidthPercentage(100);
        ft.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ft.setSpacingBefore(6);

        PdfPCell fc = rtlCell(Rectangle.NO_BORDER, null);

        Paragraph p1 = new Paragraph(
                "تم إنشاء هذه الفاتورة آلياً من نظام رصرص لإدارة الموارد", footerFont);
        p1.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p1);

        Paragraph p2 = new Paragraph(
                "Generated by RasRas ERP System  •  www.rasrasplastic.com", footerSubFont);
        p2.setAlignment(Element.ALIGN_CENTER);
        fc.addElement(p2);

        ft.addCell(fc);
        document.add(ft);
    }

    // ─────────────────────────────────────────────────────────────────
    // SECTION TITLE
    // ─────────────────────────────────────────────────────────────────

    private void addSectionTitle(Document document, String title)
            throws DocumentException {

        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        wrapper.setSpacingAfter(6);

        PdfPCell wc = rtlCell(Rectangle.NO_BORDER, null);
        wc.setPadding(0);
        wc.setPaddingBottom(4);

        PdfPTable inner = new PdfPTable(2);
        inner.setWidthPercentage(100);
        inner.setWidths(new float[] { 0.4f, 99.6f });
        inner.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell bar = createCell(Rectangle.NO_BORDER, BRAND_PRIMARY);
        bar.setFixedHeight(18);
        inner.addCell(bar);

        PdfPCell tc = new PdfPCell(new Phrase("  " + title, sectionFont));
        tc.setBorder(Rectangle.NO_BORDER);
        tc.setVerticalAlignment(Element.ALIGN_MIDDLE);
        tc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        tc.setPaddingRight(4);
        inner.addCell(tc);

        wc.addElement(inner);
        wrapper.addCell(wc);
        document.add(wrapper);
    }

    // ─────────────────────────────────────────────────────────────────
    // UTILITY HELPERS
    // ─────────────────────────────────────────────────────────────────

    private PdfPTable rtlTable(int cols, float widthPct, float[] widths) {
        try {
            PdfPTable t = new PdfPTable(cols);
            t.setWidthPercentage(widthPct);
            t.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            if (widths != null)
                t.setWidths(widths);
            return t;
        } catch (DocumentException e) {
            throw new RuntimeException(e);
        }
    }

    private PdfPCell rtlCell(int border, Color bg) {
        PdfPCell c = new PdfPCell();
        c.setBorder(border);
        if (bg != null)
            c.setBackgroundColor(bg);
        c.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        return c;
    }

    private PdfPCell createCell(int border, Color bg) {
        PdfPCell c = new PdfPCell();
        c.setBorder(border);
        if (bg != null)
            c.setBackgroundColor(bg);
        return c;
    }

    private void addRtlParagraph(PdfPCell cell, String text, Font f, int align) {
        addRtlParagraph(cell, text, f, align, 0, 0);
    }

    private void addRtlParagraph(PdfPCell cell, String text, Font f,
            int align, float spacingBefore, float spacingAfter) {
        Paragraph p = new Paragraph(text, f);
        p.setAlignment(align);
        if (spacingBefore > 0)
            p.setSpacingBefore(spacingBefore);
        if (spacingAfter > 0)
            p.setSpacingAfter(spacingAfter);
        cell.addElement(p);
    }

    private String formatMoney(BigDecimal amount) {
        return amount != null ? String.format("%,.2f", amount) : "0.00";
    }

    private String fmt(Object val) {
        if (val == null)
            return "0";
        if (val instanceof BigDecimal) {
            return ((BigDecimal) val).stripTrailingZeros().toPlainString();
        }
        return String.valueOf(val);
    }

    private String safe(String v) {
        return v != null ? v : "—";
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}