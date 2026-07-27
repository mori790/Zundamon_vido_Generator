type Props = {
  value: string;
  onChange(text: string): void;
  disabled: boolean;
};

export function TextInputArea({value, onChange, disabled}: Props): JSX.Element {
  return (
    <textarea
      data-testid="text-input-area"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="動画の草案テキストを貼り付けてください"
      style={{minHeight: '200px', width: '100%', resize: 'vertical'}}
      value={value}
    />
  );
}
