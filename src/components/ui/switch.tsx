interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = ({ checked, onChange, onCheckedChange }: SwitchProps) => {
  const handleChange = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    } else if (onChange) {
      onChange(!checked);
    } else {
      console.warn("Switch component needs either onChange or onCheckedChange prop.");
    }
  };

  return (
    <button
      type="button"
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        checked 
          ? 'bg-primary shadow-primary/30' 
          : 'bg-gray-300 dark:bg-gray-600 shadow-gray-400/20'
      } shadow-md`}
      onClick={handleChange}
      aria-pressed={checked}
    >
      <span className="sr-only">تبديل</span>
      
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
          checked 
            ? 'translate-x-7 rtl:translate-x-[-1.75rem]' 
            : 'translate-x-1 rtl:translate-x-[-0.25rem]'
        }`}
      >
        {checked ? (
          <span className="absolute inset-0 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
};
