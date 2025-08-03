interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id: string;
}

export default function TimePicker({ value, onChange, label, id }: TimePickerProps) {
  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
      />
    </div>
  );
}