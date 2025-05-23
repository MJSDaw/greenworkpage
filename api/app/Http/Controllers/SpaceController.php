<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\AuditController;

class SpaceController extends Controller
{
    /**
     * Display a listing of the spaces.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 3);
        $spaces = Space::paginate($perPage);
        return response()->json([
            'status' => 'success',
            'data' => $spaces->items(),
            'current_page' => $spaces->currentPage(),
            'last_page' => $spaces->lastPage(),
            'total' => $spaces->total()
        ]);
    }

    /**
     * Store a newly created space in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'places' => 'required|integer',
            'price' => 'required|numeric',
            'schedule' => 'required|string',
            'imageFiles' => 'sometimes|array',
            'imageFiles.*' => 'sometimes|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
            'images' => 'sometimes|string',
            'description' => 'required|string',
            'subtitle' => 'required|string',
            'address' => 'required|string',
        ], [
            'imageFiles.*.image' => 'The file must be an image',
            'imageFiles.*.mimes' => 'Only jpeg, png, jpg, svg and webp formats are allowed',
            'imageFiles.*.max' => 'Image size should not exceed 2MB'
        ]);

        if ($validator->fails()) {
            return response()->json([
            'status' => 'error',
            'message' => 'Validation error',
            'errors' => $validator->errors()
            ], 422);
        }

        $spaceData = $request->except('imageFiles');
        
        // Handle image uploads
        if ($request->hasFile('imageFiles')) {
            $imagePaths = [];
            foreach ($request->file('imageFiles') as $image) {
                $path = $image->store('spaces', 'public');
                $imagePaths[] = $path;
            }
            $spaceData['images'] = implode('|', $imagePaths);
        }

        $space = Space::create($spaceData);

        // Register the action in the audit
        AuditController::registerAudit(
            'create',
            'spaces',
            $space->id,
            null,
            $space->toArray()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Space created successfully',
            'data' => $space
        ], 201);
    }

    /**
     * Display the specified space.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $space = Space::findOrFail($id);
        
        return response()->json([
            'status' => 'success',
            'data' => $space
        ]);
    }

    /**
     * Update the specified space in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Base validation rules
        $validationRules = [
            'places' => 'required|integer',
            'price' => 'required|numeric',
            'schedule' => 'required|string',
            'images' => 'sometimes|string',
            'description' => 'required|string',
            'subtitle' => 'required|string',
            'address' => 'required|string',
        ];
        
        // Add image validation rules only when files are present
        if ($request->hasFile('imageFiles')) {
            $validationRules['imageFiles'] = 'sometimes|array';
            $validationRules['imageFiles.*'] = 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048';
        }
        
        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $space = Space::findOrFail($id);
        
        // Save original values for audit
        $oldValues = $space->toArray();
        
        $spaceData = $request->except('imageFiles');
        
        // Handle image uploads
        if ($request->hasFile('imageFiles')) {
            $imagePaths = [];
            foreach ($request->file('imageFiles') as $image) {
                $path = $image->store('spaces', 'public');
                $imagePaths[] = $path;
            }
            $spaceData['images'] = implode('|', $imagePaths);
        }
        
        $space->update($spaceData);
        
        // Register the action in the audit
        AuditController::registerAudit(
            'update',
            'spaces',
            $space->id,
            $oldValues,
            $space->toArray()
        );
        
        return response()->json([
            'status' => 'success',
            'message' => 'Space updated successfully',
            'data' => $space
        ]);
    }

    /**
     * Remove the specified space from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $space = Space::findOrFail($id);
        
        // Save original values for audit
        $oldValues = $space->toArray();
        
        $space->delete();
        
        // Register the action in the audit
        AuditController::registerAudit(
            'delete',
            'spaces',
            $id,
            $oldValues,
            null
        );
        
        return response()->json([
            'status' => 'success',
            'message' => 'Space deleted successfully'
        ]);
    }
}
