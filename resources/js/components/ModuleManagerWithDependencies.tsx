import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertCircle, Info, Package } from 'lucide-react';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  dependencies?: string[];
  config: {
    features: string[];
    benefits: string[];
    requires?: Record<string, string>;
  };
}

interface ModuleStatus {
  module: Module;
  is_enabled: boolean;
  can_enable?: {
    can_enable: boolean;
    missing_dependencies: Array<{
      slug: string;
      name: string;
      module?: Module;
    }>;
    message: string;
  };
  can_disable?: {
    can_disable: boolean;
    dependent_modules: Module[];
    message: string;
  };
  missing_dependencies: Array<{
    slug: string;
    name: string;
    module?: Module;
  }>;
  dependent_modules: Module[];
}

const ModuleManagerWithDependencies: React.FC = () => {
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleStatus | null>(null);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);

  useEffect(() => {
    fetchModulesWithDependencies();
  }, []);

  const fetchModulesWithDependencies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/modules/with-dependencies');
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableModule = async (moduleStatus: ModuleStatus) => {
    if (!moduleStatus.can_enable?.can_enable) {
      setSelectedModule(moduleStatus);
      setDependencyModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/modules/${moduleStatus.module.id}/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        await fetchModulesWithDependencies();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error enabling module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableModule = async (moduleStatus: ModuleStatus) => {
    if (!moduleStatus.can_disable?.can_disable) {
      alert(moduleStatus.can_disable?.message);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/modules/${moduleStatus.module.id}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        await fetchModulesWithDependencies();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error disabling module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableWithDependencies = async () => {
    if (!selectedModule) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/modules/${selectedModule.module.id}/enable-with-dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        await fetchModulesWithDependencies();
        setDependencyModalVisible(false);
        setSelectedModule(null);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error enabling module with dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDependencyBadges = (dependencies: string[]) => {
    return dependencies.map(dep => {
      const depModule = modules.find(m => m.module.slug === dep);
      const isEnabled = depModule?.is_enabled;

      return (
        <Badge
          key={dep}
          variant={isEnabled ? "default" : "destructive"}
          className="mr-2"
        >
          {depModule?.module.name || dep}
        </Badge>
      );
    });
  };

  const renderModuleCard = (moduleStatus: ModuleStatus) => {
    const { module, is_enabled, can_enable, can_disable, missing_dependencies } = moduleStatus;

    return (
      <Card key={module.id} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {module.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {is_enabled ? (
                <Badge variant="default" className="bg-emerald-500">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Disabled
                </Badge>
              )}
              {!is_enabled ? (
                <Button
                  size="sm"
                  disabled={!can_enable?.can_enable}
                  onClick={() => handleEnableModule(moduleStatus)}
                >
                  Enable
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!can_disable?.can_disable}
                  onClick={() => handleDisableModule(moduleStatus)}
                >
                  Disable
                </Button>
              )}
            </div>
          </div>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Dependencies Section */}
          {module.dependencies && module.dependencies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Dependencies
              </h4>
              <div className="flex flex-wrap">
                {renderDependencyBadges(module.dependencies)}
              </div>
            </div>
          )}

          {/* Requirements */}
          {module.config.requires && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Requirements</h4>
              {Object.entries(module.config.requires).map(([req, desc]) => (
                <div key={req} className="text-sm text-gray-600">
                  <strong>{req}:</strong> {desc}
                </div>
              ))}
            </div>
          )}

          {/* Missing Dependencies Warning */}
          {!is_enabled && missing_dependencies.length > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-semibold">Missing Dependencies</p>
                  <p>This module requires the following dependencies to be enabled first:</p>
                  <ul className="mt-2">
                    {missing_dependencies.map(dep => (
                      <li key={dep.slug} className="flex items-center">
                        <AlertCircle className="text-orange-500 mr-2 h-4 w-4" />
                        {dep.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Dependent Modules Info */}
          {is_enabled && moduleStatus.dependent_modules.length > 0 && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-semibold">Required by Other Modules</p>
                  <p>This module is required by:</p>
                  <ul className="mt-2">
                    {moduleStatus.dependent_modules.map(dep => (
                      <li key={dep.id} className="flex items-center">
                        <CheckCircle className="text-emerald-500 mr-2 h-4 w-4" />
                        {dep.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Features</h4>
            <ul className="text-sm text-gray-600">
              {module.config.features.slice(0, 3).map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
              {module.config.features.length > 3 && (
                <li className="text-emerald-500">• And {module.config.features.length - 3} more...</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="module-manager-with-dependencies">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Module Management</h1>
        <p className="text-gray-600">
          Manage your PoultriInnox modules. Some modules have dependencies that must be enabled first.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(renderModuleCard)}
      </div>

      {/* Dependency Resolution Dialog */}
      <Dialog open={dependencyModalVisible} onOpenChange={setDependencyModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Module with Dependencies</DialogTitle>
            <DialogDescription>
              {selectedModule && (
                <>
                  To enable <strong>{selectedModule.module.name}</strong>, the following dependencies will be automatically enabled:
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedModule && (
            <div className="py-4">
              <ul className="space-y-2">
                {selectedModule.missing_dependencies.map(dep => (
                  <li key={dep.slug} className="flex items-center p-3 bg-gray-50 rounded">
                    <Info className="text-emerald-500 mr-3 h-4 w-4" />
                    <div>
                      <div className="font-semibold">{dep.name}</div>
                      {dep.module && (
                        <div className="text-sm text-gray-600">{dep.module.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm text-gray-600">
                This will automatically enable all required dependencies and then enable {selectedModule.module.name}.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDependencyModalVisible(false);
                setSelectedModule(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnableWithDependencies}
              disabled={loading}
            >
              {loading ? "Enabling..." : "Enable All Dependencies"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleManagerWithDependencies;
