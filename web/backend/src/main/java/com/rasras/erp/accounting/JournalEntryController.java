package com.rasras.erp.accounting;

import com.rasras.erp.accounting.dto.*;
import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/journal-entries")
@RequiredArgsConstructor
@Tag(name = "Journal Entries", description = "Journal entry management APIs")
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    @GetMapping
    @Operation(summary = "Get all journal entries", description = "Returns a paginated list of journal entries")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<Page<JournalEntryDto>>> getAllJournalEntries(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<JournalEntryDto> entries = journalEntryService.getAllJournalEntries(pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get journal entry by ID", description = "Returns a journal entry by its ID")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<JournalEntryDto>> getJournalEntryById(@PathVariable Integer id) {
        JournalEntryDto entry = journalEntryService.getJournalEntryById(id);
        return ResponseEntity.ok(ApiResponse.success(entry));
    }

    @GetMapping("/number/{entryNumber}")
    @Operation(summary = "Get journal entry by number", description = "Returns a journal entry by its entry number")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<JournalEntryDto>> getJournalEntryByNumber(@PathVariable String entryNumber) {
        JournalEntryDto entry = journalEntryService.getJournalEntryByNumber(entryNumber);
        return ResponseEntity.ok(ApiResponse.success(entry));
    }

    @PostMapping
    @Operation(summary = "Create a new journal entry", description = "Creates a new journal entry")
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public ResponseEntity<ApiResponse<JournalEntryDto>> createJournalEntry(
            @Valid @RequestBody CreateJournalEntryRequest request) {
        JournalEntryDto entry = journalEntryService.createJournalEntry(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Journal entry created successfully", entry));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update journal entry", description = "Updates an existing journal entry")
    @PreAuthorize("hasAuthority('ACCOUNTING_UPDATE')")
    public ResponseEntity<ApiResponse<JournalEntryDto>> updateJournalEntry(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateJournalEntryRequest request) {
        JournalEntryDto entry = journalEntryService.updateJournalEntry(id, request);
        return ResponseEntity.ok(ApiResponse.success("Journal entry updated successfully", entry));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete journal entry", description = "Deletes a journal entry (only if not posted)")
    @PreAuthorize("hasAuthority('ACCOUNTING_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteJournalEntry(@PathVariable Integer id) {
        journalEntryService.deleteJournalEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Journal entry deleted successfully"));
    }

    @PostMapping("/{id}/post")
    @Operation(summary = "Post journal entry", description = "Posts a journal entry (changes status to Posted)")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    public ResponseEntity<ApiResponse<JournalEntryDto>> postJournalEntry(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JournalEntryDto entry = journalEntryService.postJournalEntry(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Journal entry posted successfully", entry));
    }

    @GetMapping("/by-date-range")
    @Operation(summary = "Get journal entries by date range", description = "Returns journal entries within a date range")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<Page<JournalEntryDto>>> getJournalEntriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<JournalEntryDto> entries = journalEntryService.getJournalEntriesByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/by-status")
    @Operation(summary = "Get journal entries by status", description = "Returns journal entries with a specific status")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<Page<JournalEntryDto>>> getJournalEntriesByStatus(
            @RequestParam String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<JournalEntryDto> entries = journalEntryService.getJournalEntriesByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/by-fiscal-year")
    @Operation(summary = "Get journal entries by fiscal year", description = "Returns journal entries for a specific fiscal year")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<Page<JournalEntryDto>>> getJournalEntriesByFiscalYear(
            @RequestParam Integer fiscalYearId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<JournalEntryDto> entries = journalEntryService.getJournalEntriesByFiscalYear(fiscalYearId, pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/by-source")
    @Operation(summary = "Get journal entries by source", description = "Returns journal entries for a specific source")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public ResponseEntity<ApiResponse<List<JournalEntryDto>>> getJournalEntriesBySource(
            @RequestParam String sourceType,
            @RequestParam Integer sourceId) {
        List<JournalEntryDto> entries = journalEntryService.getJournalEntriesBySource(sourceType, sourceId);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }
}
