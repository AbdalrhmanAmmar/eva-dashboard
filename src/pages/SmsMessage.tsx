import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smartphone, 
  Hash, 
  Clock, 
  Copy, 
  RefreshCw,
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getSmsTemplate, updateSmsTemplate } from '../api/smsApi';

const SmsMessages: React.FC = () => {
  const [template, setTemplate] = useState('رمز التحقق الخاص بك هو: {code}');
  const [randomNumber, setRandomNumber] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messageLength, setMessageLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // تحميل القالب من الخادم عند التحميل
  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        const response = await getSmsTemplate();
        setTemplate(response.template.otpMessage);
        generateRandomNumber();
      } catch (error) {
        toast.error('فشل في تحميل قالب الرسالة');
        console.error('Error loading template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // توليد رقم عشوائي جديد
  const generateRandomNumber = () => {
    const number = Math.floor(100000 + Math.random() * 900000).toString();
    setRandomNumber(number);
    return number;
  };

  // تحديث الرسالة المعاينة
  useEffect(() => {
    const fullMessage = template.replace('{code}', randomNumber || '123456');
    setPreviewMessage(fullMessage);
    setMessageLength(fullMessage.length);
  }, [template, randomNumber]);

  // نسخ الرسالة
  const copyMessage = () => {
    navigator.clipboard.writeText(previewMessage);
    toast.success('تم نسخ الرسالة');
  };

  // حفظ القالب على الخادم
  const saveTemplate = async () => {
    if (!template) {
      toast.error('الرجاء إدخال نص الرسالة');
      return;
    }

    setIsSaving(true);
    try {
      await updateSmsTemplate({ otpMessage: template });
      toast.success('تم حفظ القالب بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ القالب');
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // إحصائيات وهمية للواجهة
  const stats = {
    totalSent: 1247,
    delivered: 1198,
    pending: 32,
    failed: 17,
    deliveryRate: 96.1
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة رسائل التحقق</h1>
          <p className="text-muted-foreground mt-2">تعديل وإدارة قالب رسائل التحقق عبر SMS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Editor */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              تعديل قالب الرسالة
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={saveTemplate}
                disabled={isSaving}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="حفظ القالب"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                نص الرسالة (استخدم <code className="bg-secondary px-1 rounded">{'{code}'}</code> لرمز التحقق)
              </label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="اكتب نص الرسالة هنا..."
                className="w-full h-32 px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 resize-none"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>عدد الأحرف: {messageLength}/160</span>
                <span className={messageLength > 160 ? 'text-red-500' : 'text-green-500'}>
                  {messageLength <= 160 ? '✓ رسالة واحدة' : '⚠️ رسائل متعددة'}
                </span>
              </div>
            </div>

            {/* Random Number Section */}
            <div>
              <label className="block text-sm font-medium mb-2">معاينة رمز التحقق</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg border border-primary/20">
                  <Hash className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg font-bold text-primary">
                    {randomNumber || '123456'}
                  </span>
                </div>
                <button
                  onClick={generateRandomNumber}
                  className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  title="توليد رقم جديد"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={copyMessage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                <Copy className="w-4 h-4" />
                نسخ الرسالة
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                disabled
                title="سيتم تفعيل هذه الميزة لاحقاً"
              >
                <Send className="w-4 h-4" />
                إرسال تجريبي
              </button>
            </div>
          </div>
        </div>

        {/* Phone Preview */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-primary" />
              معاينة الرسالة
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString('ar-SA')}</span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="mx-auto max-w-sm">
            <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="bg-black rounded-[2rem] p-1">
                <div className="bg-white rounded-[1.5rem] overflow-hidden">
                  {/* Phone Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">رسائل التحقق</p>
                          <p className="text-xs text-gray-500">SMS</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentTime.toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="p-4 min-h-[300px] bg-gray-50">
                    <div className="bg-white rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-[85%] mr-auto">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {previewMessage || 'سيظهر نص الرسالة هنا بعد التعديل...'}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {currentTime.toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Footer */}
                  <div className="bg-white border-t p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">حالة الاتصال بالخادم</span>
              <span className="text-sm text-green-500 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                متصل
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">آخر تحديث</span>
              <span className="text-sm text-primary">
                {new Date().toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsMessages;