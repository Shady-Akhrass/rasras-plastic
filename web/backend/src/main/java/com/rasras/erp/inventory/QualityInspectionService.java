package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QualityInspectionService {

        private final QualityInspectionRepository inspectionRepo;
        private final GoodsReceiptNoteRepository grnRepo;
        private final QualityInspectionResultRepository resultRepo;
        private final ItemRepository itemRepo;
        private final QualityParameterRepository parameterRepo;
        private final GRNService grnService;
        private final com.rasras.erp.procurement.PurchaseReturnService returnService;

        @Transactional
        public void recordBulkInspection(Integer grnId, QualityInspectionRequestDto bulkRequest) {
                GoodsReceiptNote grn = grnRepo.findById(grnId)
                                .orElseThrow(() -> new RuntimeException("GRN not found"));

                for (QualityInspectionRequestDto.ItemInspectionRequest itemReq : bulkRequest.getItems()) {
                        Item item = itemRepo.findById(itemReq.getItemId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Item not found: " + itemReq.getItemId()));

                        QualityInspection inspection = new QualityInspection();
                        inspection.setInspectionNumber("QI-" + System.currentTimeMillis() + "-" + item.getId());
                        inspection.setInspectionDate(LocalDateTime.now());
                        inspection.setInspectionType("Incoming");
                        inspection.setReferenceId(grnId);
                        inspection.setReferenceType("GRN");
                        inspection.setItem(item);
                        inspection.setOverallResult(itemReq.getOverallResult());
                        inspection.setStatus("Completed");
                        inspection.setCompletedDate(LocalDateTime.now());
                        inspection.setInspectedByUserId(bulkRequest.getInspectedByUserId());
                        inspection.setCreatedBy(bulkRequest.getInspectedByUserId());
                        inspection.setNotes(itemReq.getNotes());

                        // Save inspection first to get ID
                        final QualityInspection savedInspection = inspectionRepo.save(inspection);

                        // Parameter results
                        if (itemReq.getParameterResults() != null) {
                                java.util.List<QualityInspectionResult> results = itemReq.getParameterResults().stream()
                                                .map(pr -> {
                                                        QualityParameter param = parameterRepo
                                                                        .findById(pr.getParameterId())
                                                                        .orElseThrow(() -> new RuntimeException(
                                                                                        "Parameter not found: " + pr
                                                                                                        .getParameterId()));
                                                        return QualityInspectionResult.builder()
                                                                        .inspection(savedInspection)
                                                                        .parameter(param)
                                                                        .actualValue(pr.getActualValue())
                                                                        .result(pr.getResult())
                                                                        .comments(pr.getComments())
                                                                        .build();
                                                }).collect(java.util.stream.Collectors.toList());
                                resultRepo.saveAll(results);
                        }

                        // Update GRN Item
                        GRNItem grnItem = grn.getItems().stream()
                                        .filter(gi -> gi.getItem().getId().equals(item.getId()))
                                        .findFirst()
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Item not found in GRN: " + item.getId()));

                        grnItem.setAcceptedQty(itemReq.getAcceptedQty());
                        grnItem.setRejectedQty(itemReq.getRejectedQty());
                        grnItem.setQualityStatus(itemReq.getOverallResult());
                }

                // Update GRN status if all items are inspected
                boolean allInspected = grn.getItems().stream()
                                .allMatch(gi -> gi.getQualityStatus() != null);

                if (allInspected && bulkRequest.isSubmit()) {
                        grn.setStatus("Inspected");
                        grn.setQualityStatus(bulkRequest.getOverallResult());

                        BigDecimal totalAcc = grn.getItems().stream()
                                        .map(gi -> gi.getAcceptedQty() != null ? gi.getAcceptedQty() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        BigDecimal totalRej = grn.getItems().stream()
                                        .map(gi -> gi.getRejectedQty() != null ? gi.getRejectedQty() : BigDecimal.ZERO)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        grn.setTotalAcceptedQty(totalAcc);
                        grn.setTotalRejectedQty(totalRej);

                        grnRepo.save(grn);

                        // NEW: Create Purchase Return for rejected quantities
                        if (totalRej.compareTo(BigDecimal.ZERO) > 0) {
                                createPurchaseReturnFromInspection(grn, bulkRequest.getInspectedByUserId());
                        }

                        // Auto-submit for approval
                        grnService.submitGRN(grnId, bulkRequest.getInspectedByUserId());
                } else {
                        if (allInspected) {
                                grn.setStatus("Inspected");
                        }
                        grnRepo.save(grn);
                }
        }

        private void createPurchaseReturnFromInspection(GoodsReceiptNote grn, Integer userId) {
                com.rasras.erp.procurement.dto.PurchaseReturnDto returnDto = new com.rasras.erp.procurement.dto.PurchaseReturnDto();
                returnDto.setReturnNumber("RET-" + System.currentTimeMillis());
                returnDto.setReturnDate(LocalDateTime.now());
                returnDto.setGrnId(grn.getId());
                returnDto.setSupplierId(grn.getSupplier().getId());
                returnDto.setWarehouseId(grn.getWarehouseId());
                returnDto.setReturnReason("Rejected during Quality Inspection");
                returnDto.setStatus("Draft");

                java.util.List<com.rasras.erp.procurement.dto.PurchaseReturnItemDto> returnItems = new java.util.ArrayList<>();
                BigDecimal subTotal = BigDecimal.ZERO;
                BigDecimal taxAmount = BigDecimal.ZERO;

                for (GRNItem gi : grn.getItems()) {
                        if (gi.getRejectedQty() != null && gi.getRejectedQty().compareTo(BigDecimal.ZERO) > 0) {
                                com.rasras.erp.procurement.dto.PurchaseReturnItemDto itemDto = new com.rasras.erp.procurement.dto.PurchaseReturnItemDto();
                                itemDto.setItemId(gi.getItem().getId());
                                itemDto.setGrnItemId(gi.getId());
                                itemDto.setReturnedQty(gi.getRejectedQty());
                                itemDto.setUnitId(gi.getUnit().getId());
                                BigDecimal unitPrice = gi.getUnitCost() != null ? gi.getUnitCost() : BigDecimal.ZERO;
                                itemDto.setUnitPrice(unitPrice);

                                // Fetch tax from PO item if possible, or default to 0
                                BigDecimal taxPct = BigDecimal.ZERO;
                                itemDto.setTaxPercentage(taxPct);

                                BigDecimal itemTotal = unitPrice.multiply(gi.getRejectedQty());
                                BigDecimal itemTax = itemTotal.multiply(
                                                taxPct.divide(new BigDecimal(100), 4, java.math.RoundingMode.HALF_UP));

                                itemDto.setTaxAmount(itemTax);
                                itemDto.setTotalPrice(itemTotal.add(itemTax));
                                itemDto.setReturnReason("Quality Failure");

                                returnItems.add(itemDto);
                                subTotal = subTotal.add(itemTotal);
                                taxAmount = taxAmount.add(itemTax);
                        }
                }

                if (!returnItems.isEmpty()) {
                        returnDto.setItems(returnItems);
                        returnDto.setSubTotal(subTotal);
                        returnDto.setTaxAmount(taxAmount);
                        returnDto.setTotalAmount(subTotal.add(taxAmount));

                        returnService.createReturn(returnDto);
                }
        }
}
