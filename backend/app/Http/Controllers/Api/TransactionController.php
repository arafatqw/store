<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = Transaction::with(['product', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'warehouse_id' => 'required|uuid|exists:warehouses,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|numeric|min:0.01',
            'serial_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Check if product and warehouse exist
        $product = Product::findOrFail($validated['product_id']);

        // For 'out' transactions, check stock
        if ($validated['type'] === 'out') {
            $currentStock = $this->getCurrentStock($validated['product_id'], $validated['warehouse_id']);
            if ($currentStock < $validated['quantity']) {
                return response()->json([
                    'error' => 'الكمية المتوفرة غير كافية'
                ], 400);
            }
        }

        $transaction = Transaction::create($validated);
        return response()->json($transaction->load(['product', 'warehouse']), 201);
    }

    private function getCurrentStock(string $productId, string $warehouseId): float
    {
        $stock = Transaction::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->selectRaw('SUM(CASE WHEN type = "in" THEN quantity ELSE -quantity END) as stock')
            ->value('stock');

        return $stock ?? 0;
    }
}
