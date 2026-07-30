import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { comparator } from "formula-gear";

import { useSaveResponsesTableColorRules } from "../../../api/responsesApi";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";
import { createEmptyColorRule, getComparatorOptions, isRangeComparator, getRangeValue } from "../utils/colorRules";
import {
    buildValidationErrors,
    comparableFieldTypes,
    normalizeRuleBeforeSave,
    normalizeTargetValue,
    stableRulesValue,
} from "../utils/colorRulesModal.helpers";

const MIN_SCROLL_THUMB_HEIGHT = 36;
const MIN_SCROLL_THUMB_WIDTH = 36;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type UseColorRulesModalParams = {
    open: boolean;
    formId: number;
    fields: FormFieldDto[];
    rules: ResponsesTableColorRuleDto[];
    onClose: () => void;
};

/**
 * Holds all state, derived values, effects and event handlers for the
 * ColorRulesModal.
 */
export const useColorRulesModal = ({ open, formId, fields, rules, onClose }: UseColorRulesModalParams) => {
    const manageableFields = useMemo(
        () => fields.filter((field) => comparableFieldTypes.has(field.fieldType)),
        [fields],
    );

    const [draftRules, setDraftRules] = useState<ResponsesTableColorRuleDto[]>(rules);
    const [touchedTargetValueRuleIds, setTouchedTargetValueRuleIds] = useState<Set<string>>(new Set());
    const [touchedRangeSideKeys, setTouchedRangeSideKeys] = useState<Set<string>>(new Set());
    const [filledRangeSideKeys, setFilledRangeSideKeys] = useState<Set<string>>(new Set());
    const [touchedFieldRuleIds, setTouchedFieldRuleIds] = useState<Set<string>>(new Set());
    const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
    const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLElement | null>(null);
    const [pendingDeleteRuleId, setPendingDeleteRuleId] = useState<string | null>(null);
    const [scrollThumb, setScrollThumb] = useState({ top: 0, height: MIN_SCROLL_THUMB_HEIGHT });
    const [isScrollable, setIsScrollable] = useState(false);
    const [scrollThumbX, setScrollThumbX] = useState({ left: 0, width: MIN_SCROLL_THUMB_WIDTH });
    const [isHorizontallyScrollable, setIsHorizontallyScrollable] = useState(false);

    const rulesTableRef = useRef<HTMLDivElement | null>(null);
    const rulesScrollbarRailRef = useRef<HTMLDivElement | null>(null);
    const rulesScrollbarRailXRef = useRef<HTMLDivElement | null>(null);

    const { mutateAsync, isPending } = useSaveResponsesTableColorRules();

    // Reset all local/draft state whenever the modal is (re)opened.
    useEffect(() => {
        if (!open) return;

        setDraftRules(rules);
        setTouchedTargetValueRuleIds(new Set());
        setTouchedRangeSideKeys(new Set());

        const initialFilled = new Set<string>();
        rules.forEach((rule) => {
            if (isRangeComparator(rule.comparatorId)) {
                const { from, to } = getRangeValue(rule.targetValue);
                if (normalizeTargetValue(from) !== "") initialFilled.add(`${rule.id}|from`);
                if (normalizeTargetValue(to) !== "") initialFilled.add(`${rule.id}|to`);
            }
        });
        setFilledRangeSideKeys(initialFilled);
        setTouchedFieldRuleIds(new Set());
        setDraggedRuleId(null);
        setDeleteAnchorEl(null);
        setPendingDeleteRuleId(null);
    }, [open, rules]);

    // Force a "grabbing" cursor across the whole page while a row is dragged.
    useEffect(() => {
        if (!draggedRuleId) return;

        const previousBodyCursor = document.body.style.cursor;
        const previousBodyUserSelect = document.body.style.userSelect;
        const previousRootCursor = document.documentElement.style.cursor;
        const cursorStyle = document.createElement("style");

        cursorStyle.textContent = `
      body.color-rule-row-dragging,
      body.color-rule-row-dragging * {
        cursor: grabbing !important;
      }
    `;
        document.head.appendChild(cursorStyle);
        document.body.classList.add("color-rule-row-dragging");
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        document.documentElement.style.cursor = "grabbing";

        return () => {
            document.body.classList.remove("color-rule-row-dragging");
            cursorStyle.remove();
            document.body.style.cursor = previousBodyCursor;
            document.body.style.userSelect = previousBodyUserSelect;
            document.documentElement.style.cursor = previousRootCursor;
        };
    }, [draggedRuleId]);

    const updateScrollThumb = () => {
        const table = rulesTableRef.current;
        if (!table) return;

        const { clientHeight, scrollHeight, scrollTop, clientWidth, scrollWidth, scrollLeft } = table;

        if (scrollHeight <= clientHeight) {
            setIsScrollable(false);
            setScrollThumb({ top: 0, height: clientHeight });
        } else {
            setIsScrollable(true);
            const thumbHeight = Math.max(MIN_SCROLL_THUMB_HEIGHT, (clientHeight / scrollHeight) * clientHeight);
            const maxThumbTop = clientHeight - thumbHeight;
            const maxScrollTop = scrollHeight - clientHeight;
            const thumbTop = (scrollTop / maxScrollTop) * maxThumbTop;

            setScrollThumb({ top: thumbTop, height: thumbHeight });
        }

        if (scrollWidth <= clientWidth) {
            setIsHorizontallyScrollable(false);
            setScrollThumbX({ left: 0, width: clientWidth });
            return;
        }

        setIsHorizontallyScrollable(true);
        const thumbWidth = Math.max(MIN_SCROLL_THUMB_WIDTH, (clientWidth / scrollWidth) * clientWidth);
        const maxThumbLeft = clientWidth - thumbWidth;
        const maxScrollLeft = scrollWidth - clientWidth;
        const thumbLeft = (scrollLeft / maxScrollLeft) * maxThumbLeft;

        setScrollThumbX({ left: thumbLeft, width: thumbWidth });
    };

    useEffect(() => {
        updateScrollThumb();

        const table = rulesTableRef.current;
        if (!table) return;

        table.addEventListener("scroll", updateScrollThumb);

        return () => {
            table.removeEventListener("scroll", updateScrollThumb);
        };
    }, [draftRules.length, open]);

    useEffect(() => {
        const table = rulesTableRef.current;
        if (!table || typeof ResizeObserver === "undefined") return;

        const resizeObserver = new ResizeObserver(() => updateScrollThumb());
        resizeObserver.observe(table);

        return () => {
            resizeObserver.disconnect();
        };
    }, [open]);

    const scrollRulesTableToThumbTop = (thumbTop: number) => {
        const table = rulesTableRef.current;
        const rail = rulesScrollbarRailRef.current;
        if (!table || !rail) return;

        const maxThumbTop = rail.clientHeight - scrollThumb.height;
        const maxScrollTop = table.scrollHeight - table.clientHeight;

        if (maxThumbTop <= 0 || maxScrollTop <= 0) return;

        table.scrollTop = (clamp(thumbTop, 0, maxThumbTop) / maxThumbTop) * maxScrollTop;
    };

    const handleRulesScrollbarRailMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;

        const rail = rulesScrollbarRailRef.current;
        if (!rail) return;

        const railRect = rail.getBoundingClientRect();
        const nextThumbTop = event.clientY - railRect.top - scrollThumb.height / 2;

        scrollRulesTableToThumbTop(nextThumbTop);
    };

    const handleRulesScrollbarThumbMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        const table = rulesTableRef.current;
        const rail = rulesScrollbarRailRef.current;
        if (!table || !rail) return;

        const startY = event.clientY;
        const startScrollTop = table.scrollTop;
        const maxThumbTop = rail.clientHeight - scrollThumb.height;
        const maxScrollTop = table.scrollHeight - table.clientHeight;

        if (maxThumbTop <= 0 || maxScrollTop <= 0) return;

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            const scrollDelta = ((moveEvent.clientY - startY) / maxThumbTop) * maxScrollTop;
            table.scrollTop = startScrollTop + scrollDelta;
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const scrollRulesTableToThumbLeft = (thumbLeft: number) => {
        const table = rulesTableRef.current;
        const rail = rulesScrollbarRailXRef.current;
        if (!table || !rail) return;

        const maxThumbLeft = rail.clientWidth - scrollThumbX.width;
        const maxScrollLeft = table.scrollWidth - table.clientWidth;

        if (maxThumbLeft <= 0 || maxScrollLeft <= 0) return;

        table.scrollLeft = (clamp(thumbLeft, 0, maxThumbLeft) / maxThumbLeft) * maxScrollLeft;
    };

    const handleRulesScrollbarRailXMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) return;

        const rail = rulesScrollbarRailXRef.current;
        if (!rail) return;

        const railRect = rail.getBoundingClientRect();
        const nextThumbLeft = event.clientX - railRect.left - scrollThumbX.width / 2;

        scrollRulesTableToThumbLeft(nextThumbLeft);
    };

    const handleRulesScrollbarThumbXMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        const table = rulesTableRef.current;
        const rail = rulesScrollbarRailXRef.current;
        if (!table || !rail) return;

        const startX = event.clientX;
        const startScrollLeft = table.scrollLeft;
        const maxThumbLeft = rail.clientWidth - scrollThumbX.width;
        const maxScrollLeft = table.scrollWidth - table.clientWidth;

        if (maxThumbLeft <= 0 || maxScrollLeft <= 0) return;

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            const scrollDelta = ((moveEvent.clientX - startX) / maxThumbLeft) * maxScrollLeft;
            table.scrollLeft = startScrollLeft + scrollDelta;
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const hasChanges = stableRulesValue(draftRules) !== stableRulesValue(rules);

    const validationErrors = useMemo(() => buildValidationErrors(draftRules), [draftRules]);

    const hasErrors = Object.keys(validationErrors).length > 0;

    const updateRule = (ruleId: string, patch: Partial<ResponsesTableColorRuleDto>) => {
        setDraftRules((prev) =>
            prev.map((rule) => {
                if (rule.id !== ruleId) return rule;
                return { ...rule, ...patch };
            }),
        );
    };

    const markTargetValueTouched = (ruleId: string) => {
        setTouchedTargetValueRuleIds((prev) => {
            if (prev.has(ruleId)) return prev;
            const next = new Set(prev);
            next.add(ruleId);
            return next;
        });
    };

    const markRangeSideTouched = (ruleId: string, side: "from" | "to") => {
        const key = `${ruleId}|${side}`;
        setTouchedRangeSideKeys((prev) => {
            if (prev.has(key)) return prev;
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    };

    const markRangeSideFilled = (ruleId: string, side: "from" | "to") => {
        const key = `${ruleId}|${side}`;
        setFilledRangeSideKeys((prev) => {
            if (prev.has(key)) return prev;
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    };

    const markFieldTouched = (ruleId: string) => {
        setTouchedFieldRuleIds((prev) => {
            if (prev.has(ruleId)) return prev;
            const next = new Set(prev);
            next.add(ruleId);
            return next;
        });
    };

    const resetTargetValueTouched = (ruleId: string) => {
        setTouchedTargetValueRuleIds((prev) => {
            if (!prev.has(ruleId)) return prev;
            const next = new Set(prev);
            next.delete(ruleId);
            return next;
        });
    };

    const updateRuleTargetValue = (ruleId: string, targetValue: ResponsesTableColorRuleDto["targetValue"]) => {
        markTargetValueTouched(ruleId);
        updateRule(ruleId, { targetValue });
    };

    const trimRuleTargetValue = (rule: ResponsesTableColorRuleDto) => {
        markTargetValueTouched(rule.id);
        updateRule(rule.id, { targetValue: normalizeTargetValue(rule.targetValue) });
    };

    const handleFieldChange = (rule: ResponsesTableColorRuleDto, fieldId: string) => {
        const selectedField = manageableFields.find((field) => field.id === fieldId);
        if (!selectedField) return;

        markFieldTouched(rule.id);

        const nextComparator = getComparatorOptions(selectedField.fieldType)[0]?.value ?? comparator.Equals;

        updateRule(rule.id, {
            fieldId,
            fieldType: selectedField.fieldType,
            comparatorId: nextComparator,
            targetValue: "",
        });
        resetTargetValueTouched(rule.id);
    };

    const handleComparatorChange = (rule: ResponsesTableColorRuleDto, comparatorId: number) => {
        const comparatorRequiresValue = !!getComparatorOptions(rule.fieldType).find(
            (option) => option.value === comparatorId,
        )?.requiresValue;

        const nextTargetValue = !comparatorRequiresValue
            ? null
            : isRangeComparator(comparatorId)
                ? { from: "", to: "" }
                : "";

        updateRule(rule.id, {
            comparatorId,
            targetValue: nextTargetValue,
        });
        resetTargetValueTouched(rule.id);
    };

    const handleAddRule = () => {
        const defaultField = manageableFields.length === 1 ? manageableFields[0] : undefined;
        setDraftRules((prev) => [...prev, { ...createEmptyColorRule(defaultField), order: prev.length }]);
    };

    const handleDeleteRule = (ruleId: string) => {
        setDraftRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    };

    const moveRuleBefore = (activeRuleId: string, overRuleId: string) => {
        setDraftRules((prev) => {
            const activeIndex = prev.findIndex((rule) => rule.id === activeRuleId);
            const overIndex = prev.findIndex((rule) => rule.id === overRuleId);

            if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return prev;

            const next = [...prev];
            const [movedRule] = next.splice(activeIndex, 1);
            next.splice(overIndex, 0, movedRule);

            return next.map((rule, index) => ({ ...rule, order: index }));
        });
    };

    const handleRuleDragMouseDown = (event: MouseEvent<HTMLDivElement>, ruleId: string, canManage: boolean) => {
        if (!canManage) return;

        event.preventDefault();
        setDraggedRuleId(ruleId);

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            const rowElement = document
                .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
                ?.closest<HTMLElement>("[data-color-rule-id]");
            const overRuleId = rowElement?.dataset.colorRuleId;

            if (!overRuleId || overRuleId === ruleId) return;

            moveRuleBefore(ruleId, overRuleId);
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            setDraggedRuleId(null);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const requestClose = () => {
        onClose();
    };

    const handleDialogClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick") return;
        requestClose();
    };

    const openDeletePopover = (event: MouseEvent<HTMLElement>, ruleId: string) => {
        setDeleteAnchorEl(event.currentTarget);
        setPendingDeleteRuleId(ruleId);
    };

    const closeDeletePopover = () => {
        setDeleteAnchorEl(null);
        setPendingDeleteRuleId(null);
    };

    const confirmDeleteRule = () => {
        if (pendingDeleteRuleId) {
            handleDeleteRule(pendingDeleteRuleId);
        }
        closeDeletePopover();
    };

    const handleSave = async () => {
        if (hasErrors) return;

        try {
            const normalizedRules = draftRules.map(normalizeRuleBeforeSave);
            await mutateAsync({
                formId,
                previousRules: rules,
                nextRules: normalizedRules.map((rule, index) => ({ ...rule, order: index })),
            });
            showSuccessNotification("התגובה עודכנה: הטבלה נצבעה לפי החוקים שנקבעו", {
                duration: 5000,
                style: {
                    minWidth: "380px",
                    whiteSpace: "nowrap",
                },
            });
            onClose();
        } catch (error) {
            console.error("Failed to save color rules", error);
            showErrorNotification("שמירת חוקי הצבע נכשלה");
        }
    };

    return {
        manageableFields,
        draftRules,
        touchedTargetValueRuleIds,
        touchedRangeSideKeys,
        filledRangeSideKeys,
        touchedFieldRuleIds,
        draggedRuleId,
        deleteAnchorEl,
        pendingDeleteRuleId,
        scrollThumb,
        isScrollable,
        scrollThumbX,
        isHorizontallyScrollable,
        rulesTableRef,
        rulesScrollbarRailRef,
        rulesScrollbarRailXRef,
        isPending,
        hasChanges,
        validationErrors,
        hasErrors,
        updateRule,
        markTargetValueTouched,
        markRangeSideTouched,
        markRangeSideFilled,
        markFieldTouched,
        updateRuleTargetValue,
        trimRuleTargetValue,
        handleFieldChange,
        handleComparatorChange,
        handleAddRule,
        handleDeleteRule,
        handleRuleDragMouseDown,
        requestClose,
        handleDialogClose,
        openDeletePopover,
        closeDeletePopover,
        confirmDeleteRule,
        handleSave,
        handleRulesScrollbarRailMouseDown,
        handleRulesScrollbarThumbMouseDown,
        handleRulesScrollbarRailXMouseDown,
        handleRulesScrollbarThumbXMouseDown,
    };
};
