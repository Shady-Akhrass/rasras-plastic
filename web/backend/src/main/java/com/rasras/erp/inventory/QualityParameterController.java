package com.rasras.erp.inventory;

import com.rasras.erp.shared.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/quality-parameters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize(SecurityConstants.WAREHOUSE_SECTION)
public class QualityParameterController {
    private final QualityParameterService service;

    @GetMapping
    public ResponseEntity<List<QualityParameterDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<QualityParameterDto>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }

    @PostMapping
    public ResponseEntity<QualityParameterDto> create(@RequestBody QualityParameterDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QualityParameterDto> update(@PathVariable Integer id, @RequestBody QualityParameterDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
