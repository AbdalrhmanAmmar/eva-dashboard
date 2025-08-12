// Meta Pixel Integration Utilities
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface MetaPixelEvent {
  event: string;
  timestamp: number;
  value?: number;
  currency?: string;
  content_type?: string;
  content_ids?: string[];
  content_name?: string;
  event_id?: string;
  event_source_url?: string;
}

export interface MetaPixelData {
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  avgSessionDuration: string;
  events: MetaPixelEvent[];
  lastUpdated: string;
}

// تخزين البيانات محلياً
let pixelData: MetaPixelData = {
  pageViews: 0,
  uniqueVisitors: 0,
  clicks: 0,
  conversions: 0,
  revenue: 0,
  ctr: 0,
  conversionRate: 0,
  avgSessionDuration: '0:00',
  events: [],
  lastUpdated: new Date().toISOString()
};

// تتبع الزوار الفريدين
const uniqueVisitors = new Set<string>();

// إنشاء معرف فريد للزائر
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// تسجيل حدث جديد مع تفاصيل إضافية
export const trackEvent = (eventName: string, parameters: any = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // إضافة معلومات إضافية للحدث
    const enhancedParams = {
      ...parameters,
      event_id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      event_source_url: window.location.href,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    };
    
    window.fbq('track', eventName, enhancedParams);
    
    // حفظ الحدث محلياً
    const event: MetaPixelEvent = {
      event: eventName,
      timestamp: Date.now(),
      ...enhancedParams
    };
    
    pixelData.events.push(event);
    pixelData.lastUpdated = new Date().toISOString();
    updatePixelData();
    
    // حفظ في localStorage
    localStorage.setItem('meta_pixel_events', JSON.stringify(pixelData.events));
    localStorage.setItem('meta_pixel_last_updated', pixelData.lastUpdated);
    
    // طباعة بيانات الحدث للتحقق
    console.log('Meta Pixel Event Tracked:', {
      eventName,
      parameters: enhancedParams,
      currentPixelData: getPixelData()
    });
  }
};

// تحديث البيانات المحسوبة بدقة أعلى
const updatePixelData = () => {
  const events = pixelData.events;
  const now = Date.now();
  const last7Days = now - (7 * 24 * 60 * 60 * 1000);
  
  // فلترة الأحداث للأسبوع الماضي
  const recentEvents = events.filter(event => event.timestamp > last7Days);
  
  // حساب مشاهدات الصفحة بدقة
  pixelData.pageViews = recentEvents.filter(event => 
    event.event === 'PageView' || 
    event.event === 'ViewContent'
  ).length;
  
  // حساب الزوار الفريدين
  const visitorId = getVisitorId();
  uniqueVisitors.add(visitorId);
  pixelData.uniqueVisitors = uniqueVisitors.size;
  
  // حساب النقرات بدقة
  pixelData.clicks = recentEvents.filter(event => 
    event.event === 'Lead' || 
    event.event === 'Contact' ||
    event.event === 'AddToCart' ||
    event.event === 'InitiateCheckout'
  ).length;
  
  // حساب التحويلات بدقة
  pixelData.conversions = recentEvents.filter(event => 
    event.event === 'Purchase' || 
    event.event === 'CompleteRegistration' ||
    event.event === 'Subscribe'
  ).length;
  
  // حساب الإيرادات بدقة
  pixelData.revenue = recentEvents
    .filter(event => event.value && (
      event.event === 'Purchase' ||
      event.event === 'AddPaymentInfo'
    ))
    .reduce((total, event) => total + (event.value || 0), 0);
  
  // حساب معدل النقر بدقة
  pixelData.ctr = pixelData.pageViews > 0 ? 
    (pixelData.clicks / pixelData.pageViews) * 100 : 0;
  
  // حساب معدل التحويل بدقة
  pixelData.conversionRate = pixelData.clicks > 0 ? 
    (pixelData.conversions / pixelData.clicks) * 100 : 0;
  
  // حساب متوسط مدة الجلسة (حقيقي)
  const sessionEvents = recentEvents.filter(e => 
    e.event === 'PageView' || e.event === 'ViewContent'
  );
  
  if (sessionEvents.length > 1) {
    const firstEvent = sessionEvents[0];
    const lastEvent = sessionEvents[sessionEvents.length - 1];
    const duration = (lastEvent.timestamp - firstEvent.timestamp) / 1000; // بالثواني
    
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    pixelData.avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

// استرداد البيانات المحفوظة بدقة
export const loadStoredData = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedEvents = localStorage.getItem('meta_pixel_events');
      const lastUpdated = localStorage.getItem('meta_pixel_last_updated');
      
      if (storedEvents) {
        pixelData.events = JSON.parse(storedEvents);
      }
      
      if (lastUpdated) {
        pixelData.lastUpdated = lastUpdated;
      }
      
      updatePixelData();
      
      // إضافة الزائر الحالي
      const visitorId = getVisitorId();
      uniqueVisitors.add(visitorId);
      
      console.log('Loaded Meta Pixel Data:', pixelData);
    } catch (error) {
      console.error('Error loading stored pixel data:', error);
    }
  }
};

