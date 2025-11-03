<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $warehouseId = $request->query('warehouseId');

        $query = Transaction::select([
                'product_id',
                'warehouse_id',
                DB::raw('SUM(CASE WHEN type = "in" THEN quantity ELSE -quantity END) as quantity')
            ])
            ->groupBy('product_id', 'warehouse_id');

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $results = $query->get();

        $inventory = [];
        foreach ($results as $result) {
            $product = \App\Models\Product::find($result->product_id);
            $warehouse = \App\Models\Warehouse::find($result->warehouse_id);

            if (!$product || !$warehouse) {
                continue;
            }

            $quantity = (float) $result->quantity;

            // Only show items with stock unless filtering by warehouse
            if ($quantity <= 0 && !$warehouseId) {
                continue;
            }

            $inventory[] = [
                'productId' => $result->product_id,
                'warehouseId' => $result->warehouse_id,
                'quantity' => $quantity,
                'product' => $product,
                'warehouse' => $warehouse,
            ];
        }

        return response()->json($inventory);
    }
}
