package com.rasras.erp.inventory;

import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/price-lists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.WAREHOUSE_SECTION)
public class PriceListController {
    private final PriceListService service;

    @GetMapping
    public ResponseEntity<List<PriceListDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceListDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<PriceListDto> create(@RequestBody PriceListDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriceListDto> update(@PathVariable Integer id, @RequestBody PriceListDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
