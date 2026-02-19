package com.rasras.erp.sales;

import com.rasras.erp.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleDto>> create(@RequestBody VehicleDto dto) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> update(
            @PathVariable Integer id,
            @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        vehicleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
