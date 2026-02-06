package com.rasras.erp.procurement;

import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RFQService {

        private final RFQRepository rfqRepository;
        private final PurchaseRequisitionRepository prRepository;
        private final SupplierRepository supplierRepository;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;

        @Transactional(readOnly = true)
        public List<RFQDto> getAllRFQs() {
                return rfqRepository.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public RFQDto getRFQById(Integer id) {
                return rfqRepository.findById(id)
                                .map(this::mapToDto)
                                .orElseThrow(() -> new RuntimeException("RFQ not found"));
        }

        @Transactional
        public void deleteRFQ(Integer id) {
                RequestForQuotation rfq = rfqRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("RFQ not found"));
                rfqRepository.delete(rfq);
        }

        @Transactional
        public RFQDto createRFQ(RFQDto dto) {
                RequestForQuotation rfq = new RequestForQuotation();
                rfq.setRfqNumber(generateRFQNumber());
                rfq.setSupplier(supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found")));

                if (dto.getPrId() != null) {
                        rfq.setPurchaseRequisition(prRepository.findById(dto.getPrId())
                                        .orElseThrow(() -> new RuntimeException("Purchase Requisition not found")));
                }

                rfq.setRfqDate(dto.getRfqDate() != null ? dto.getRfqDate() : LocalDate.now());
                rfq.setResponseDueDate(dto.getResponseDueDate());
                rfq.setNotes(dto.getNotes());
                rfq.setStatus("Sent");
                rfq.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1);

                RequestForQuotation savedRfq = rfqRepository.save(rfq);

                if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                        final RequestForQuotation finalRfq = savedRfq;
                        List<RFQItem> items = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, finalRfq))
                                        .collect(Collectors.toList());
                        savedRfq.setItems(items);
                        savedRfq = rfqRepository.save(savedRfq);
                }

                return mapToDto(savedRfq);
        }

        @Transactional
        public RFQDto updateRFQ(Integer id, RFQDto dto) {
                RequestForQuotation rfq = rfqRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("RFQ not found"));

                rfq.setSupplier(supplierRepository.findById(dto.getSupplierId())
                                .orElseThrow(() -> new RuntimeException("Supplier not found")));

                if (dto.getPrId() != null) {
                        rfq.setPurchaseRequisition(prRepository.findById(dto.getPrId())
                                        .orElseThrow(() -> new RuntimeException("Purchase Requisition not found")));
                } else {
                        rfq.setPurchaseRequisition(null);
                }

                if (dto.getRfqDate() != null) {
                        rfq.setRfqDate(dto.getRfqDate());
                }
                rfq.setResponseDueDate(dto.getResponseDueDate());
                rfq.setNotes(dto.getNotes());

                // Update items - clear existing and add new
                if (rfq.getItems() != null) {
                        rfq.getItems().clear();
                }
                if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                        List<RFQItem> items = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, rfq))
                                        .collect(Collectors.toList());
                        if (rfq.getItems() == null) {
                                rfq.setItems(items);
                        } else {
                                rfq.getItems().addAll(items);
                        }
                }

                return mapToDto(rfqRepository.save(rfq));
        }

        private String generateRFQNumber() {
                long n = rfqRepository.count() + 1;
                return "RFQ-" + String.format("%04d", n);
        }

        private RFQDto mapToDto(RequestForQuotation rfq) {
                return RFQDto.builder()
                                .id(rfq.getId())
                                .rfqNumber(rfq.getRfqNumber())
                                .rfqDate(rfq.getRfqDate())
                                .prId(rfq.getPurchaseRequisition() != null ? rfq.getPurchaseRequisition().getId()
                                                : null)
                                .prNumber(rfq.getPurchaseRequisition() != null
                                                ? rfq.getPurchaseRequisition().getPrNumber()
                                                : null)
                                .supplierId(rfq.getSupplier().getId())
                                .supplierNameAr(rfq.getSupplier().getSupplierNameAr())
                                .responseDueDate(rfq.getResponseDueDate())
                                .status(rfq.getStatus())
                                .notes(rfq.getNotes())
                                .createdAt(rfq.getCreatedAt())
                                .createdBy(rfq.getCreatedBy())
                                .items(rfq.getItems() != null
                                                ? rfq.getItems().stream().map(this::mapItemToDto)
                                                                .collect(Collectors.toList())
                                                : new ArrayList<>())
                                .build();
        }

        private RFQItemDto mapItemToDto(RFQItem item) {
                return RFQItemDto.builder()
                                .id(item.getId())
                                .rfqId(item.getRfq().getId())
                                .itemId(item.getItem().getId())
                                .itemNameAr(item.getItem().getItemNameAr())
                                .itemCode(item.getItem().getItemCode())
                                .requestedQty(item.getRequestedQty())
                                .unitId(item.getUnit().getId())
                                .unitName(item.getUnit().getUnitNameAr())
                                .specifications(item.getSpecifications())
                                .build();
        }

        private RFQItem mapItemToEntity(RFQItemDto dto, RequestForQuotation rfq) {
                return RFQItem.builder()
                                .rfq(rfq)
                                .item(itemRepository.findById(dto.getItemId())
                                                .orElseThrow(() -> new RuntimeException("Item not found")))
                                .requestedQty(dto.getRequestedQty())
                                .unit(unitRepository.findById(dto.getUnitId())
                                                .orElseThrow(() -> new RuntimeException("Unit not found")))
                                .specifications(dto.getSpecifications())
                                .build();
        }
}
