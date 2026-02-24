package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Resolves permission dependencies so that when an admin assigns MENU_* (or other)
 * permissions to a role, the required API permissions (SECTION_*, etc.) are
 * auto-granted — preventing 403 on pages that appear in the menu.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionDependencyService {

    private static final int MAX_CLOSURE_ITERATIONS = 100;

    private final PermissionDependencyRepository dependencyRepository;

    /**
     * Computes the transitive closure: selected permissions + all permissions
     * they require (and those requirements' requirements, etc.).
     * Used when assigning permissions to a role so API access matches menu access.
     *
     * @param selectedPermissionIds admin-selected permission IDs (e.g. from UI)
     * @return set of permission IDs to actually persist (selected + dependencies, no duplicates)
     */
    @Transactional(readOnly = true)
    public Set<Integer> computeEffectivePermissionIds(List<Integer> selectedPermissionIds) {
        if (selectedPermissionIds == null || selectedPermissionIds.isEmpty()) {
            return Set.of();
        }
        Set<Integer> selected = new HashSet<>(selectedPermissionIds);
        Map<Integer, Set<Integer>> graph = buildDependencyGraph();
        Set<Integer> effective = new HashSet<>(selected);
        int iterations = 0;
        while (iterations < MAX_CLOSURE_ITERATIONS) {
            int before = effective.size();
            Set<Integer> toAdd = new HashSet<>();
            for (Integer pid : effective) {
                Set<Integer> required = graph.get(pid);
                if (required != null) {
                    toAdd.addAll(required);
                }
            }
            effective.addAll(toAdd);
            if (effective.size() == before) {
                break;
            }
            iterations++;
        }
        if (iterations >= MAX_CLOSURE_ITERATIONS) {
            log.warn("Permission dependency closure reached max iterations ({}); possible circular dependency", MAX_CLOSURE_ITERATIONS);
        }
        return effective;
    }

    /**
     * Builds a map: permissionId -> set of required permission IDs (direct only).
     */
    private Map<Integer, Set<Integer>> buildDependencyGraph() {
        List<PermissionDependency> all = dependencyRepository.findAll();
        Map<Integer, Set<Integer>> graph = new HashMap<>();
        for (PermissionDependency d : all) {
            Integer from = d.getPermission().getPermissionId();
            Integer to = d.getRequiresPermission().getPermissionId();
            graph.computeIfAbsent(from, k -> new HashSet<>()).add(to);
        }
        return graph;
    }

    /**
     * Returns all permission IDs that the given permission (by ID) directly or
     * transitively requires. Used for debugging and tests.
     */
    @Transactional(readOnly = true)
    public Set<Integer> getTransitiveRequiredIds(Integer permissionId) {
        return computeEffectivePermissionIds(List.of(permissionId));
    }

    /**
     * Validates that the dependency graph has no cycle involving the given permission.
     * Optional guard when adding new dependency rows (e.g. from an admin UI).
     */
    public boolean hasCycle(Integer permissionId) {
        Map<Integer, Set<Integer>> graph = buildDependencyGraph();
        Set<Integer> visited = new HashSet<>();
        Set<Integer> stack = new HashSet<>();
        return hasCycleDfs(permissionId, graph, visited, stack);
    }

    private boolean hasCycleDfs(Integer node, Map<Integer, Set<Integer>> graph,
                                  Set<Integer> visited, Set<Integer> stack) {
        visited.add(node);
        stack.add(node);
        Set<Integer> deps = graph.get(node);
        if (deps != null) {
            for (Integer dep : deps) {
                if (!visited.contains(dep)) {
                    if (hasCycleDfs(dep, graph, visited, stack)) return true;
                } else if (stack.contains(dep)) {
                    return true;
                }
            }
        }
        stack.remove(node);
        return false;
    }
}
