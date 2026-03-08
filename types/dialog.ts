export interface DialogSection {
  heading: string;
  steps: readonly string[];
}

export interface DialogContent {
  kicker: string;
  title: string;
  intro: string;
  actionLabel: string;
  steps: readonly string[];
  sections?: readonly DialogSection[];
}

export interface InfoDialogProps extends DialogContent {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
}
