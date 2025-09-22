import React, { useState, useEffect } from 'react';
import { FilterIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { apiService, DeviceAlarm, AlarmStatistics } from '../../services/api';

interface AlarmsTableProps {
  selectedHierarchy?: any;
  selectedDevice?: any;
}

const AlarmsTable: React.FC<AlarmsTableProps> = ({ selectedHierarchy, selectedDevice }) => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [alarms, setAlarms] = useState<DeviceAlarm[]>([]);
  const [statistics, setStatistics] = useState<AlarmStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadAlarms();
  }, [token, selectedHierarchy, selectedDevice, filters]);

  const loadAlarms = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const apiFilters: any = {
        sort_by: 'createdAt',
        sort_order: 'desc',
        limit: 50,
      };

      // Add hierarchy filter if selected
      if (selectedHierarchy?.id && selectedHierarchy.id !== selectedHierarchy.name) {
        apiFilters.hierarchy_id = parseInt(selectedHierarchy.id);
      }

      // Add device filter if selected
      if (selectedDevice?.serial_number) {
        apiFilters.device_serial = selectedDevice.serial_number;
      }

      // Add UI filters
      if (filters.severity) {
        apiFilters.severity = filters.severity;
      }

      const response = await apiService.getAlarms(token, apiFilters);
      
      if (response.success && response.data) {
        setAlarms(response.data.alarms);
        setStatistics(response.data.statistics);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to load alarms');
      console.error('Failed to load alarms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#EF4444';
      case 'major':
        return '#F59E0B';
      case 'minor':
        return '#22C55E';
      case 'warning':
        return '#6366F1';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
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
      <div className={`rounded-lg h-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-[#162345]' : 'bg-white border border-gray-200'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Loading alarms...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg h-full flex items-center justify-center ${
        theme === 'dark' ? 'bg-[#162345]' : 'bg-white border border-gray-200'
      }`}>
        <div className="text-center">
          <p className={`text-lg font-medium ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            Error loading alarms
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg h-full ${
        theme === 'dark' ? 'bg-[#162345]' : 'bg-white border border-gray-200'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-lg font-semibold tracking-wide ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Alarms {statistics && `(${statistics.total})`}
          </h2>
          <button
            className={`h-9 px-4 border rounded-lg flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-[#3A3D57]'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FilterIcon className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Statistics Summary */}
        {statistics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[#1a2847]' : 'bg-gray-50'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Active
              </div>
              <div className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {statistics.active}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[#1a2847]' : 'bg-gray-50'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Critical
              </div>
              <div className="text-xl font-bold text-red-500">
                {statistics.by_severity.critical}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[#1a2847]' : 'bg-gray-50'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Acknowledged
              </div>
              <div className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {statistics.acknowledged}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[#1a2847]' : 'bg-gray-50'
            }`}>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Resolved
              </div>
              <div className="text-xl font-bold text-green-500">
                {statistics.resolved}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  theme === 'dark' ? 'border-[#494d6d]' : 'border-gray-200'
                }`}
              >
                <th
                  className={`text-left py-3 px-4 font-light ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Device
                </th>
                <th
                  className={`text-left py-3 px-4 font-light ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`text-left py-3 px-4 font-light ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Severity
                </th>
                <th
                  className={`text-left py-3 px-4 font-light ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Time
                </th>
                <th
                  className={`text-left py-3 px-4 font-light ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((alarm) => (
                <tr
                  key={alarm.id}
                  className={`border-b transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-700 hover:bg-[#3A3D57]'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td
                    className={`py-4 px-4 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {alarm.deviceSerial}
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {alarm.alarmType.name}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSeverityColor(alarm.severity) }}
                      />
                      <span
                        className="font-medium"
                        style={{ color: getSeverityColor(alarm.severity) }}
                      >
                        {alarm.severity}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {formatDate(alarm.createdAt)}
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {alarm.alarmStatus.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {alarms.length === 0 && (
            <div className="text-center py-8">
              <div
                className={`text-lg mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                No alarms found
              </div>
              <div
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {selectedDevice 
                  ? `No alarms for device ${selectedDevice.serial_number}`
                  : selectedHierarchy?.name 
                    ? `No alarms for ${selectedHierarchy.name}`
                    : 'No alarms available'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlarmsTable;