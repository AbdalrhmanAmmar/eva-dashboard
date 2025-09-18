import * as React from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../utils/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, placeholder = "اختر التاريخ", disabled, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)

    React.useEffect(() => {
      setSelectedDate(value)
    }, [value])

    const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date)
      onChange?.(date)
      setIsOpen(false)
    }

    return (
      <div className="relative">
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md",
            !selectedDate && "text-muted-foreground",
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex-1 text-right">
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: ar })
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </span>
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
          </div>
        </Button>
        
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Calendar Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <div className="bg-white rounded-xl border border-blue-200 shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-center">اختيار التاريخ</h3>
                </div>
                
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={ar}
                  className="rounded-md border-0"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium text-gray-900",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-100 rounded-md transition-colors"
                    ),
                    nav_button_previous: "absolute right-1",
                    nav_button_next: "absolute left-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                      "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                    ),
                    day: cn(
                      "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 hover:text-blue-900 rounded-md transition-colors"
                    ),
                    day_range_end: "day-range-end",
                    day_selected: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white shadow-md",
                    day_today: "bg-blue-50 text-blue-900 font-semibold border border-blue-200",
                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                  }}
                />
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300"
                  >
                    إلغاء
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateSelect(new Date())}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                  >
                    اليوم
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"

export { DatePicker }