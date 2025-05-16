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
    public function index()
    {
        $spaces = Space::all();
        return response()->json([
            'status' => 'success',
            'data' => $spaces
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
            'images' => 'required|string',
            'description' => 'required|string',
            'subtitle' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $space = Space::create($request->all());

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
        $validator = Validator::make($request->all(), [
            'places' => 'required|integer',
            'price' => 'required|numeric',
            'schedule' => 'required|string',
            'images' => 'required|string',
            'description' => 'required|string',
            'subtitle' => 'required|string',
        ]);

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
        
        $space->update($request->all());
        
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
