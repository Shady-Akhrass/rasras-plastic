package com.rasras.erp.accounting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Integer> {

    Optional<JournalEntry> findByEntryNumber(String entryNumber);

    boolean existsByEntryNumber(String entryNumber);

    @Query("SELECT je FROM JournalEntry je WHERE je.entryDate BETWEEN :startDate AND :endDate")
    Page<JournalEntry> findByEntryDateBetween(@Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate, 
                                               Pageable pageable);

    @Query("SELECT je FROM JournalEntry je WHERE je.status = :status")
    Page<JournalEntry> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT je FROM JournalEntry je WHERE je.fiscalYearId = :fiscalYearId")
    Page<JournalEntry> findByFiscalYearId(@Param("fiscalYearId") Integer fiscalYearId, Pageable pageable);

    @Query("SELECT je FROM JournalEntry je WHERE je.sourceType = :sourceType AND je.sourceId = :sourceId")
    List<JournalEntry> findBySourceTypeAndSourceId(@Param("sourceType") String sourceType, 
                                                     @Param("sourceId") Integer sourceId);

    @Query("SELECT je FROM JournalEntry je WHERE je.entryType = :entryType")
    Page<JournalEntry> findByEntryType(@Param("entryType") String entryType, Pageable pageable);
}
