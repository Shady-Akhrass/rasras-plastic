package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/item-quality-specs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ItemQualitySpecController {
    private final ItemQualitySpecService service;

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ItemQualitySpecDto>> getByItemId(@PathVariable Integer itemId) {
        return ResponseEntity.ok(service.getByItemId(itemId));
    }

    @PostMapping
    public ResponseEntity<ItemQualitySpecDto> create(@RequestBody ItemQualitySpecDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemQualitySpecDto> update(
            @PathVariable Integer id,
            @RequestBody ItemQualitySpecDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
