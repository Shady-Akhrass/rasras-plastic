package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.SecurityConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/items")
@RequiredArgsConstructor
@Tag(name = "Items Master", description = "Items Management APIs")
@PreAuthorize(SecurityConstants.WAREHOUSE_SECTION)
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    @Operation(summary = "Get all items", description = "Returns all items in inventory")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.success(itemService.getAllItems()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active items", description = "Returns all active items")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getActiveItems() {
        return ResponseEntity.ok(ApiResponse.success(itemService.getActiveItems()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDto>> getItemById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItemById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemDto>> createItem(@RequestBody ItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemService.createItem(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDto>> updateItem(@PathVariable Integer id, @RequestBody ItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemService.updateItem(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Integer id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
