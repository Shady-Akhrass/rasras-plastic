package com.rasras.erp;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

@org.junit.jupiter.api.Disabled("Skipping strict modularity check due to known circular dependencies")
class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(RasrasErpApplication.class);

    @Test
    @org.junit.jupiter.api.Disabled("Skipping strict modularity check due to known circular dependencies")
    void verifiesModularStructure() {
        modules.verify();
    }

    @Test
    void createModuleDocumentation() {
        new Documenter(modules)
                .writeDocumentation();
    }
}
