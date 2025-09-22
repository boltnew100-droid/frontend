import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { apiService, EnhancedDevice, DevicesResponse } from '../../services/api';

interface DevicesPageProps {
  selectedHierarchy?: any;
  selectedDevice?: any;
}

const DevicesPage: React.FC<DevicesPageProps> = ({ selectedHierarchy, selectedDevice }) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [devices, setDevices] = useState<EnhancedDevice[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [filters, setFilters] = useState({
    status: '',
    deviceType: '',
  });

  useEffect(() => {
    loadDevices();
  }, [token, selectedHierarchy, searchTerm, filters]);

  const loadDevices = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      let response: any;
      
      if (selectedHierarchy?.id && selectedHierarchy.id !== selectedHierarchy.name) {
        // Load devices for specific hierarchy
        response = await apiService.getDevicesByHierarchy(
          parseInt(selectedHierarchy.id),
          token,
          {
            search: searchTerm,
            status: filters.status,
            deviceType: filters.deviceType,
          }
        );
      } else {
        // Load all devices for company
        response = await apiService.getAllDevicesEnhanced(token, {
          search: searchTerm,
          status: filters.status,
          deviceType: filters.deviceType,
          limit: 100,
        });
      }
      
      if (response.success && response.data) {
        setDevices(response.data.devices);
        setStatistics(response.data.statistics);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to load devices');
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Loading devices...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
      }`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className={`p-4 h-full rounded-lg overflow-y-auto ${
        theme === 'dark' ? 'bg-[#121429]' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1
            className={`text-4xl mb-6 font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Device List {statistics && `(${statistics.totalDevices})`}
          </h1>
          {/* Search Bar */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1  ${
                theme === 'dark'
                  ? 'bg-[#121429] border-[#3A3D57] text-white placeholder-gray-400 focus:border-[#6366F1]'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#6366F1]'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* View Toggle */}
          <div
            className={`flex items-center rounded-lg p-1 ${
              theme === 'dark' ? 'bg-[#162345]' : 'bg-gray-200'
            }`}
          >
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'dark:bg-[#6366F1] bg-[#F56C44] text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-[#6366F1] text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Card View
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 dark:bg-[#6366F1] bg-[#38BF9D] rounded-full"></div>
              <span
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Online ({statistics?.onlineDevices || 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 dark:bg-[#EC4899] bg-[#F6CA58] rounded-full"></div>
              <span
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Offline ({statistics?.offlineDevices || 0})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div
          className={`rounded-lg overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#162345]'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Table Header */}
          <div
            className={`grid grid-cols-10 gap-4 px-6 py-4 border-b ${
              theme === 'dark' ? 'bg-[#6366F1]' : 'bg-[#F56C44] border-gray-200'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Device Name
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Well Name
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Serial
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Last Comm. Time
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Water Cut(%)
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              GVF(%)
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              WFR (bpd)
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              OFR(bpd)
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              GFR
            </div>
            <div
              className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}
            >
              Status
            </div>
          </div>

          {/* Table Body */}
          <div
            className={`divide-y ${
              theme === 'dark' ? 'divide-[#494d6d]' : 'divide-gray-200'
            }`}
          >
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className={`grid grid-cols-10 gap-4 px-6 py-4 transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#25355fcc]' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {device.deviceSerial}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.wellName}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.deviceSerial}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {formatTime(device.lastCommTime)}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.flowData.wlr ? `${device.flowData.wlr.toFixed(1)}%` : 'N/A'}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.flowData.gvf ? `${device.flowData.gvf.toFixed(1)}%` : 'N/A'}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.flowData.wfr ? device.flowData.wfr.toFixed(0) : 'N/A'}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.flowData.ofr ? device.flowData.ofr.toFixed(0) : 'N/A'}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.flowData.gfr ? device.flowData.gfr.toFixed(0) : 'N/A'}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      device.status === 'Online'
                        ? 'dark:bg-[#6366F1] bg-[#38BF9D] text-white'
                        : 'dark:bg-[#EC4899] bg-[#F6CA58] text-white'
                    }`}
                  >
                    {device.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              className={`rounded-lg p-6 border transition-colors dark:hover:border-[#6366F1] hover:border-[#F6CA58] ${
                theme === 'dark'
                  ? 'bg-[#162345] border-none'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 dark:bg-[#6366F1] bg-[#F56C44] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {device.deviceSerial.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.deviceSerial}
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {device.deviceName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {device.status === 'Online' ? (
                    <Wifi className="w-4 h-4 dark:text-[#6366F1] text-[#38BF9D]" />
                  ) : (
                    <WifiOff className="w-4 h-4 dark:text-[#EC4899] text-[#F56C44]" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      device.status === 'Online'
                        ? 'dark:text-[#6366F1] text-[#38BF9D]'
                        : 'dark:text-[#EC4899] text-[#F56C44]'
                    }`}
                  >
                    {device.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Well Name:
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {device.wellName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Last Comm:
                  </span>
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {formatTime(device.lastCommTime)}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-2 gap-3 pt-2 border-t ${
                    theme === 'dark' ? 'border-[#3A3D57]' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Water Cut
                    </span>
                    <p
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.flowData.wlr ? `${device.flowData.wlr.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      GVF
                    </span>
                    <p
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.flowData.gvf ? `${device.flowData.gvf.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      WFR
                    </span>
                    <p
                      className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.flowData.wfr ? device.flowData.wfr.toFixed(0) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      OFR
                    </span>
                    <p
                      className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.flowData.ofr ? device.flowData.ofr.toFixed(0) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      GFR
                    </span>
                    <p
                      className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.flowData.gfr ? device.flowData.gfr.toFixed(0) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex justify-between items-center pt-2 border-t ${
                    theme === 'dark' ? 'border-[#3A3D57]' : 'border-gray-200'
                  }`}
                >
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Company:
                  </span>
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {device.companyName || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {devices.length === 0 && (
        <div className="text-center py-12">
          <div
            className={`text-lg mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            No devices found
          </div>
          <div
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            {searchTerm
              ? 'Try adjusting your search terms'
              : selectedHierarchy?.name
              ? `No devices found for ${selectedHierarchy.name}`
              : 'No devices available'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;