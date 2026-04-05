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
public class PurchaseOrderPdfService {

    private final CompanyInfoRepository companyInfoRepository;

    public byte[] generatePdf(PurchaseOrderDto po) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            BaseFont baseFont = ProcurementPdfStyleSupport.loadArabicBaseFont();
            Font titleFont = new Font(baseFont, 16, Font.BOLD);
            Font sectionFont = new Font(baseFont, 11, Font.BOLD);
            Font normalFont = new Font(baseFont, 10, Font.NORMAL);
            Font smallFont = new Font(baseFont, 9, Font.NORMAL);

            Document document = new Document(PageSize.A4, 28, 28, 24, 24);
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, po, titleFont, normalFont, smallFont);
            addInfoTable(document, po, sectionFont, normalFont);
            addItemsTable(document, po.getItems(), sectionFont, smallFont);
            addTotalsTable(document, po, sectionFont, normalFont);
            ProcurementPdfStyleSupport.addFooter(document, smallFont);

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate PO PDF", ex);
        }
    }

    private void addHeader(Document document, PurchaseOrderDto po, Font titleFont, Font normalFont, Font smallFont) throws Exception {
        ProcurementPdfStyleSupport.addHeader(
                document,
                companyInfoRepository,
                titleFont,
                normalFont,
                smallFont,
                "تقرير أمر شراء",
                "رقم الأمر",
                safe(po.getPoNumber())
        );
    }

    private void addInfoTable(Document document, PurchaseOrderDto po, Font sectionFont, Font normalFont) throws Exception {
        ProcurementPdfStyleSupport.addSectionTitle(document, "بيانات أمر الشراء", sectionFont);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(72);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{0.9f, 1.1f});
        table.setSpacingAfter(10f);

        addLabelValueCell(table, "تاريخ الأمر", po.getPoDate() != null ? po.getPoDate().toString() : "—", normalFont);
        addLabelValueCell(table, "المورد", safe(po.getSupplierNameAr()), normalFont);
        addLabelValueCell(table, "الحالة", safe(po.getStatus()), normalFont);
        addLabelValueCell(table, "حالة الاعتماد", safe(po.getApprovalStatus()), normalFont);
        addLabelValueCell(table, "العملة", safe(po.getCurrency()), normalFont);
        addLabelValueCell(table, "شروط الدفع", safe(po.getPaymentTerms()), normalFont);
        addLabelValueCell(table, "شروط الشحن", safe(po.getShippingTerms()), normalFont);
        addLabelValueCell(table, "ملاحظات", safe(po.getNotes()), normalFont);

        document.add(table);
    }

    private void addItemsTable(Document document, List<PurchaseOrderItemDto> items, Font sectionFont, Font smallFont) throws Exception {
        ProcurementPdfStyleSupport.addSectionTitle(document, "بنود أمر الشراء", sectionFont);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{2.2f, 1f, 1f, 1.2f, 1.2f, 1.2f, 0.7f});

        addHeaderCell(table, "الصنف", smallFont);
        addHeaderCell(table, "الكمية", smallFont);
        addHeaderCell(table, "الوحدة", smallFont);
        addHeaderCell(table, "سعر الوحدة", smallFont);
        addHeaderCell(table, "الإجمالي", smallFont);
        addHeaderCell(table, "الحالة", smallFont);
        addHeaderCell(table, "#", smallFont);

        if (items == null || items.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("لا توجد بنود", smallFont));
            empty.setColspan(7);
            empty.setHorizontalAlignment(Element.ALIGN_RIGHT);
            empty.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            empty.setPadding(8f);
            table.addCell(empty);
        } else {
            for (int i = 0; i < items.size(); i++) {
                PurchaseOrderItemDto item = items.get(i);
                addDataCell(table, safe(item.getItemNameAr()), smallFont, Element.ALIGN_RIGHT);
                addDataCell(table, formatQty(item.getOrderedQty()), smallFont, Element.ALIGN_CENTER);
                addDataCell(table, safe(item.getUnitNameAr()), smallFont, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(item.getUnitPrice()), smallFont, Element.ALIGN_CENTER);
                addDataCell(table, formatMoney(item.getTotalPrice()), smallFont, Element.ALIGN_CENTER);
                addDataCell(table, safe(item.getStatus()), smallFont, Element.ALIGN_CENTER);
                addDataCell(table, String.valueOf(i + 1), smallFont, Element.ALIGN_CENTER);
            }
        }

        document.add(table);
    }

    private void addTotalsTable(Document document, PurchaseOrderDto po, Font sectionFont, Font normalFont) throws Exception {
        ProcurementPdfStyleSupport.addSectionTitle(document, "الإجماليات", sectionFont);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        table.setWidths(new float[]{1f, 1.2f});

        addLabelValueCell(table, "المجموع الفرعي", formatMoney(po.getSubTotal()), normalFont);
        addLabelValueCell(table, "الخصم", formatMoney(po.getDiscountAmount()), normalFont);
        addLabelValueCell(table, "الضريبة", formatMoney(po.getTaxAmount()), normalFont);
        addLabelValueCell(table, "مصاريف الشحن", formatMoney(po.getShippingCost()), normalFont);
        addLabelValueCell(table, "مصاريف أخرى", formatMoney(po.getOtherCosts()), normalFont);
        addLabelValueCell(table, "الإجمالي النهائي", formatMoney(po.getTotalAmount()), normalFont);

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
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        valueCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleLabelValueCell(valueCell);
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
