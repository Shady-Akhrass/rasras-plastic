package com.rasras.erp.procurement;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.rasras.erp.company.CompanyInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionPdfService {

    private final CompanyInfoRepository companyInfoRepository;

    public byte[] generatePdf(PurchaseRequisitionDto pr) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            BaseFont baseFont = ProcurementPdfStyleSupport.loadArabicBaseFont();

            Font titleFont = new Font(baseFont, 16, Font.BOLD);
            Font sectionFont = new Font(baseFont, 11, Font.BOLD);
            Font normalFont = new Font(baseFont, 10, Font.NORMAL);
            Font smallFont = new Font(baseFont, 9, Font.NORMAL);

            Document document = new Document(PageSize.A4, 28, 28, 24, 24);
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, pr, titleFont, normalFont, smallFont);
            addInfoTable(document, pr, sectionFont, normalFont);
            addItemsTable(document, pr.getItems(), sectionFont, smallFont);
            ProcurementPdfStyleSupport.addFooter(document, smallFont);

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate PR PDF", ex);
        }
    }

    private void addHeader(Document document, PurchaseRequisitionDto pr,
                           Font titleFont, Font normalFont, Font smallFont) throws Exception {
        ProcurementPdfStyleSupport.addHeader(
                document,
                companyInfoRepository,
                titleFont,
                normalFont,
                smallFont,
                "تقرير طلب شراء",
                "رقم الطلب",
                safe(pr.getPrNumber())
        );
    }

    private void addInfoTable(Document document, PurchaseRequisitionDto pr,
                              Font sectionFont, Font normalFont) throws Exception {
        ProcurementPdfStyleSupport.addSectionTitle(document, "بيانات طلب الشراء", sectionFont);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(72);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{0.9f, 1.1f});
        table.setSpacingAfter(10f);

        addLabelValueCell(table, "تاريخ الطلب",
                pr.getPrDate() != null ? pr.getPrDate().toString() : "—", normalFont);

        addLabelValueCell(table, "القسم الطالب",
                safe(pr.getRequestedByDeptName()), normalFont);

        addLabelValueCell(table, "الطالب",
                safe(pr.getRequestedByUserName()), normalFont);

        addLabelValueCell(table, "الحالة",
                safe(pr.getStatus()), normalFont);

        addLabelValueCell(table, "الأولوية",
                safe(pr.getPriority()), normalFont);

        addLabelValueCell(table, "الإجمالي التقديري",
                formatMoney(pr.getTotalEstimatedAmount()), normalFont);

        addLabelValueCell(table, "مبرر الطلب",
                safe(pr.getJustification()), normalFont);

        addLabelValueCell(table, "ملاحظات",
                safe(pr.getNotes()), normalFont);

        document.add(table);
    }

    private void addItemsTable(Document document, List<PurchaseRequisitionItemDto> items,
                               Font sectionFont, Font smallFont) throws Exception {
        ProcurementPdfStyleSupport.addSectionTitle(document, "بنود الطلب", sectionFont);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{1.2f, 1.2f, 1.2f, 1f, 1f, 2.2f, 0.7f});

        addHeaderCell(table, "تاريخ الاحتياج", smallFont);
        addHeaderCell(table, "إجمالي تقديري", smallFont);
        addHeaderCell(table, "سعر تقديري", smallFont);
        addHeaderCell(table, "الوحدة", smallFont);
        addHeaderCell(table, "الكمية", smallFont);
        addHeaderCell(table, "الصنف", smallFont);
        addHeaderCell(table, "#", smallFont);

        if (items == null || items.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("لا توجد بنود", smallFont));
            empty.setColspan(7);
            empty.setHorizontalAlignment(Element.ALIGN_RIGHT);
            empty.setVerticalAlignment(Element.ALIGN_MIDDLE);
            empty.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            ProcurementPdfStyleSupport.styleDataCell(empty);
            empty.setPadding(8f);
            table.addCell(empty);
        } else {
            for (int i = 0; i < items.size(); i++) {
                PurchaseRequisitionItemDto item = items.get(i);

                addDataCell(
                        table,
                        item.getRequiredDate() != null ? item.getRequiredDate().toString() : "—",
                        smallFont,
                        Element.ALIGN_CENTER
                );
                addDataCell(
                        table,
                        formatMoney(item.getEstimatedTotalPrice()),
                        smallFont,
                        Element.ALIGN_CENTER
                );
                addDataCell(
                        table,
                        formatMoney(item.getEstimatedUnitPrice()),
                        smallFont,
                        Element.ALIGN_CENTER
                );
                addDataCell(
                        table,
                        safe(item.getUnitName()),
                        smallFont,
                        Element.ALIGN_CENTER
                );
                addDataCell(
                        table,
                        formatQty(item.getRequestedQty()),
                        smallFont,
                        Element.ALIGN_CENTER
                );
                addDataCell(
                        table,
                        safe(item.getItemNameAr()),
                        smallFont,
                        Element.ALIGN_RIGHT
                );
                addDataCell(
                        table,
                        String.valueOf(i + 1),
                        smallFont,
                        Element.ALIGN_CENTER
                );
            }
        }

        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleHeaderCell(cell);
        table.addCell(cell);
    }

    private void addDataCell(PdfPTable table, String text, Font font, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleDataCell(cell);
        table.addCell(cell);
    }

    private void addLabelValueCell(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        labelCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleLabelValueCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        valueCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleLabelValueCell(valueCell);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String safe(String value) {
        return ProcurementPdfStyleSupport.toArabicValue(value);
    }

    private String formatMoney(BigDecimal value) {
        return value != null ? String.format("%,.2f", value) : "0.00";
    }

    private String formatQty(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : "0";
    }
}