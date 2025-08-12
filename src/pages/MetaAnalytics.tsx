import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Globe,
  Smartphone,
  Monitor,
  ArrowUp,
  ArrowDown,
  Activity,
  AlertCircle,
  PieChart,
  BarChart2,
  List
} from 'lucide-react';
import { useMetaPixel } from '../hooks/useMetaPixel';

const MetaAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [rawDataVisible, setRawDataVisible] = useState(false);
  
  // استخدام hook Meta Pixel المحسن
  const { 
    pixelData, 
    loading, 
    error, 
    refreshData,
    trackClick,
    getDeviceData,
    getPagePerformance,
    getRevenueSources
  } = useMetaPixel();

  // تحليل البيانات للأجهزة
  const deviceData = () => {
    const devices = getDeviceData();
    const total = Object.values(devices).reduce((sum, val) => sum + val, 0);
    
    return [
      { 
        device: 'الهاتف المحمول', 
        users: devices.mobile, 
        percentage: total > 0 ? Math.round((devices.mobile / total) * 100) : 0, 
        icon: Smartphone 
      },
      { 
        device: 'سطح المكتب', 
        users: devices.desktop, 
        percentage: total > 0 ? Math.round((devices.desktop / total) * 100) : 0, 
        icon: Monitor 
      },
      { 
        device: 'الجهاز اللوحي', 
        users: devices.tablet, 
        percentage: total > 0 ? Math.round((devices.tablet / total) * 100) : 0, 
        icon: Smartphone 
      }
    ];
  };

  // تحليل البيانات للصفحات
  const topPages = () => {
    const pages = getPagePerformance();
    const sortedPages = Object.entries(pages)
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 5);
    
    const totalViews = sortedPages.reduce((sum, [, data]) => sum + data.views, 0);
    
    return sortedPages.map(([page, data]) => ({
      page,
      views: data.views,
      conversions: data.conversions,
      percentage: totalViews > 0 ? Math.round((data.views / totalViews) * 100) : 0
    }));
  };

  // تحليل مصادر الإيرادات
  const revenueSources = () => {
    const sources = getRevenueSources();
    return Object.entries(sources).map(([source, amount]) => ({
      source,
      amount,
      percentage: pixelData?.revenue ? Math.round((amount / pixelData.revenue) * 100) : 0
    }));
  };

  const handleRefresh = () => {
    trackClick('refresh_button');
    refreshData();
  };

  const handleExport = () => {
    trackClick('export_button');
    const dataStr = JSON.stringify(pixelData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meta_pixel_data_${new Date().toISOString()}.json`;
    link.click();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">تحليلات Meta Pixel</h1>
          <p className="text-muted-foreground mt-2">
            Pixel ID: 1298682121868250 - {pixelData ? 'متصل ويعمل' : 'جاري التحميل...'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
          >
            <option value="today">اليوم</option>
            <option value="7days">آخر 7 أيام</option>
            <option value="30days">آخر 30 يوم</option>
            <option value="90days">آخر 90 يوم</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
          
          <button 
            onClick={() => setRawDataVisible(!rawDataVisible)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <List className="w-4 h-4" />
            {rawDataVisible ? 'إخفاء البيانات الخام' : 'عرض البيانات الخام'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('overview')}
        >
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            نظرة عامة
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('events')}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            الأحداث
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'analysis' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('analysis')}
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            تحليل متقدم
          </div>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">خطأ في تحميل البيانات</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !pixelData && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">جاري تحميل بيانات Meta Pixel...</h3>
          <p className="text-muted-foreground">يرجى الانتظار</p>
        </div>
      )}

      {/* Raw Data View */}
      {rawDataVisible && pixelData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">البيانات الخام من Meta Pixel</h3>
          <pre className="bg-white p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(pixelData, null, 2)}
          </pre>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && pixelData && (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">مشاهدات الصفحة</p>
                  <p className="text-3xl font-bold mt-2">{formatNumber(pixelData.pageViews)}</p>
                  <div className="flex items-center mt-2 text-blue-100">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.5%</span>
                  </div>
                </div>
                <Eye className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">زوار فريدون</p>
                  <p className="text-3xl font-bold mt-2">{formatNumber(pixelData.uniqueVisitors)}</p>
                  <div className="flex items-center mt-2 text-green-100">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+8.3%</span>
                  </div>
                </div>
                <Users className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">التحويلات</p>
                  <p className="text-3xl font-bold mt-2">{formatNumber(pixelData.conversions)}</p>
                  <div className="flex items-center mt-2 text-purple-100">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15.7%</span>
                  </div>
                </div>
                <Target className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">الإيرادات</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(pixelData.revenue)}</p>
                  <div className="flex items-center mt-2 text-orange-100">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+22.1%</span>
                  </div>
                </div>
                <DollarSign className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">معدل النقر (CTR)</h3>
                <MousePointer className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{pixelData.ctr.toFixed(1)}%</div>
              <div className="flex items-center text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+2.1% من الأسبوع الماضي</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">معدل التحويل</h3>
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{pixelData.conversionRate.toFixed(1)}%</div>
              <div className="flex items-center text-green-600">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+1.8% من الأسبوع الماضي</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">متوسط مدة الجلسة</h3>
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{pixelData.avgSessionDuration}</div>
              <div className="flex items-center text-red-600">
                <ArrowDown className="w-4 h-4 mr-1" />
                <span className="text-sm">-0.3% من الأسبوع الماضي</span>
              </div>
            </div>
          </div>

          {/* Device Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold mb-6">التوزيع حسب الجهاز</h3>
              <div className="space-y-4">
                {deviceData().map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <device.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-left">
                        {device.percentage}%
                      </span>
                      <span className="font-medium w-16 text-left">
                        {formatNumber(device.users)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold mb-6">أكثر الصفحات زيارة</h3>
              <div className="space-y-4">
                {topPages().map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="font-medium truncate max-w-xs">{page.page}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${page.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-left">
                        {page.percentage}%
                      </span>
                      <span className="font-medium w-16 text-left">
                        {formatNumber(page.views)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && pixelData && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-6">أحداث Pixel الأخيرة</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 font-semibold">الحدث</th>
                  <th className="text-right py-3 font-semibold">الوقت</th>
                  <th className="text-right py-3 font-semibold">القيمة</th>
                  <th className="text-right py-3 font-semibold">الصفحة</th>
                  <th className="text-right py-3 font-semibold">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {pixelData.events.slice(0, 10).map((event, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="py-4 font-medium">{event.event}</td>
                    <td className="py-4">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="py-4">{event.value ? formatCurrency(event.value) : '-'}</td>
                    <td className="py-4 truncate max-w-xs">{event.event_source_url || '-'}</td>
                    <td className="py-4">
                      <button 
                        onClick={() => console.log('Event details:', event)}
                        className="text-primary hover:underline"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && pixelData && (
        <div className="space-y-6">
          {/* Revenue Sources */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-6">مصادر الإيرادات</h3>
            <div className="space-y-4">
              {revenueSources().map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="font-medium truncate max-w-xs">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-left">
                      {source.percentage}%
                    </span>
                    <span className="font-medium w-16 text-left">
                      {formatCurrency(source.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Trends */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-6">اتجاهات الأحداث</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">رسم بياني لاتجاهات الأحداث سيظهر هنا</p>
            </div>
          </div>
        </div>
      )}

      {/* Pixel Status */}
      <div className={`bg-gradient-to-r border rounded-xl p-6 ${
        pixelData 
          ? 'from-green-50 to-green-100 border-green-200' 
          : 'from-orange-50 to-orange-100 border-orange-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            pixelData ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              pixelData ? 'text-green-800' : 'text-orange-800'
            }`}>
              Meta Pixel {pixelData ? 'نشط' : 'جاري التحميل'}
            </h3>
            <p className={pixelData ? 'text-green-600' : 'text-orange-600'}>
              Pixel ID: 1298682121868250 - {pixelData ? `يعمل بشكل صحيح - آخر تحديث: ${new Date(pixelData.lastUpdated).toLocaleString()}` : 'جاري تحميل البيانات...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaAnalytics;