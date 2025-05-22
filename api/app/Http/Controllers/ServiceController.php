<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 3);
        $services = Service::paginate($perPage);
        return response()->json([
            'status' => 'success',
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'total' => $services->total(),
                'per_page' => $services->perPage()
            ]
        ]);
    }

    /**
     * Store a newly created service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:services,nombre',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Store the image file
            $path = $request->file('image')->store('services', 'public');
            
            $service = Service::create([
                'nombre' => $request->nombre,
                'image_url' => $path,
            ]);

            return response()->json($service, 201);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['image' => ['Error uploading image: ' . $e->getMessage()]]
            ], 422);
        }
    }

    /**
     * Display the specified service.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $service = Service::findOrFail($id);
        return response()->json($service);
    }

    /**
     * Update the specified service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:services,nombre,'.$id,
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $updateData = ['nombre' => $request->nombre];

            // If a new image is uploaded
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($service->image_url && Storage::disk('public')->exists($service->image_url)) {
                    Storage::disk('public')->delete($service->image_url);
                }
                
                // Store the new image
                $path = $request->file('image')->store('services', 'public');
                $updateData['image_url'] = $path;
            }

            $service->update($updateData);
            return response()->json($service);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['image' => ['Error updating image: ' . $e->getMessage()]]
            ], 422);
        }
    }

    /**
     * Remove the specified service from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        
        try {
            // Delete the image file if exists
            if ($service->image_url && Storage::disk('public')->exists($service->image_url)) {
                Storage::disk('public')->delete($service->image_url);
            }
            
            $service->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => ['general' => ['Error deleting service: ' . $e->getMessage()]]
            ], 422);
        }
    }
}
