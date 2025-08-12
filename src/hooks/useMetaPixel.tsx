import { useState, useEffect, useCallback } from 'react';
import { 
  getPixelData, 
  trackPageView, 
  trackClick, 
  trackConversion, 
  trackFormSubmit,
  loadStoredData,
  MetaPixelData 
} from '../utils/metaPixel';

export const useMetaPixel = () => {
  const [pixelData, setPixelData] = useState<MetaPixelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // تحديث البيانات مع تحسينات الأداء
  const refreshData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // تحميل البيانات المحفوظة
      loadStoredData();
      
      // الحصول على البيانات الحالية
      const data = getPixelData();
      
      // التحقق مما إذا كانت البيانات قد تغيرت بالفعل
      if (!force && lastUpdated === data.lastUpdated) {
        return;
      }
      
      setPixelData(data);
      setLastUpdated(data.lastUpdated);
      
      // طباعة البيانات للتحقق
      console.log('Refreshed Pixel Data:', data);
      
    } catch (err) {
      setError('فشل في تحميل بيانات Meta Pixel');
      console.error('Meta Pixel Error:', err);
    } finally {
      setLoading(false);
    }
  }, [lastUpdated]);

  // تحميل البيانات عند التهيئة
  useEffect(() => {
    refreshData();
    
    // إضافة مستمع لأحداث Pixel الفعلية
    if (typeof window !== 'undefined' && window.fbq) {
      const originalFbq = window.fbq;
      
      window.fbq = function() {
        originalFbq.apply(this, arguments);
        if (arguments[0] === 'track') {
          console.log('FB Pixel Event Detected:', arguments);
          refreshData(true); // تحديث قسري للبيانات
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq = window._fbq;
      }
    };
  }, [refreshData]);

  // تتبع مشاهدة الصفحة الحالية
  useEffect(() => {
    const currentPage = window.location.pathname;
    trackPageView(currentPage);
  }, []);

  // دوال التتبع المحسنة
  const trackPageViewEvent = useCallback((pageName?: string) => {
    trackPageView(pageName);
    refreshData(true);
  }, [refreshData]);

  const trackClickEvent = useCallback((elementName: string, value?: number) => {
    trackClick(elementName, value);
    refreshData(true);
  }, [refreshData]);

  const trackConversionEvent = useCallback((value?: number, currency?: string, products?: any[]) => {
    trackConversion(value, currency, products);
    refreshData(true);
  }, [refreshData]);

  const trackFormSubmitEvent = useCallback((formName: string, formData?: any) => {
    trackFormSubmit(formName, formData);
    refreshData(true);
  }, [refreshData]);

  return {
    pixelData,
    loading,
    error,
    lastUpdated,
    refreshData: () => refreshData(true),
    trackPageView: trackPageViewEvent,
    trackClick: trackClickEvent,
    trackConversion: trackConversionEvent,
    trackFormSubmit: trackFormSubmitEvent,
    // دوال إضافية للتحليل
    getDeviceData: () => pixelData?.deviceBreakdown || {},
    getPagePerformance: () => pixelData?.pagePerformance || {},
    getRevenueSources: () => pixelData?.revenueSources || {}
  };
};