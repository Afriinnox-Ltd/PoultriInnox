<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CategoryAdminController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $query = Category::with(['parent', 'children'])
            ->withCount(['products', 'children']);

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by category type (parent/subcategory)
        if ($request->has('type') && $request->type !== '') {
            if ($request->type === 'parent') {
                $query->whereNull('parent_id');
            } elseif ($request->type === 'subcategory') {
                $query->whereNotNull('parent_id');
            }
        }

        // Sort
        $sort_by = $request->get('sort_by', 'sort_order');
        $sort_direction = $request->get('sort_direction', 'asc');
        $query->orderBy($sort_by, $sort_direction);

        $categories = $query->paginate(15);

        return Inertia::render('Admin/Marketplace/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'type', 'sort_by', 'sort_direction']),
            'parent_categories' => Category::whereNull('parent_id')->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $parent_categories = Category::where('parent_id', null)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Marketplace/Categories/Create', [
            'parent_categories' => $parent_categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:marketplace_categories,name',
            'description' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|exists:marketplace_categories,id',
            'image_url' => 'nullable|url|max:255',
            'icon' => 'nullable|string|max:50',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique slug
        $original_slug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $original_slug . '-' . $counter;
            $counter++;
        }

        // Set sort order if not provided
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = Category::max('sort_order') + 1;
        }

        $category = Category::create($validated);

        return redirect()->route('admin.marketplace.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        $category->load(['children', 'products' => function($query) {
            $query->take(10);
        }]);

        return Inertia::render('Admin/Marketplace/Categories/Show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        $parent_categories = Category::where('parent_id', null)
            ->where('id', '!=', $category->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Marketplace/Categories/Edit', [
            'category' => $category,
            'parent_categories' => $parent_categories,
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('marketplace_categories', 'name')->ignore($category->id),
            ],
            'description' => 'nullable|string|max:1000',
            'parent_id' => [
                'nullable',
                'exists:marketplace_categories,id',
                Rule::notIn([$category->id]), // Can't be parent of itself
            ],
            'image_url' => 'nullable|url|max:255',
            'icon' => 'nullable|string|max:50',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure unique slug
            $original_slug = $validated['slug'];
            $counter = 1;
            while (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                $validated['slug'] = $original_slug . '-' . $counter;
                $counter++;
            }
        }

        $category->update($validated);

        return redirect()->route('admin.marketplace.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return back()->with('error', 'Cannot delete category that has products. Please move or delete all products first.');
        }

        // Check if category has children
        if ($category->children()->count() > 0) {
            return back()->with('error', 'Cannot delete category that has subcategories. Please delete all subcategories first.');
        }

        $category->delete();

        return redirect()->route('admin.marketplace.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Toggle category status.
     */
    public function toggleStatus(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        $status = $category->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Category {$status} successfully.");
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Category $category)
    {
        $category->update([
            'is_featured' => !$category->is_featured
        ]);

        $status = $category->is_featured ? 'featured' : 'unfeatured';

        return back()->with('success', "Category {$status} successfully.");
    }

    /**
     * Update sort order for categories.
     */
    public function updateSortOrder(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:marketplace_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['categories'] as $categoryData) {
            Category::where('id', $categoryData['id'])->update([
                'sort_order' => $categoryData['sort_order']
            ]);
        }

        return response()->json(['message' => 'Sort order updated successfully.']);
    }

    /**
     * Bulk actions for categories.
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete,feature,unfeature',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:marketplace_categories,id',
        ]);

        $categories = Category::whereIn('id', $validated['category_ids']);

        switch ($validated['action']) {
            case 'activate':
                $categories->update(['is_active' => true]);
                $message = 'Categories activated successfully.';
                break;

            case 'deactivate':
                $categories->update(['is_active' => false]);
                $message = 'Categories deactivated successfully.';
                break;

            case 'feature':
                $categories->update(['is_featured' => true]);
                $message = 'Categories featured successfully.';
                break;

            case 'unfeature':
                $categories->update(['is_featured' => false]);
                $message = 'Categories unfeatured successfully.';
                break;

            case 'delete':
                // Check if any category has products or children
                $categories_with_products = $categories->withCount(['products', 'children'])->get();
                $cannot_delete = $categories_with_products->filter(function($category) {
                    return $category->products_count > 0 || $category->children_count > 0;
                });

                if ($cannot_delete->count() > 0) {
                    return back()->with('error', 'Some categories cannot be deleted because they have products or subcategories.');
                }

                $categories->delete();
                $message = 'Categories deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }
}