// الحصول على البيانات الحالية مع تفاصيل إضافية
export const getPixelData = (): MetaPixelData => {
  return { 
    ...pixelData,
    // إضافة بيانات إضافية للتحليل
    deviceBreakdown: getDeviceBreakdown(),
    pagePerformance: getPagePerformance(),
    revenueSources: getRevenueSources()
  };
};

// تحليل بيانات الأجهزة
const getDeviceBreakdown = () => {
  const events = pixelData.events;
  const devices = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
    other: 0
  };
  
  events.forEach(event => {
    const ua = event.user_agent || '';
    if (/mobile/i.test(ua)) devices.mobile++;
    else if (/tablet|ipad/i.test(ua)) devices.tablet++;
    else if (/windows|macintosh|linux/i.test(ua)) devices.desktop++;
    else devices.other++;
  });
  
  return devices;
};

// تحليل أداء الصفحات
const getPagePerformance = () => {
  const events = pixelData.events;
  const pages: Record<string, {views: number, conversions: number}> = {};
  
  events.forEach(event => {
    if (event.event === 'PageView' || event.event === 'ViewContent') {
      const page = event.content_name || event.event_source_url || 'Unknown';
      pages[page] = pages[page] || {views: 0, conversions: 0};
      pages[page].views++;
    }
    
    if (event.event === 'Purchase' || event.event === 'CompleteRegistration') {
      const page = event.event_source_url || 'Unknown';
      pages[page] = pages[page] || {views: 0, conversions: 0};
      pages[page].conversions++;
    }
  });
  
  return pages;
};

// تحليل مصادر الإيرادات
const getRevenueSources = () => {
  const events = pixelData.events.filter(e => e.event === 'Purchase' && e.value);
  const sources: Record<string, number> = {};
  
  events.forEach(event => {
    const source = event.content_type || event.event_source_url || 'Unknown';
    sources[source] = (sources[source] || 0) + (event.value || 0);
  });
  
  return sources;
};

// تتبع مشاهدة الصفحة مع تفاصيل إضافية
export const trackPageView = (pageName?: string) => {
  trackEvent('PageView', { 
    content_name: pageName || document.title,
    content_category: window.location.pathname.split('/')[1] || 'home',
    content_ids: [window.location.pathname]
  });
};

// تتبع النقرات مع تفاصيل إضافية
export const trackClick = (elementName: string, value?: number) => {
  trackEvent('Lead', { 
    content_name: elementName,
    content_category: 'button_click',
    value: value
  });
};

// تتبع التحويلات مع تفاصيل إضافية
export const trackConversion = (value?: number, currency: string = 'SAR', products?: any[]) => {
  trackEvent('Purchase', { 
    value,
    currency,
    content_type: 'product',
    content_ids: products?.map(p => p.id) || [],
    contents: products?.map(p => ({
      id: p.id,
      quantity: p.quantity
    })) || [],
    num_items: products?.reduce((sum, p) => sum + p.quantity, 0) || 0
  });
};

// تتبع إرسال النماذج مع تفاصيل إضافية
export const trackFormSubmit = (formName: string, formData?: any) => {
  trackEvent('CompleteRegistration', { 
    content_name: formName,
    status: 'completed',
    ...formData
  });
};

// تهيئة البيانات عند التحميل
if (typeof window !== 'undefined') {
  loadStoredData();
  
  // تتبع الصفحة الحالية عند التحميل
  trackPageView();
  
  // طباعة بيانات Pixel للتحقق
  console.log('Initial Meta Pixel Data:', getPixelData());
  
  // مراقبة تغييرات المسار (للتطبيقات أحادية الصفحة)
  if (typeof window.history !== 'undefined') {
    const originalPushState = window.history.pushState;
    window.history.pushState = function(state, title, url) {
      originalPushState.apply(window.history, arguments);
      trackPageView(title as string || undefined);
    };
    
    window.addEventListener('popstate', () => {
      trackPageView(document.title);
    });
  }
}