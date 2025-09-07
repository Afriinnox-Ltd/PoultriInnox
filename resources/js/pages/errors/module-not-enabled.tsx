import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, ArrowLeft, Settings } from 'lucide-react';

interface Module {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Props {
  module: Module;
  message: string;
  action_text: string;
  action_url: string;
}

export default function ModuleNotEnabled({
  module,
  message,
  action_text,
  action_url
}: Props) {
  return (
    <>
      <Head title={`${module.name} - Not Enabled`} />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Module Not Enabled
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This module is not available for your account
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📦</span>
                {module.name}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-emerald-900 mb-2">
                  To access this module:
                </h4>
                <ol className="text-sm text-emerald-800 space-y-1 list-decimal list-inside">
                  <li>Go to the Modules settings page</li>
                  <li>Enable the {module.name} module</li>
                  <li>Return to start using its features</li>
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
