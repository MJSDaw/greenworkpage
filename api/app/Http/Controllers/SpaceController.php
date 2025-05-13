<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

        return response()->json([
            'status' => 'success',
            'message' => 'Space created successfully',
            'data' => $space
        ], 201);
    }
}
