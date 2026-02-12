package com.rasras.erp.inventory;

import com.rasras.erp.shared.dto.ApiResponse;
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
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    @Operation(summary = "Get all items", description = "Returns all items in inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.success(itemService.getAllItems()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active items", description = "Returns all active items")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getActiveItems() {
        return ResponseEntity.ok(ApiResponse.success(itemService.getActiveItems()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<ItemDto>> getItemById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItemById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_CREATE')")
    public ResponseEntity<ApiResponse<ItemDto>> createItem(@RequestBody ItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemService.createItem(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_UPDATE')")
    public ResponseEntity<ApiResponse<ItemDto>> updateItem(@PathVariable Integer id, @RequestBody ItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemService.updateItem(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Integer id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
