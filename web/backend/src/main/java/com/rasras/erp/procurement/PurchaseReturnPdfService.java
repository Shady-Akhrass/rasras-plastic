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
import com.rasras.erp.procurement.dto.PurchaseReturnDto;
import com.rasras.erp.procurement.dto.PurchaseReturnItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseReturnPdfService {

    private final CompanyInfoRepository companyInfoRepository;

    public byte[] generatePdf(PurchaseReturnDto purchaseReturn) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            BaseFont baseFont = ProcurementPdfStyleSupport.loadArabicBaseFont();
            Font titleFont = new Font(baseFont, 16, Font.BOLD);
            Font sectionFont = new Font(baseFont, 11, Font.BOLD);
            Font normalFont = new Font(baseFont, 10, Font.NORMAL);
            Font smallFont = new Font(baseFont, 9, Font.NORMAL);

            Document document = new Document(PageSize.A4, 28, 28, 24, 24);
            PdfWriter.getInstance(document, out);
            document.open();

            ProcurementPdfStyleSupport.addHeader(
                    document,
                    companyInfoRepository,
                    titleFont,
                    normalFont,
                    smallFont,
                    "تقرير مرتجع شراء",
                    "رقم المرتجع",
                    safe(purchaseReturn.getReturnNumber())
            );

            ProcurementPdfStyleSupport.addSectionTitle(document, "بيانات المرتجع", sectionFont);

            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(72);
            info.setHorizontalAlignment(Element.ALIGN_RIGHT);
            info.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            info.setWidths(new float[]{0.9f, 1.1f});
            info.setSpacingAfter(10f);
            addLabelValueCell(info, "تاريخ المرتجع", purchaseReturn.getReturnDate() != null ? purchaseReturn.getReturnDate().toString() : "—", normalFont);
            addLabelValueCell(info, "المورد", safe(purchaseReturn.getSupplierNameAr()), normalFont);
            addLabelValueCell(info, "المخزن", safe(purchaseReturn.getWarehouseNameAr()), normalFont);
            addLabelValueCell(info, "حالة المرتجع", safe(purchaseReturn.getStatus()), normalFont);
            addLabelValueCell(info, "سبب المرتجع", safe(purchaseReturn.getReturnReason()), normalFont);
            addLabelValueCell(info, "الإجمالي", formatMoney(purchaseReturn.getTotalAmount()), normalFont);
            document.add(info);

            ProcurementPdfStyleSupport.addSectionTitle(document, "بنود المرتجع", sectionFont);

            PdfPTable items = new PdfPTable(6);
            items.setWidthPercentage(100);
            items.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            items.setWidths(new float[]{2f, 1f, 1f, 1.2f, 1.2f, 0.7f});

            addHeaderCell(items, "الصنف", smallFont);
            addHeaderCell(items, "الكمية", smallFont);
            addHeaderCell(items, "الوحدة", smallFont);
            addHeaderCell(items, "سعر الوحدة", smallFont);
            addHeaderCell(items, "الإجمالي", smallFont);
            addHeaderCell(items, "#", smallFont);

            List<PurchaseReturnItemDto> rows = purchaseReturn.getItems();
            if (rows == null || rows.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Phrase("لا توجد بنود", smallFont));
                empty.setColspan(6);
                empty.setHorizontalAlignment(Element.ALIGN_RIGHT);
                empty.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
                empty.setPadding(8f);
                items.addCell(empty);
            } else {
                for (int i = 0; i < rows.size(); i++) {
                    PurchaseReturnItemDto item = rows.get(i);
                    addDataCell(items, safe(item.getItemNameAr()), smallFont, Element.ALIGN_RIGHT);
                    addDataCell(items, fmt(item.getReturnedQty()), smallFont, Element.ALIGN_CENTER);
                    addDataCell(items, safe(item.getUnitNameAr()), smallFont, Element.ALIGN_CENTER);
                    addDataCell(items, formatMoney(item.getUnitPrice()), smallFont, Element.ALIGN_CENTER);
                    addDataCell(items, formatMoney(item.getTotalPrice()), smallFont, Element.ALIGN_CENTER);
                    addDataCell(items, String.valueOf(i + 1), smallFont, Element.ALIGN_CENTER);
                }
            }

            document.add(items);
            ProcurementPdfStyleSupport.addFooter(document, smallFont);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate Purchase Return PDF", ex);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleHeaderCell(cell);
        table.addCell(cell);
    }

    private void addDataCell(PdfPTable table, String text, Font font, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleDataCell(cell);
        table.addCell(cell);
    }

    private void addLabelValueCell(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ProcurementPdfStyleSupport.styleLabelValueCell(labelCell);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
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

    private String fmt(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : "0";
    }
}
