import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Settings } from 'lucide-react';

interface MissingDependency {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Module {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Props {
  module: Module;
  missing_dependencies: MissingDependency[];
  message: string;
  action_text: string;
  action_url: string;
}

export default function MissingDependencies({
  module,
  missing_dependencies,
  message,
  action_text,
  action_url
}: Props) {
  return (
    <>
      <Head title={`${module.name} - Missing Dependencies`} />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Module Dependencies Missing
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Some required modules need to be enabled first
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className={`mr-2 text-${module.icon}`}>📦</span>
                {module.name}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Required Modules:
                </h3>
                <div className="space-y-3">
                  {missing_dependencies.map((dependency) => (
                    <div key={dependency.slug} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {dependency.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {dependency.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-emerald-900 mb-2">
                  What you need to do:
                </h4>
                <ol className="text-sm text-emerald-800 space-y-1 list-decimal list-inside">
                  <li>Go to the Modules settings page</li>
                  <li>Enable the required modules listed above</li>
                  <li>Return to use the {module.name} module</li>
                </ol>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => window.location.href = action_url}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {action_text}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
