import { useState } from "react";
import { colord } from "colord";

import {
  Tooltip,
  TooltipProps,
  Box,
  Typography,
  Button,
  ButtonProps,
} from "@mui/material";

export interface IRichTooltipProps
  extends Partial<Omit<TooltipProps, "title">> {
  render: (props: {
    openTooltip: () => void;
    closeTooltip: () => void;
    toggleTooltip: () => void;
  }) => TooltipProps["children"];

  icon?: React.ReactNode;
  title: React.ReactNode;
  message?: React.ReactNode;
  dismissButtonText?: React.ReactNode;
  dismissButtonProps?: Partial<ButtonProps>;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onToggle?: (state: boolean) => void;
}

export default function RichTooltip({
  render,
  icon,
  title,
  message,
  dismissButtonText,
  dismissButtonProps,
  defaultOpen,
  onOpen,
  onClose,
  onToggle,
  ...props
}: IRichTooltipProps) {
  const [open, setOpen] = useState(defaultOpen || false);

  const openTooltip = () => {
    setOpen(true);
    if (onOpen) onOpen();
  };
  const closeTooltip = () => {
    setOpen(false);
    if (onClose) onClose();
  };
  const toggleTooltip = () =>
    setOpen((state) => {
      if (onToggle) onToggle(!state);
      return !state;
    });

  return (
    <Tooltip
      disableFocusListener
      disableHoverListener
      disableTouchListener
      arrow
      open={open}
      onClose={closeTooltip}
      sx={{
        "& .MuiTooltip-popper": { zIndex: (theme) => theme.zIndex.drawer - 1 },
        "& .MuiTooltip-tooltip": {
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.background.default
              : colord(theme.palette.background.paper)
                  .mix("#fff", 0.16)
                  .toHslString(),
          boxShadow: 8,

          typography: "body2",
          color: "text.primary",
          padding: 0,
        },

        "& .MuiTooltip-arrow::before": {
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.background.default
              : colord(theme.palette.background.paper)
                  .mix("#fff", 0.16)
                  .toHslString(),
          boxShadow: 8,
        },
      }}
      title={
        <Box
          sx={{
            p: 2,
            cursor: "default",

            display: "grid",
            gridTemplateColumns: "48px auto",
            gap: (theme) => theme.spacing(1, 1.5),
          }}
          onClick={closeTooltip}
        >
          <Box component="span" sx={{ mt: -0.5, fontSize: `${48 / 16}rem` }}>
            {icon}
          </Box>

          <div style={{ alignSelf: "center" }}>
            <Typography variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography>{message}</Typography>
          </div>

          {dismissButtonText ? (
            <Button
              {...dismissButtonProps}
              onClick={closeTooltip}
              style={{
                gridColumn: 2,
                justifySelf: "flex-start",
              }}
            >
              {dismissButtonText}
            </Button>
          ) : (
            <Typography
              variant="caption"
              color="text.disabled"
              style={{
                gridColumn: 2,
                justifySelf: "flex-start",
              }}
            >
              Click to dismiss
            </Typography>
          )}
        </Box>
      }
      PopperProps={{
        modifiers: [
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: false,
              rootBoundary: "document",
              padding: 8,
            },
          },
        ],
      }}
      {...props}
    >
      {render({ openTooltip, closeTooltip, toggleTooltip })}
    </Tooltip>
  );
}
