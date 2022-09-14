type InputProps = {
  value: string | number | undefined | null;
  onChange: (value: string | number | undefined) => void;
};

export default function Input({ value, onChange }: InputProps) {
  return (
    <input
      value={value ?? undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
