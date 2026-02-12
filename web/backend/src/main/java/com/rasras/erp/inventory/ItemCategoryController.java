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
@RequestMapping("/inventory/categories")
@RequiredArgsConstructor
@Tag(name = "Item Categories", description = "Item Category Management APIs")
public class ItemCategoryController {

    private final ItemCategoryService itemCategoryService;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Returns all item categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<List<ItemCategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(itemCategoryService.getAllCategories()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active categories", description = "Returns all active item categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<List<ItemCategoryDto>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success(itemCategoryService.getActiveCategories()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_VIEW') or hasAuthority('SECTION_WAREHOUSE')")
    public ResponseEntity<ApiResponse<ItemCategoryDto>> getCategoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(itemCategoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_CREATE')")
    public ResponseEntity<ApiResponse<ItemCategoryDto>> createCategory(@RequestBody ItemCategoryDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemCategoryService.createCategory(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_UPDATE')")
    public ResponseEntity<ApiResponse<ItemCategoryDto>> updateCategory(@PathVariable Integer id,
            @RequestBody ItemCategoryDto dto) {
        return ResponseEntity.ok(ApiResponse.success(itemCategoryService.updateCategory(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN') or hasAuthority('INVENTORY_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        itemCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
