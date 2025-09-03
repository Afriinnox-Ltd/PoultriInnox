import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Egg } from 'lucide-react';

interface Incubator {
  id: number;
  name: string;
  model: string;
  capacity: number;
  current_load: number;
  status: string;
}

interface CreateBatchProps {
  incubators: Incubator[];
}

export default function CreateBatch({ incubators }: CreateBatchProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    breed: '',
    initial_count: '',
    incubator_id: '',
    start_date: '',
    expected_completion_date: '',
    initial_weight: '',
    initial_cost: '',
    status: 'preparing',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/batch-incubator/batches');
  };

  return (
    <AppLayout>
      <Head title="Create New Batch" />

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Egg className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold">Create New Batch</h1>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Summer Hatch 2024"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    type="text"
                    value={data.breed}
                    onChange={(e) => setData('breed', e.target.value)}
                    placeholder="e.g., Rhode Island Red"
                    className={errors.breed ? 'border-red-500' : ''}
                  />
                  {errors.breed && (
                    <p className="text-sm text-red-500">{errors.breed}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incubator_id">Incubator</Label>
                  <Select
                    value={data.incubator_id}
                    onValueChange={(value) => setData('incubator_id', value)}
                  >
                    <SelectTrigger className={errors.incubator_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select an incubator" />
                    </SelectTrigger>
                    <SelectContent>
                      {incubators.map((incubator) => (
                        <SelectItem
                          key={incubator.id}
                          value={incubator.id.toString()}
                        >
                          {incubator.name} - {incubator.current_load}/{incubator.capacity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.incubator_id && (
                    <p className="text-sm text-red-500">{errors.incubator_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial_count">Initial Egg Count</Label>
                  <Input
                    id="initial_count"
                    type="number"
                    value={data.initial_count}
                    onChange={(e) => setData('initial_count', e.target.value)}
                    placeholder="Number of eggs"
                    min="1"
                    className={errors.initial_count ? 'border-red-500' : ''}
                  />
                  {errors.initial_count && (
                    <p className="text-sm text-red-500">{errors.initial_count}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                    className={errors.start_date ? 'border-red-500' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_completion_date">Expected Completion Date</Label>
                  <Input
                    id="expected_completion_date"
                    type="date"
                    value={data.expected_completion_date}
                    onChange={(e) => setData('expected_completion_date', e.target.value)}
                    className={errors.expected_completion_date ? 'border-red-500' : ''}
                  />
                  {errors.expected_completion_date && (
                    <p className="text-sm text-red-500">{errors.expected_completion_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial_weight">Initial Weight (kg)</Label>
                  <Input
                    id="initial_weight"
                    type="number"
                    step="0.01"
                    value={data.initial_weight}
                    onChange={(e) => setData('initial_weight', e.target.value)}
                    placeholder="Optional"
                    className={errors.initial_weight ? 'border-red-500' : ''}
                  />
                  {errors.initial_weight && (
                    <p className="text-sm text-red-500">{errors.initial_weight}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial_cost">Initial Cost</Label>
                  <Input
                    id="initial_cost"
                    type="number"
                    step="0.01"
                    value={data.initial_cost}
                    onChange={(e) => setData('initial_cost', e.target.value)}
                    placeholder="Optional"
                    className={errors.initial_cost ? 'border-red-500' : ''}
                  />
                  {errors.initial_cost && (
                    <p className="text-sm text-red-500">{errors.initial_cost}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder="Any additional notes about this batch..."
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
                  {processing ? 'Creating...' : 'Create Batch'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
