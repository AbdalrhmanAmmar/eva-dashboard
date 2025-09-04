import { useEffect, useState } from "react";
import { getWorkItems, IWorkItem } from "../../api/offerAPI";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";

function GetAllWorkItem() {
  const [workItems, setWorkItems] = useState<IWorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IWorkItem | null>(null);

  useEffect(() => {
    const fetchWorkItems = async () => {
      try {
        const items = await getWorkItems();
        setWorkItems(items);
        if (items.length > 0) {
          setSelectedItem(items[0]);
        }
      } catch (error: any) {
        console.error('Failed to fetch work items:', error);
        setError(error.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkItems();
  }, []);

  const handleSelect = (item: IWorkItem) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-primary">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        <AlertCircle className="w-5 h-5 ml-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Select Box مع تصميم مخصص */}
      <div 
        className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition-colors shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedItem ? "text-gray-800" : "text-gray-500"}>
          {selectedItem ? selectedItem.name : "اختر عنصر من القائمة"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {workItems.map(item => (
            <div
              key={item._id}
              className={`p-3 cursor-pointer transition-colors ${
                selectedItem?._id === item._id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      {/* Input مخفي لحفظ القيمة المحددة */}
      <input 
        type="hidden" 
        name="workItem" 
        value={selectedItem?._id || ''} 
      />
    </div>
  );
}

export default GetAllWorkItem;