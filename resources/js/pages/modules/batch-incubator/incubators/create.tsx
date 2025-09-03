import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateIncubator() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    model: '',
    serial_number: '',
    description: '',
    capacity: '',
    location: '',
    target_temperature: '',
    target_humidity: '',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/batch-incubator/incubators',{
        onSuccess: () => {
            toast.success('Incubator created successfully!');
        },
        onError: () => {
            console.log(errors);
            toast.error('Failed to create incubator. Please check the form for errors.');
        }
    });
  };

  return (
    <AppLayout>
      <Head title="Create New Incubator" />

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/batch-incubator/incubators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold">Create New Incubator</h1>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Incubator Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Incubator Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Incubator A1"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    type="text"
                    value={data.model}
                    onChange={(e) => setData('model', e.target.value)}
                    placeholder="e.g., HatchMaster Pro 3000"
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500">{errors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    type="text"
                    value={data.serial_number}
                    onChange={(e) => setData('serial_number', e.target.value)}
                    placeholder="e.g., HMP3000-2024-001"
                    className={errors.serial_number ? 'border-red-500' : ''}
                  />
                  {errors.serial_number && (
                    <p className="text-sm text-red-500">{errors.serial_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (Eggs)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={data.capacity}
                    onChange={(e) => setData('capacity', e.target.value)}
                    placeholder="Maximum number of eggs"
                    min="1"
                    className={errors.capacity ? 'border-red-500' : ''}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-500">{errors.capacity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="e.g., Building A, Room 101"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_temperature">Target Temperature (°C)</Label>
                  <Input
                    id="target_temperature"
                    type="number"
                    step="0.1"
                    value={data.target_temperature}
                    onChange={(e) => setData('target_temperature', e.target.value)}
                    placeholder="e.g., 37.5"
                    min="30"
                    max="45"
                    className={errors.target_temperature ? 'border-red-500' : ''}
                  />
                  {errors.target_temperature && (
                    <p className="text-sm text-red-500">{errors.target_temperature}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_humidity">Target Humidity (%)</Label>
                  <Input
                    id="target_humidity"
                    type="number"
                    step="0.1"
                    value={data.target_humidity}
                    onChange={(e) => setData('target_humidity', e.target.value)}
                    placeholder="e.g., 60.0"
                    min="0"
                    max="100"
                    className={errors.target_humidity ? 'border-red-500' : ''}
                  />
                  {errors.target_humidity && (
                    <p className="text-sm text-red-500">{errors.target_humidity}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder="Any additional notes about this incubator..."
                    rows={3}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={processing} className="flex-1">
                  {processing ? 'Creating...' : 'Create Incubator'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href="/batch-incubator/incubators">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
