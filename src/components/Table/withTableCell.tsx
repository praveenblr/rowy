import { memo, Suspense, useState, useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { get, isEqual } from "lodash-es";
import type { TableCellProps } from "@src/components/Table";
import {
  IDisplayCellProps,
  IEditorCellProps,
} from "@src/components/fields/types";

import { Popover, PopoverProps } from "@mui/material";

import { tableScope, updateFieldAtom } from "@src/atoms/tableScope";

export interface ICellOptions {
  /** If the rest of the row’s data is used, set this to true for memoization */
  usesRowData?: boolean;
  /** Handle padding inside the cell component */
  disablePadding?: boolean;
  /** Set popover background to be transparent */
  transparent?: boolean;
  /** Props to pass to MUI Popover component */
  popoverProps?: Partial<PopoverProps>;
}

/**
 * HOC to render table cells.
 * Renders read-only DisplayCell while scrolling for scroll performance.
 * Defers render for inline EditorCell.
 * @param DisplayCellComponent - The lighter cell component to display values
 * @param EditorCellComponent - The heavier cell component to edit inline
 * @param editorMode - When to display the EditorCell
 *   - "focus" (default) - when the cell is focused (Enter or double-click)
 *   - "inline" - inline with deferred render
 *   - "popover" - as a popover
 * @param options - {@link ICellOptions}
 */
export default function withTableCell(
  DisplayCellComponent: React.ComponentType<IDisplayCellProps>,
  EditorCellComponent: React.ComponentType<IEditorCellProps>,
  editorMode: "focus" | "inline" | "popover" = "focus",
  options: ICellOptions = {}
) {
  return memo(
    function TableCell({
      row,
      column,
      getValue,
      focusInsideCell,
      setFocusInsideCell,
      disabled,
    }: TableCellProps) {
      const value = getValue();
      const updateField = useSetAtom(updateFieldAtom, tableScope);

      // Store ref to rendered DisplayCell to get positioning for PopoverCell
      const displayCellRef = useRef<HTMLDivElement>(null);
      const parentRef = displayCellRef.current?.parentElement;

      // Store Popover open state here so we can add delay for close transition
      const [popoverOpen, setPopoverOpen] = useState(false);
      useEffect(() => {
        if (focusInsideCell) setPopoverOpen(true);
      }, [focusInsideCell]);
      const showPopoverCell = (popover: boolean) => {
        if (popover) {
          setPopoverOpen(true);
          // Need to call this after a timeout, since the cell’s `onClick`
          // event is fired, which sets focusInsideCell false
          setTimeout(() => setFocusInsideCell(true));
        } else {
          setPopoverOpen(false);
          // Call after a timeout to allow the close transition to finish
          setTimeout(() => {
            setFocusInsideCell(false);
            // Focus the cell. Otherwise, it focuses the body.
            parentRef?.focus();
          }, 300);
        }
      };

      // Declare basicCell here so props can be reused by HeavyCellComponent
      const basicCellProps: IDisplayCellProps = {
        value,
        name: column.columnDef.meta!.name,
        type: column.columnDef.meta!.type,
        row: row.original,
        column: column.columnDef.meta!,
        docRef: row.original._rowy_ref,
        disabled: column.columnDef.meta!.editable === false,
        showPopoverCell,
        setFocusInsideCell,
      };

      // Show display cell, unless if editorMode is inline
      const displayCell = (
        <div
          className="cell-contents"
          style={options.disablePadding ? { padding: 0 } : undefined}
          ref={displayCellRef}
        >
          <DisplayCellComponent {...basicCellProps} />
        </div>
      );
      if (disabled || (editorMode !== "inline" && !focusInsideCell))
        return displayCell;

      // This is where we update the documents
      const handleSubmit = (value: any) => {
        if (disabled) return;
        updateField({
          path: row.original._rowy_ref.path,
          fieldName: column.id,
          value,
          deleteField: value === undefined,
        });
      };

      const editorCell = (
        <EditorCellComponent
          {...basicCellProps}
          tabIndex={focusInsideCell ? 0 : -1}
          onSubmit={handleSubmit}
          parentRef={parentRef}
        />
      );

      if (editorMode === "focus" && focusInsideCell) {
        return editorCell;
      }

      if (editorMode === "inline") {
        return (
          <div
            className="cell-contents"
            style={options.disablePadding ? { padding: 0 } : undefined}
            ref={displayCellRef}
          >
            {editorCell}
          </div>
        );
      }

      if (editorMode === "popover")
        return (
          <>
            {displayCell}

            <Suspense fallback={null}>
              <Popover
                open={popoverOpen}
                anchorEl={parentRef}
                onClose={() => showPopoverCell(false)}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                {...options.popoverProps}
                sx={
                  options.transparent
                    ? {
                        "& .MuiPopover-paper": {
                          backgroundColor: "transparent",
                        },
                      }
                    : {}
                }
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.stopPropagation()}
              >
                {editorCell}
              </Popover>
            </Suspense>
          </>
        );

      // Should not reach this line
      return null;
    },
    (prev, next) => {
      const valueEqual = isEqual(
        get(prev.row.original, prev.column.columnDef.meta!.fieldName),
        get(next.row.original, next.column.columnDef.meta!.fieldName)
      );
      const columnEqual = isEqual(
        prev.column.columnDef.meta,
        next.column.columnDef.meta
      );
      const rowEqual = isEqual(prev.row.original, next.row.original);
      const focusInsideCellEqual =
        prev.focusInsideCell === next.focusInsideCell;
      const disabledEqual = prev.disabled === next.disabled;

      const baseEqualities =
        valueEqual && columnEqual && focusInsideCellEqual && disabledEqual;

      if (options?.usesRowData) return baseEqualities && rowEqual;
      else return baseEqualities;
    }
  );
}
