import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { apiService, Device } from '../../services/api';

interface DeviceData extends Device {
  wellName?: string;
  lastCommTime?: string;
  waterCut?: number;
  gvf?: number;
  wfr?: number;
  ofr?: number;
  gfr?: number;
  status?: 'Online' | 'Offline';
}

const DevicesPage: React.FC = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  useEffect(() => {
    const loadDevices = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await apiService.getAllDevices(token);
        if (response.success && response.data) {
          // Mock additional data for demonstration
          const enhancedDevices: DeviceData[] = response.data.devices.map((device, index) => ({
            ...device,
            wellName: `Pipe${String(index + 1).padStart(3, '0')}-01`,
            lastCommTime: '2025-09-01 08:15Z',
            waterCut: Math.floor(Math.random() * 30) + 10,
            gvf: Math.floor(Math.random() * 30) + 10,
            wfr: Math.floor(Math.random() * 5000) + 1000,
            ofr: Math.floor(Math.random() * 5000) + 1000,
            gfr: Math.floor(Math.random() * 20000) + 5000,
            status: Math.random() > 0.3 ? 'Online' : 'Offline'
          }));
          setDevices(enhancedDevices);
          setFilteredDevices(enhancedDevices);
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

    loadDevices();
  }, [token]);

  useEffect(() => {
    const filtered = devices.filter(device =>
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.wellName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  const onlineCount = filteredDevices.filter(d => d.status === 'Online').length;
  const offlineCount = filteredDevices.filter(d => d.status === 'Offline').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Loading devices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 text-red-400">
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
            Device List
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
                Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 dark:bg-[#EC4899] bg-[#F6CA58] rounded-full"></div>
              <span
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Offline
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
            {filteredDevices.map((device, index) => (
              <div
                key={device.id}
                className={`grid grid-cols-10 gap-4 px-6 py-4 transition-colors ${
                  theme === 'dark' ? 'hover:bg-[#25355fcc]' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {device.serial_number}
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
                  {device.serial_number}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.lastCommTime}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.waterCut}%
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.gvf}%
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.wfr}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.ofr}
                </div>
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {device.gfr}
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
          {filteredDevices.map((device) => (
            <div
              key={device.id}
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
                      {device.serial_number.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {device.serial_number}
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {device.type}
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
                    {device.lastCommTime}
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
                      {device.waterCut}%
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
                      {device.gvf}%
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
                      {device.wfr}
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
                      {device.ofr}
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
                      {device.gfr}
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
                    Location:
                  </span>
                  <span
                    className={`text-xs ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {device.location || 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDevices.length === 0 && (
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
              : 'No devices available'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;