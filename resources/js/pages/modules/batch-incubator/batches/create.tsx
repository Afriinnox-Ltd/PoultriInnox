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
  statuses: { value: string; label: string; }[];
}

const commonBreeds = [
  'Rhode Island Red',
  'Leghorn',
  'Plymouth Rock',
  'Sussex',
  'Orpington',
  'Australorp',
  'New Hampshire',
  'Marans',
  'Wyandotte',
  'Brahma',
  'Cochin',
  'Silkie',
  'Other'
];

export default function CreateBatch({ incubators, statuses }: CreateBatchProps) {
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
    status: 'planned',
  });

  // Auto-calculate expected completion date when start date changes
  const handleStartDateChange = (startDate: string) => {
    setData('start_date', startDate);
    if (startDate && data.status === 'incubating') {
      const hatchDate = new Date(startDate);
      hatchDate.setDate(hatchDate.getDate() + 21);
      
      // Calculate expected completion (varies by purpose)
      const completionDate = new Date(hatchDate);
      completionDate.setDate(completionDate.getDate() + 120); // Approximate 16-18 weeks
      
      setData('expected_completion_date', completionDate.toISOString().split('T')[0]);
    }
  };

  // Update expected dates when status changes
  const handleStatusChange = (newStatus: string) => {
    setData('status', newStatus);
    if (data.start_date && newStatus === 'incubating') {
      handleStartDateChange(data.start_date);
    }
  };

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
                  <Select
                    value={data.breed}
                    onValueChange={(value) => setData('breed', value)}
                  >
                    <SelectTrigger className={errors.breed ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonBreeds.map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.breed && (
                    <p className="text-sm text-red-500">{errors.breed}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="incubating">Incubating</SelectItem>
                      <SelectItem value="growing">Growing</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {data.status === 'incubating' && 'Will auto-calculate hatch date (21 days)'}
                    {data.status === 'planned' && 'Batch is being prepared'}
                    {data.status === 'growing' && 'Chicks are already hatched'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incubator_id">Incubator (Optional)</Label>
                  <Select
                    value={data.incubator_id}
                    onValueChange={(value) => setData('incubator_id', value)}
                  >
                    <SelectTrigger className={errors.incubator_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select an incubator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No incubator assigned</SelectItem>
                      {incubators.map((incubator) => {
                        const available = incubator.capacity - incubator.current_load;
                        const canFit = data.initial_count ? available >= parseInt(data.initial_count) : true;
                        return (
                          <SelectItem
                            key={incubator.id}
                            value={incubator.id.toString()}
                            disabled={!canFit}
                          >
                            {incubator.name} - {incubator.current_load}/{incubator.capacity} 
                            ({available} available) {!canFit && '⚠️ Insufficient capacity'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.incubator_id && (
                    <p className="text-sm text-red-500">{errors.incubator_id}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {data.status === 'incubating' ? 'Required for incubating batches' : 'Can be assigned later'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial_count">
                    {data.status === 'incubating' ? 'Egg Count' : 
                     data.status === 'growing' ? 'Chick Count' : 'Initial Count'}
                  </Label>
                  <Input
                    id="initial_count"
                    type="number"
                    value={data.initial_count}
                    onChange={(e) => setData('initial_count', e.target.value)}
                    placeholder={data.status === 'incubating' ? 'Number of eggs' : 'Number of birds'}
                    min="1"
                    max="10000"
                    className={errors.initial_count ? 'border-red-500' : ''}
                  />
                  {errors.initial_count && (
                    <p className="text-sm text-red-500">{errors.initial_count}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Starting quantity for this batch
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={errors.start_date ? 'border-red-500' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    When did/will the batch start?
                  </p>
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
