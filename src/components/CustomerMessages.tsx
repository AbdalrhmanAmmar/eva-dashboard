import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Phone, User } from 'lucide-react';
import { useMessages } from '../context/messages.context';
import { getContactForm, IContactForm, IContactFormResponse } from '../api/contactForm';
import { formatArabicDate } from '../utils/formatDate';

const CustomerMessages: React.FC = () => {
  const { updateMessagesCount, messagesCount } = useMessages();

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<IContactForm[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContactForm() as IContactFormResponse;
      console.log(`forms`, response.forms.length)
      setMessages(response.forms);
      updateMessagesCount(response.forms.length)
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError("تعذر جلب رسائل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('messagesCount', messagesCount)
    fetchMessages();

  };

  const filteredMessages = messages.filter((message) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.Fullname.toLowerCase().includes(searchLower) ||
      message.PhoneNumber.includes(searchTerm) ||
      message.Details.toLowerCase().includes(searchLower) ||
      (message.OrderForm?.toString() || '').includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">رسائل العملاء</h1>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث في الرسائل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التفاصيل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الطلب</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="animate-spin h-5 w-5 text-blue-500" />
                    <span className="mr-2">جاري التحميل...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  لا توجد رسائل لعرضها
                </td>
              </tr>
            ) : (
              filteredMessages.map((message, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{message.Fullname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 ml-1" />
                      {message.PhoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{message.Details}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.OrderForm ? `ORD-${message.OrderForm}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatArabicDate(message.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination would go here */}
    </div>
  );
};

export default CustomerMessages;