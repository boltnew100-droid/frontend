import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import SidebarDrawer from '../Shared/SidebarDrawer';
import DashboardContent from './DashboardContent';
import DevicesPage from './DevicesPage';
import AlarmsTable from './AlarmsTable';
import { Device, HierarchyNode } from '../../services/api';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchyNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setSelectedHierarchy(null);
    // Don't automatically switch to Dashboard - stay on current tab
  };

  const handleHierarchySelect = (hierarchy: HierarchyNode) => {
    setSelectedHierarchy(hierarchy);
    setSelectedDevice(null);
    // Don't automatically switch to Dashboard - stay on current tab
  };

  const handleInitialHierarchyLoad = (hierarchy: HierarchyNode) => {
    setSelectedHierarchy(hierarchy);
    setSelectedDevice(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`min-h-screen w-full ${
        theme === 'dark' ? 'bg-[#0F172A]' : 'bg-[#F7F7F7]'
      }`}
    >
      {/* Pass state + setter to header */}
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex">
        {/* Sidebar Drawer - Always present */}
        <SidebarDrawer
          onDeviceSelect={handleDeviceSelect}
          onHierarchySelect={handleHierarchySelect}
          onInitialHierarchyLoad={handleInitialHierarchyLoad}
          selectedDeviceId={selectedDevice?.id}
          selectedHierarchyId={selectedHierarchy?.id}
        />
        {/* Content Area */}
        <div className="flex-1 p-4">
          {/* Switch content based on activeTab */}
          {activeTab === 'Dashboard' && (
            <DashboardContent
              selectedDevice={selectedDevice}
              selectedHierarchy={selectedHierarchy}
            />
          )}

          {activeTab === 'Devices' && (
            <DevicesPage 
              selectedHierarchy={selectedHierarchy}
              selectedDevice={selectedDevice}
            />
          )}

          {activeTab === 'Alarms' && (
            <AlarmsTable 
              selectedHierarchy={selectedHierarchy}
              selectedDevice={selectedDevice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;



