export interface GenericFieldsProps {
  label: string;
  disabled?: boolean;
  required: boolean;
  value?: any;
  onChange: (value: any) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: boolean;
  helperText?: string | false;
  key?: string;
  type?: string;
}