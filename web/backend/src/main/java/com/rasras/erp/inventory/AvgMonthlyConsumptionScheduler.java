package com.rasras.erp.inventory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * مهمة مجدولة لتحديث حقل متوسط الاستهلاك الشهري لجميع الأصناف من حركات الصرف (OUT).
 * تُشغّل في أول يوم من كل شهر عند منتصف الليل.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AvgMonthlyConsumptionScheduler {

    private static final int MONTHS_FOR_AVG = 3;

    private final ItemRepository itemRepository;
    private final StockMovementService stockMovementService;

    @Scheduled(cron = "${app.scheduler.avg-consumption.cron:0 0 0 1 * *}")
    @Transactional
    public void updateAvgMonthlyConsumptionForAllItems() {
        log.info("بدء مهمة تحديث متوسط الاستهلاك الشهري لجميع الأصناف");
        List<Item> items = itemRepository.findAll();
        int updated = 0;
        for (Item item : items) {
            try {
                BigDecimal avg = stockMovementService.getAverageMonthlyConsumption(item.getId(), MONTHS_FOR_AVG);
                item.setAvgMonthlyConsumption(avg);
                itemRepository.save(item);
                updated++;
            } catch (Exception e) {
                log.warn("فشل تحديث متوسط الاستهلاك للصنف id={} ({})", item.getId(), item.getItemCode(), e);
            }
        }
        log.info("انتهت مهمة تحديث متوسط الاستهلاك الشهري: تم تحديث {} من {} صنف", updated, items.size());
    }
}
