package com.rasras.erp.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PermissionDependencyServiceTest {

    @Mock
    private PermissionDependencyRepository dependencyRepository;

    private PermissionDependencyService service;

    @BeforeEach
    void setUp() {
        service = new PermissionDependencyService(dependencyRepository);
    }

    @Nested
    @DisplayName("computeEffectivePermissionIds")
    class ComputeEffective {

        @Test
        @DisplayName("returns empty when selection is empty")
        void emptySelection_returnsEmpty() {
            Set<Integer> effective = service.computeEffectivePermissionIds(List.of());
            assertThat(effective).isEmpty();
        }

        @Test
        @DisplayName("returns selection when no dependencies")
        void noDependencies_returnsSelectionOnly() {
            when(dependencyRepository.findAll()).thenReturn(List.of());
            Set<Integer> effective = service.computeEffectivePermissionIds(List.of(10, 20));
            assertThat(effective).containsExactlyInAnyOrder(10, 20);
        }

        @Test
        @DisplayName("adds direct required permission (transitive closure)")
        void addsDirectAndTransitiveRequired() {
            Permission p1 = permission(1, "MENU_OPERATIONS_ITEMS");
            Permission p2 = permission(2, "SECTION_OPERATIONS");
            Permission p3 = permission(3, "SECTION_WAREHOUSE");
            when(dependencyRepository.findAll()).thenReturn(List.of(
                    dependency(p1, p2),
                    dependency(p1, p3),
                    dependency(p2, p3)
            ));
            Set<Integer> effective = service.computeEffectivePermissionIds(List.of(1));
            assertThat(effective).containsExactlyInAnyOrder(1, 2, 3);
        }

        @Test
        @DisplayName("multiple selected: union of all closures")
        void multipleSelected_unionOfClosures() {
            Permission p1 = permission(1, "MENU_A");
            Permission p2 = permission(2, "MENU_B");
            Permission p3 = permission(3, "SECTION_X");
            when(dependencyRepository.findAll()).thenReturn(List.of(
                    dependency(p1, p3),
                    dependency(p2, p3)
            ));
            Set<Integer> effective = service.computeEffectivePermissionIds(List.of(1, 2));
            assertThat(effective).containsExactlyInAnyOrder(1, 2, 3);
        }

        @Test
        @DisplayName("safe removal: when selection is reduced, effective is reduced")
        void reducedSelection_reducedEffective() {
            Permission p1 = permission(1, "MENU_OPERATIONS_ITEMS");
            Permission p2 = permission(2, "SECTION_WAREHOUSE");
            when(dependencyRepository.findAll()).thenReturn(List.of(dependency(p1, p2)));
            Set<Integer> withMenu = service.computeEffectivePermissionIds(List.of(1));
            assertThat(withMenu).containsExactlyInAnyOrder(1, 2);
            Set<Integer> withoutMenu = service.computeEffectivePermissionIds(List.of());
            assertThat(withoutMenu).isEmpty();
            Set<Integer> onlySection = service.computeEffectivePermissionIds(List.of(2));
            assertThat(onlySection).containsExactlyInAnyOrder(2);
        }

        @Test
        @DisplayName("circular dependency: bounded iteration does not hang")
        void circularDependency_boundedIteration() {
            Permission p1 = permission(1, "A");
            Permission p2 = permission(2, "B");
            when(dependencyRepository.findAll()).thenReturn(List.of(
                    dependency(p1, p2),
                    dependency(p2, p1)
            ));
            Set<Integer> effective = service.computeEffectivePermissionIds(List.of(1));
            assertThat(effective).containsExactlyInAnyOrder(1, 2);
        }
    }

    private static Permission permission(int id, String code) {
        Permission p = new Permission();
        p.setPermissionId(id);
        p.setPermissionCode(code);
        return p;
    }

    private static PermissionDependency dependency(Permission from, Permission to) {
        PermissionDependency d = new PermissionDependency();
        d.setPermission(from);
        d.setRequiresPermission(to);
        return d;
    }
}
