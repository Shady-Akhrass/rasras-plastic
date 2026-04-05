package com.rasras.erp.procurement;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.rasras.erp.company.CompanyInfo;
import com.rasras.erp.company.CompanyInfoRepository;
import org.springframework.core.io.ClassPathResource;

import java.awt.Color;
import java.io.File;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public final class ProcurementPdfStyleSupport {

    private ProcurementPdfStyleSupport() {
    }

    public static final Color BRAND_PRIMARY = new Color(90, 168, 125);
    public static final Color BRAND_SECONDARY = new Color(60, 120, 90);
    public static final Color BRAND_LIGHT = new Color(248, 253, 249);
    public static final Color BRAND_VERY_LIGHT = new Color(242, 253, 246);
    public static final Color TABLE_HEADER_BG = new Color(230, 248, 238);
    public static final Color SLATE_900 = new Color(30, 41, 59);
    public static final Color SLATE_700 = new Color(71, 85, 105);
    public static final Color SLATE_500 = new Color(100, 116, 139);
    public static final Color SLATE_200 = new Color(226, 232, 240);
    public static final Color WHITE = Color.WHITE;

    private static final Map<String, String> ENGLISH_TO_ARABIC_MAP = buildEnglishToArabicMap();
    private static final Pattern LTR_VALUE_PATTERN = Pattern.compile("^[\\p{Alnum}#:/+\\-.,_%()\\s]+$");

    public static void addHeader(
            Document document,
            CompanyInfoRepository companyInfoRepository,
            Font titleFont,
            Font normalFont,
            Font smallFont,
            String arabicTitle,
            String documentLabel,
            String documentNumber
    ) throws Exception {
        CompanyInfo companyInfo = companyInfoRepository.findAll().stream().findFirst().orElse(null);
        String companyAr = companyInfo != null && companyInfo.getCompanyNameAr() != null
                ? companyInfo.getCompanyNameAr()
                : "رصرص لخامات البلاستيك";
        String companyEn = companyInfo != null && companyInfo.getCompanyNameEn() != null
                ? companyInfo.getCompanyNameEn()
                : "RasRas Plastics";

        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);

        PdfPCell wrapperCell = new PdfPCell();
        wrapperCell.setBorder(Rectangle.NO_BORDER);
        wrapperCell.setBackgroundColor(BRAND_VERY_LIGHT);
        wrapperCell.setPadding(10f);

        PdfPTable header = new PdfPTable(3);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{1f, 0.7f, 1.3f});
        header.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell right = new PdfPCell();
        right.setBorder(Rectangle.NO_BORDER);
        right.setBackgroundColor(BRAND_VERY_LIGHT);
        right.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        right.setVerticalAlignment(Element.ALIGN_MIDDLE);
        right.setPadding(8f);

        PdfPTable rightTable = new PdfPTable(1);
        rightTable.setWidthPercentage(100);
        rightTable.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell t = new PdfPCell(new Phrase(
                arabicTitle,
                new Font(titleFont.getBaseFont(), 18, Font.BOLD, BRAND_SECONDARY)
        ));
        t.setBorder(Rectangle.NO_BORDER);
        t.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        t.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.setVerticalAlignment(Element.ALIGN_MIDDLE);
        t.setPaddingBottom(4f);
        rightTable.addCell(t);

        PdfPTable docNoTable = new PdfPTable(2);
        docNoTable.setWidthPercentage(100);
        docNoTable.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        docNoTable.setWidths(new float[]{0.8f, 1.6f});

        PdfPCell labelCell = new PdfPCell(new Phrase(
                documentLabel + ":",
                new Font(normalFont.getBaseFont(), 10, Font.BOLD, BRAND_PRIMARY)
        ));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        labelCell.setPadding(0f);

        PdfPCell valueCell = new PdfPCell(new Phrase(
                documentNumber != null ? documentNumber : "—",
                new Font(normalFont.getBaseFont(), 10, Font.BOLD, BRAND_PRIMARY)
        ));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setRunDirection(PdfWriter.RUN_DIRECTION_LTR);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        valueCell.setPadding(0f);

        docNoTable.addCell(labelCell);
        docNoTable.addCell(valueCell);

        PdfPCell n = new PdfPCell();
        n.setBorder(Rectangle.NO_BORDER);
        n.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        n.setHorizontalAlignment(Element.ALIGN_RIGHT);
        n.setPaddingBottom(3f);
        n.addElement(docNoTable);
        rightTable.addCell(n);

        PdfPCell c = new PdfPCell(new Phrase(
                companyAr,
                new Font(normalFont.getBaseFont(), 10, Font.NORMAL, SLATE_500)
        ));
        c.setBorder(Rectangle.NO_BORDER);
        c.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightTable.addCell(c);

        right.addElement(rightTable);
        header.addCell(right);

        PdfPCell center = new PdfPCell();
        center.setBorder(Rectangle.NO_BORDER);
        center.setBackgroundColor(BRAND_VERY_LIGHT);
        center.setHorizontalAlignment(Element.ALIGN_CENTER);
        center.setVerticalAlignment(Element.ALIGN_MIDDLE);
        center.setPadding(5f);

        Image logo = loadLogo();
        if (logo != null) {
            logo.scaleToFit(70, 70);
            logo.setAlignment(Element.ALIGN_CENTER);
            center.addElement(logo);
        }
        header.addCell(center);

        PdfPCell left = new PdfPCell();
        left.setBorder(Rectangle.NO_BORDER);
        left.setBackgroundColor(BRAND_VERY_LIGHT);
        left.setRunDirection(PdfWriter.RUN_DIRECTION_LTR);
        left.setHorizontalAlignment(Element.ALIGN_LEFT);
        left.setVerticalAlignment(Element.ALIGN_MIDDLE);
        left.setPadding(8f);

        Paragraph enLabel = new Paragraph("PROCUREMENT REPORT", new Font(normalFont.getBaseFont(), 9, Font.NORMAL, SLATE_500));
        enLabel.setAlignment(Element.ALIGN_LEFT);
        left.addElement(enLabel);

        Paragraph enBrand = new Paragraph(companyEn, new Font(titleFont.getBaseFont(), 13, Font.BOLD, BRAND_PRIMARY));
        enBrand.setSpacingBefore(3f);
        enBrand.setAlignment(Element.ALIGN_LEFT);
        left.addElement(enBrand);

        header.addCell(left);

        wrapperCell.addElement(header);
        wrapper.addCell(wrapperCell);
        document.add(wrapper);

        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        PdfPCell barCell = new PdfPCell();
        barCell.setBorder(Rectangle.NO_BORDER);
        barCell.setBackgroundColor(BRAND_PRIMARY);
        barCell.setFixedHeight(0.7f);
        bar.addCell(barCell);
        document.add(bar);

        addExtractionDate(document, smallFont);
    }

    public static void addSectionTitle(Document document, String title, Font sectionFont) throws Exception {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        wrapper.setSpacingAfter(6f);

        PdfPCell wc = new PdfPCell();
        wc.setBorder(Rectangle.NO_BORDER);
        wc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        wc.setPaddingBottom(4f);

        PdfPTable inner = new PdfPTable(2);
        inner.setWidthPercentage(100);
        inner.setWidths(new float[]{0.4f, 99.6f});
        inner.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell bar = new PdfPCell();
        bar.setBorder(Rectangle.NO_BORDER);
        bar.setBackgroundColor(BRAND_PRIMARY);
        bar.setFixedHeight(14f);
        inner.addCell(bar);

        PdfPCell tc = new PdfPCell(new Phrase("  " + title, sectionFont));
        tc.setBorder(Rectangle.NO_BORDER);
        tc.setVerticalAlignment(Element.ALIGN_MIDDLE);
        tc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        inner.addCell(tc);

        wc.addElement(inner);
        wrapper.addCell(wc);
        document.add(wrapper);
    }

    public static void styleHeaderCell(PdfPCell cell) {
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cell.setBackgroundColor(TABLE_HEADER_BG);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    public static void styleDataCell(PdfPCell cell) {
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(SLATE_200);
        cell.setBorderWidth(0.5f);
        cell.setPadding(6f);
        cell.setBackgroundColor(WHITE);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    public static void styleLabelValueCell(PdfPCell cell) {
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(SLATE_200);
        cell.setBorderWidth(0.5f);
        cell.setBackgroundColor(BRAND_LIGHT);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    }

    public static void addFooter(Document document, Font smallFont) throws Exception {
        PdfPTable sep = new PdfPTable(1);
        sep.setWidthPercentage(100);

        PdfPCell line = new PdfPCell();
        line.setBorder(Rectangle.NO_BORDER);
        line.setBackgroundColor(SLATE_200);
        line.setFixedHeight(0.6f);
        sep.addCell(line);
        document.add(sep);

        PdfPTable footer = new PdfPTable(1);
        footer.setWidthPercentage(100);
        footer.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        footer.setSpacingBefore(5f);

        PdfPCell footerCell = new PdfPCell();
        footerCell.setBorder(Rectangle.NO_BORDER);
        footerCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        footerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph p1 = new Paragraph(
                "تم إنشاء هذا التقرير آلياً من نظام رصرص لإدارة الموارد",
                new Font(smallFont.getBaseFont(), 8, Font.NORMAL, SLATE_500)
        );
        p1.setAlignment(Element.ALIGN_RIGHT);
        footerCell.addElement(p1);

        Paragraph p2 = new Paragraph(
                "تم الإنشاء بواسطة نظام رصرص ERP  •  www.rasrasplastic.com",
                new Font(smallFont.getBaseFont(), 7, Font.NORMAL, SLATE_500)
        );
        p2.setAlignment(Element.ALIGN_RIGHT);
        footerCell.addElement(p2);

        footer.addCell(footerCell);
        document.add(footer);
    }

    public static String toArabicValue(String value) {
        if (value == null) {
            return "—";
        }

        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return "—";
        }

        if (containsArabic(trimmed)) {
            return trimmed;
        }

        String translated = ENGLISH_TO_ARABIC_MAP.get(trimmed);
        if (translated != null) {
            return translated;
        }

        String lowerTranslated = ENGLISH_TO_ARABIC_MAP.get(trimmed.toLowerCase());
        return lowerTranslated != null ? lowerTranslated : trimmed;
    }

    public static BaseFont loadArabicBaseFont() {
        try {
            ClassPathResource res = new ClassPathResource("fonts/arial.ttf");
            try (InputStream is = res.getInputStream()) {
                byte[] bytes = is.readAllBytes();
                return BaseFont.createFont("fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, bytes, null);
            }
        } catch (Exception e) {
            throw new RuntimeException("Arabic font not found: fonts/arial.ttf", e);
        }
    }

    public static boolean shouldUseLtrDirection(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        return !containsArabic(value) && LTR_VALUE_PATTERN.matcher(value).matches();
    }

    private static boolean containsArabic(String value) {
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            if (ch >= '\u0600' && ch <= '\u06FF') {
                return true;
            }
        }
        return false;
    }

    private static Map<String, String> buildEnglishToArabicMap() {
        Map<String, String> map = new HashMap<>();

        map.put("draft", "مسودة");
        map.put("pending", "قيد الانتظار");
        map.put("approved", "معتمد");
        map.put("rejected", "مرفوض");
        map.put("senttosupplier", "مرسل إلى المورد");
        map.put("completed", "مكتمل");
        map.put("cancelled", "ملغي");
        map.put("open", "مفتوح");
        map.put("closed", "مغلق");

        map.put("urgent", "عاجل");
        map.put("high", "مرتفع");
        map.put("medium", "متوسط");
        map.put("low", "منخفض");

        map.put("egp", "جنيه مصري");
        map.put("usd", "دولار أمريكي");
        map.put("eur", "يورو");
        map.put("sar", "ريال سعودي");
        map.put("aed", "درهم إماراتي");

        map.put("cash", "نقدي");
        map.put("credit", "آجل");
        map.put("bank transfer", "حوالة بنكية");

        map.put("pr", "طلب شراء");
        map.put("po", "أمر شراء");
        map.put("rfq", "طلب عرض سعر");

        return map;
    }

    private static void addRtlParagraphLine(
            Document document,
            String text,
            Font font,
            int alignment,
            float spacingBefore,
            float spacingAfter
    ) throws Exception {
        PdfPTable wrapper = new PdfPTable(1);
        wrapper.setWidthPercentage(100);
        wrapper.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph paragraph = new Paragraph(text, font);
        paragraph.setAlignment(Element.ALIGN_RIGHT);

        if (spacingBefore > 0) {
            paragraph.setSpacingBefore(spacingBefore);
        }
        if (spacingAfter > 0) {
            paragraph.setSpacingAfter(spacingAfter);
        }

        cell.addElement(paragraph);
        wrapper.addCell(cell);
        document.add(wrapper);
    }

    private static void addExtractionDate(Document document, Font smallFont) throws Exception {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"));
        Font labelFont = new Font(smallFont.getBaseFont(), 8, Font.NORMAL, SLATE_500);
        Font valueFont = new Font(smallFont.getBaseFont(), 8, Font.NORMAL, SLATE_500);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{0.9f, 1.1f});
        table.setSpacingAfter(10f);

        PdfPCell labelCell = new PdfPCell(new Phrase("تاريخ الاستخراج:", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(0f);

        PdfPCell valueCell = new PdfPCell(new Phrase("\u200E" + ts + "\u200E", valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setRunDirection(PdfWriter.RUN_DIRECTION_LTR);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(0f);

        table.addCell(labelCell);
        table.addCell(valueCell);
        document.add(table);
    }

    private static Image loadLogo() {
        try {
            ClassPathResource res = new ClassPathResource("images/logo.png");
            if (res.exists()) {
                return Image.getInstance(res.getURL());
            }

            File f = new File("src/main/resources/images/logo.png");
            if (f.exists()) {
                return Image.getInstance(f.getAbsolutePath());
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}