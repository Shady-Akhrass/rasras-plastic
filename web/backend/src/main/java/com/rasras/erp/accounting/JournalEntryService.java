package com.rasras.erp.accounting;

import com.rasras.erp.accounting.dto.*;
import com.rasras.erp.shared.exception.BadRequestException;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getAllJournalEntries(Pageable pageable) {
        return journalEntryRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public JournalEntryDto getJournalEntryById(Integer id) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal Entry", "id", id));
        return mapToDto(entry);
    }

    @Transactional(readOnly = true)
    public JournalEntryDto getJournalEntryByNumber(String entryNumber) {
        JournalEntry entry = journalEntryRepository.findByEntryNumber(entryNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Journal Entry", "entryNumber", entryNumber));
        return mapToDto(entry);
    }

    @Transactional
    public JournalEntryDto createJournalEntry(CreateJournalEntryRequest request) {
        // Validate entry number uniqueness
        if (journalEntryRepository.existsByEntryNumber(request.getEntryNumber())) {
            throw new BadRequestException("Entry number already exists: " + request.getEntryNumber());
        }

        // Validate debit equals credit
        if (request.getTotalDebit().compareTo(request.getTotalCredit()) != 0) {
            throw new BadRequestException("Total debit must equal total credit");
        }

        JournalEntry entry = JournalEntry.builder()
                .entryNumber(request.getEntryNumber())
                .entryDate(request.getEntryDate())
                .fiscalYearId(request.getFiscalYearId())
                .periodId(request.getPeriodId())
                .entryType(request.getEntryType())
                .sourceType(request.getSourceType())
                .sourceId(request.getSourceId())
                .sourceNumber(request.getSourceNumber())
                .description(request.getDescription())
                .totalDebit(request.getTotalDebit())
                .totalCredit(request.getTotalCredit())
                .currency(request.getCurrency() != null ? request.getCurrency() : "EGP")
                .exchangeRate(request.getExchangeRate() != null ? request.getExchangeRate() : BigDecimal.ONE)
                .status(request.getStatus() != null ? request.getStatus() : "Draft")
                .notes(request.getNotes())
                .build();

        return mapToDto(journalEntryRepository.save(entry));
    }

    @Transactional
    public JournalEntryDto updateJournalEntry(Integer id, UpdateJournalEntryRequest request) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal Entry", "id", id));

        // Cannot update posted entries
        if ("Posted".equals(entry.getStatus())) {
            throw new BadRequestException("Cannot update a posted journal entry");
        }

        if (request.getEntryDate() != null)
            entry.setEntryDate(request.getEntryDate());
        if (request.getFiscalYearId() != null)
            entry.setFiscalYearId(request.getFiscalYearId());
        if (request.getPeriodId() != null)
            entry.setPeriodId(request.getPeriodId());
        if (request.getEntryType() != null)
            entry.setEntryType(request.getEntryType());
        if (request.getSourceType() != null)
            entry.setSourceType(request.getSourceType());
        if (request.getSourceId() != null)
            entry.setSourceId(request.getSourceId());
        if (request.getSourceNumber() != null)
            entry.setSourceNumber(request.getSourceNumber());
        if (request.getDescription() != null)
            entry.setDescription(request.getDescription());
        if (request.getCurrency() != null)
            entry.setCurrency(request.getCurrency());
        if (request.getExchangeRate() != null)
            entry.setExchangeRate(request.getExchangeRate());
        if (request.getStatus() != null)
            entry.setStatus(request.getStatus());
        if (request.getNotes() != null)
            entry.setNotes(request.getNotes());

        // Update totals if provided
        if (request.getTotalDebit() != null && request.getTotalCredit() != null) {
            if (request.getTotalDebit().compareTo(request.getTotalCredit()) != 0) {
                throw new BadRequestException("Total debit must equal total credit");
            }
            entry.setTotalDebit(request.getTotalDebit());
            entry.setTotalCredit(request.getTotalCredit());
        }

        return mapToDto(journalEntryRepository.save(entry));
    }

    @Transactional
    public void deleteJournalEntry(Integer id) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal Entry", "id", id));

        // Cannot delete posted entries
        if ("Posted".equals(entry.getStatus())) {
            throw new BadRequestException("Cannot delete a posted journal entry");
        }

        journalEntryRepository.delete(entry);
    }

    @Transactional
    public JournalEntryDto postJournalEntry(Integer id, Integer userId) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal Entry", "id", id));

        if ("Posted".equals(entry.getStatus())) {
            throw new BadRequestException("Journal entry is already posted");
        }

        entry.setStatus("Posted");
        entry.setPostedByUserId(userId);
        entry.setPostedDate(LocalDateTime.now());

        return mapToDto(journalEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getJournalEntriesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return journalEntryRepository.findByEntryDateBetween(startDate, endDate, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getJournalEntriesByStatus(String status, Pageable pageable) {
        return journalEntryRepository.findByStatus(status, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<JournalEntryDto> getJournalEntriesByFiscalYear(Integer fiscalYearId, Pageable pageable) {
        return journalEntryRepository.findByFiscalYearId(fiscalYearId, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<JournalEntryDto> getJournalEntriesBySource(String sourceType, Integer sourceId) {
        return journalEntryRepository.findBySourceTypeAndSourceId(sourceType, sourceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private JournalEntryDto mapToDto(JournalEntry entry) {
        return JournalEntryDto.builder()
                .journalEntryId(entry.getJournalEntryId())
                .entryNumber(entry.getEntryNumber())
                .entryDate(entry.getEntryDate())
                .fiscalYearId(entry.getFiscalYearId())
                .periodId(entry.getPeriodId())
                .entryType(entry.getEntryType())
                .sourceType(entry.getSourceType())
                .sourceId(entry.getSourceId())
                .sourceNumber(entry.getSourceNumber())
                .description(entry.getDescription())
                .totalDebit(entry.getTotalDebit())
                .totalCredit(entry.getTotalCredit())
                .currency(entry.getCurrency())
                .exchangeRate(entry.getExchangeRate())
                .status(entry.getStatus())
                .postedByUserId(entry.getPostedByUserId())
                .postedDate(entry.getPostedDate())
                .reversedByEntryId(entry.getReversedByEntryId())
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .createdBy(entry.getCreatedBy())
                .updatedAt(entry.getUpdatedAt())
                .updatedBy(entry.getUpdatedBy())
                .build();
    }
}
