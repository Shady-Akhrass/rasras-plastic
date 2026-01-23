package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationComparisonService {

    private final QuotationComparisonRepository comparisonRepository;
    private final PurchaseRequisitionRepository prRepository;
    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;
    private final SupplierQuotationRepository quotationRepository;

    @Transactional(readOnly = true)
    public List<QuotationComparisonDto> getAllComparisons() {
        return comparisonRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationComparisonDto getComparisonById(Integer id) {
        return comparisonRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));
    }

    @Transactional
    public QuotationComparisonDto createComparison(QuotationComparisonDto dto) {
        QuotationComparison comparison = new QuotationComparison();
        comparison.setComparisonNumber(generateComparisonNumber());
        comparison.setItem(itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found")));

        if (dto.getPrId() != null) {
            comparison.setPurchaseRequisition(prRepository.findById(dto.getPrId())
                    .orElseThrow(() -> new RuntimeException("PR not found")));
        }

        comparison.setStatus("Draft");
        comparison.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

        QuotationComparison savedComparison = comparisonRepository.save(comparison);

        if (dto.getDetails() != null && !dto.getDetails().isEmpty()) {
            final QuotationComparison finalComp = savedComparison;
            List<QuotationComparisonDetail> details = dto.getDetails().stream()
                    .map(detailDto -> mapDetailToEntity(detailDto, finalComp))
                    .collect(Collectors.toList());
            savedComparison.setDetails(details);
            savedComparison = comparisonRepository.save(savedComparison);
        }

        return mapToDto(savedComparison);
    }

    private String generateComparisonNumber() {
        return "COMP-" + System.currentTimeMillis();
    }

    private QuotationComparisonDto mapToDto(QuotationComparison comparison) {
        return QuotationComparisonDto.builder()
                .id(comparison.getId())
                .comparisonNumber(comparison.getComparisonNumber())
                .comparisonDate(comparison.getComparisonDate())
                .prId(comparison.getPurchaseRequisition() != null ? comparison.getPurchaseRequisition().getId() : null)
                .prNumber(
                        comparison.getPurchaseRequisition() != null ? comparison.getPurchaseRequisition().getPrNumber()
                                : null)
                .itemId(comparison.getItem().getId())
                .itemNameAr(comparison.getItem().getItemNameAr())
                .selectedQuotationId(
                        comparison.getSelectedQuotation() != null ? comparison.getSelectedQuotation().getId() : null)
                .selectedSupplierId(
                        comparison.getSelectedSupplier() != null ? comparison.getSelectedSupplier().getId() : null)
                .selectionReason(comparison.getSelectionReason())
                .status(comparison.getStatus())
                .createdAt(comparison.getCreatedAt())
                .createdBy(comparison.getCreatedBy())
                .details(comparison.getDetails() != null
                        ? comparison.getDetails().stream().map(this::mapDetailToDto).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    private QuotationComparisonDetailDto mapDetailToDto(QuotationComparisonDetail detail) {
        return QuotationComparisonDetailDto.builder()
                .id(detail.getId())
                .comparisonId(detail.getComparison().getId())
                .quotationId(detail.getQuotation().getId())
                .quotationNumber(detail.getQuotation().getQuotationNumber())
                .supplierId(detail.getSupplier().getId())
                .supplierNameAr(detail.getSupplier().getSupplierNameAr())
                .unitPrice(detail.getUnitPrice())
                .totalPrice(detail.getTotalPrice())
                .paymentTerms(detail.getPaymentTerms())
                .deliveryDays(detail.getDeliveryDays())
                .qualityRating(detail.getQualityRating())
                .priceRating(detail.getPriceRating())
                .overallScore(detail.getOverallScore())
                .comments(detail.getComments())
                .build();
    }

    private QuotationComparisonDetail mapDetailToEntity(QuotationComparisonDetailDto dto,
            QuotationComparison comparison) {
        return QuotationComparisonDetail.builder()
                .comparison(comparison)
                .quotation(quotationRepository.findById(dto.getQuotationId())
                        .orElseThrow(() -> new RuntimeException("Quotation not found")))
                .supplier(supplierRepository.findById(dto.getSupplierId())
                        .orElseThrow(() -> new RuntimeException("Supplier not found")))
                .unitPrice(dto.getUnitPrice())
                .totalPrice(dto.getTotalPrice())
                .paymentTerms(dto.getPaymentTerms())
                .deliveryDays(dto.getDeliveryDays())
                .qualityRating(dto.getQualityRating())
                .priceRating(dto.getPriceRating())
                .overallScore(dto.getOverallScore())
                .comments(dto.getComments())
                .build();
    }
}
