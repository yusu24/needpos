<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'permission:view dashboard'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Kasir routes (explicit, no Route::resource)
Route::prefix('kasir')
    ->middleware(['auth', 'role:owner|manager|cashier', 'outlet.access'])
    ->group(function () {
        Route::get('/', [\App\Http\Controllers\Kasir\PosController::class, 'index'])->name('kasir.index');
        Route::post('/checkout', [\App\Http\Controllers\Kasir\PosController::class, 'checkout'])->name('kasir.checkout');
        Route::get('/receipt/{order}', [\App\Http\Controllers\Kasir\PosController::class, 'receipt'])->name('kasir.receipt');
        Route::post('/discount/validate', [\App\Http\Controllers\Kasir\PosController::class, 'validateDiscount'])->name('kasir.discount.validate');
    });

// Admin routes
Route::prefix('admin')
    ->middleware(['auth', 'outlet.access'])
    ->group(function () {

        // 1. Suppliers CRUD
        Route::middleware('permission:view suppliers')->group(function () {
            Route::get('/suppliers', [\App\Http\Controllers\Admin\SupplierController::class, 'index'])->name('admin.suppliers.index');
            Route::get('/suppliers/create', [\App\Http\Controllers\Admin\SupplierController::class, 'create'])->name('admin.suppliers.create')->middleware('permission:create suppliers');
            Route::post('/suppliers', [\App\Http\Controllers\Admin\SupplierController::class, 'store'])->name('admin.suppliers.store')->middleware('permission:create suppliers');
            Route::get('/suppliers/{supplier}/edit', [\App\Http\Controllers\Admin\SupplierController::class, 'edit'])->name('admin.suppliers.edit')->middleware('permission:edit suppliers');
            Route::patch('/suppliers/{supplier}', [\App\Http\Controllers\Admin\SupplierController::class, 'update'])->name('admin.suppliers.update')->middleware('permission:edit suppliers');
            Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\Admin\SupplierController::class, 'destroy'])->name('admin.suppliers.destroy')->middleware('permission:delete suppliers');
        });

        // 2. Purchase Orders CRUD & Status
        Route::middleware('permission:view purchase orders')->group(function () {
            Route::get('/purchase-orders', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'index'])->name('admin.purchase-orders.index');
            Route::get('/purchase-orders/create', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'create'])->name('admin.purchase-orders.create')->middleware('permission:create purchase orders');
            Route::post('/purchase-orders', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'store'])->name('admin.purchase-orders.store')->middleware('permission:create purchase orders');
            Route::get('/purchase-orders/{purchaseOrder}', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'show'])->name('admin.purchase-orders.show');
            Route::post('/purchase-orders/{purchaseOrder}/status', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'updateStatus'])->name('admin.purchase-orders.status')->middleware('permission:update status purchase orders');
        });

        // 3. Purchase Receives
        Route::middleware('permission:view receive items')->group(function () {
            Route::get('/purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\Admin\PurchaseReceiveController::class, 'create'])->name('admin.purchase-receives.create')->middleware('permission:create receive items');
            Route::post('/purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\Admin\PurchaseReceiveController::class, 'store'])->name('admin.purchase-receives.store')->middleware('permission:create receive items');
        });

        // 4. Supplier Returns CRUD & Confirm
        Route::middleware('permission:view supplier returns')->group(function () {
            Route::get('/supplier-returns', [\App\Http\Controllers\Admin\SupplierReturnController::class, 'index'])->name('admin.supplier-returns.index');
            Route::get('/supplier-returns/create', [\App\Http\Controllers\Admin\SupplierReturnController::class, 'create'])->name('admin.supplier-returns.create')->middleware('permission:create supplier returns');
            Route::post('/supplier-returns', [\App\Http\Controllers\Admin\SupplierReturnController::class, 'store'])->name('admin.supplier-returns.store')->middleware('permission:create supplier returns');
            Route::post('/supplier-returns/{supplierReturn}/confirm', [\App\Http\Controllers\Admin\SupplierReturnController::class, 'confirm'])->name('admin.supplier-returns.confirm')->middleware('permission:confirm supplier returns');
            Route::delete('/supplier-returns/{supplierReturn}', [\App\Http\Controllers\Admin\SupplierReturnController::class, 'destroy'])->name('admin.supplier-returns.destroy')->middleware('permission:delete supplier returns');
        });

        // 5. Categories CRUD
        Route::middleware('permission:view categories')->group(function () {
            Route::get('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.categories.index');
            Route::post('/categories', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.categories.store')->middleware('permission:create categories');
            Route::patch('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.categories.update')->middleware('permission:edit categories');
            Route::delete('/categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('admin.categories.destroy')->middleware('permission:delete categories');
        });

        // 6. Products CRUD
        Route::middleware('permission:view products')->group(function () {
            Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index'])->name('admin.products.index');
            Route::get('/products/create', [\App\Http\Controllers\Admin\ProductController::class, 'create'])->name('admin.products.create')->middleware('permission:create products');
            Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store'])->name('admin.products.store')->middleware('permission:create products');
            Route::get('/products/{product}/edit', [\App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('admin.products.edit')->middleware('permission:edit products');
            Route::post('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'update'])->name('admin.products.update')->middleware('permission:edit products');
            Route::delete('/products/{product}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('admin.products.destroy')->middleware('permission:delete products');
        });

        // 7. Stock management
        Route::middleware('permission:view stock')->group(function () {
            Route::get('/stock', [\App\Http\Controllers\Admin\StockController::class, 'index'])->name('admin.stock.index');
            Route::post('/stock', [\App\Http\Controllers\Admin\StockController::class, 'store'])->name('admin.stock.store')->middleware('permission:adjust stock');
            Route::get('/stock/movements', [\App\Http\Controllers\Admin\StockController::class, 'movements'])->name('admin.stock.movements');
        });

        // 8. Stock Opname CRUD & Finalize
        Route::middleware('permission:view stock opname')->group(function () {
            Route::get('/stock-opnames', [\App\Http\Controllers\Admin\StockOpnameController::class, 'index'])->name('admin.stock-opnames.index');
            Route::post('/stock-opnames', [\App\Http\Controllers\Admin\StockOpnameController::class, 'store'])->name('admin.stock-opnames.store')->middleware('permission:create stock opname');
            Route::get('/stock-opnames/{stockOpname}', [\App\Http\Controllers\Admin\StockOpnameController::class, 'show'])->name('admin.stock-opnames.show');
            Route::post('/stock-opnames/{stockOpname}/finalize', [\App\Http\Controllers\Admin\StockOpnameController::class, 'finalize'])->name('admin.stock-opnames.finalize')->middleware('permission:finalize stock opname');
            Route::delete('/stock-opnames/{stockOpname}', [\App\Http\Controllers\Admin\StockOpnameController::class, 'destroy'])->name('admin.stock-opnames.destroy')->middleware('permission:delete stock opname');
        });

        // 9. Pricelists CRUD
        Route::middleware('permission:view pricelists')->group(function () {
            Route::get('/pricelists', [\App\Http\Controllers\Admin\PricelistController::class, 'index'])->name('admin.pricelists.index');
            Route::get('/pricelists/create', [\App\Http\Controllers\Admin\PricelistController::class, 'create'])->name('admin.pricelists.create')->middleware('permission:create pricelists');
            Route::post('/pricelists', [\App\Http\Controllers\Admin\PricelistController::class, 'store'])->name('admin.pricelists.store')->middleware('permission:create pricelists');
            Route::get('/pricelists/{pricelist}/edit', [\App\Http\Controllers\Admin\PricelistController::class, 'edit'])->name('admin.pricelists.edit')->middleware('permission:edit pricelists');
            Route::patch('/pricelists/{pricelist}', [\App\Http\Controllers\Admin\PricelistController::class, 'update'])->name('admin.pricelists.update')->middleware('permission:edit pricelists');
            Route::delete('/pricelists/{pricelist}', [\App\Http\Controllers\Admin\PricelistController::class, 'destroy'])->name('admin.pricelists.destroy')->middleware('permission:delete pricelists');
        });

        // 10. Order history & voids
        Route::middleware('permission:view transactions')->group(function () {
            Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('admin.orders.index');
            Route::get('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('admin.orders.show');
            Route::post('/orders/{order}/void', [\App\Http\Controllers\Admin\OrderController::class, 'void'])->name('admin.orders.void')->middleware('permission:void transactions');
        });

        // 11. Discounts CRUD
        Route::middleware('permission:view discounts')->group(function () {
            Route::get('/discounts', [\App\Http\Controllers\Admin\DiscountController::class, 'index'])->name('admin.discounts.index');
            Route::get('/discounts/create', [\App\Http\Controllers\Admin\DiscountController::class, 'create'])->name('admin.discounts.create')->middleware('permission:create discounts');
            Route::post('/discounts', [\App\Http\Controllers\Admin\DiscountController::class, 'store'])->name('admin.discounts.store')->middleware('permission:create discounts');
            Route::get('/discounts/{discount}/edit', [\App\Http\Controllers\Admin\DiscountController::class, 'edit'])->name('admin.discounts.edit')->middleware('permission:edit discounts');
            Route::patch('/discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'update'])->name('admin.discounts.update')->middleware('permission:edit discounts');
            Route::delete('/discounts/{discount}', [\App\Http\Controllers\Admin\DiscountController::class, 'destroy'])->name('admin.discounts.destroy')->middleware('permission:delete discounts');
        });

        // 12. Customers CRUD
        Route::middleware('permission:view customers')->group(function () {
            Route::get('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index'])->name('admin.customers.index');
            Route::get('/customers/create', [\App\Http\Controllers\Admin\CustomerController::class, 'create'])->name('admin.customers.create')->middleware('permission:create customers');
            Route::post('/customers', [\App\Http\Controllers\Admin\CustomerController::class, 'store'])->name('admin.customers.store')->middleware('permission:create customers');
            Route::get('/customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'show'])->name('admin.customers.show');
            Route::get('/customers/{customer}/edit', [\App\Http\Controllers\Admin\CustomerController::class, 'edit'])->name('admin.customers.edit')->middleware('permission:edit customers');
            Route::patch('/customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'update'])->name('admin.customers.update')->middleware('permission:edit customers');
            Route::delete('/customers/{customer}', [\App\Http\Controllers\Admin\CustomerController::class, 'destroy'])->name('admin.customers.destroy')->middleware('permission:delete customers');
        });

        // 13. Customer Returns (Retur Penjualan)
        Route::middleware('permission:view customer returns')->group(function () {
            Route::get('/customer-returns', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'index'])->name('admin.customer-returns.index');
            Route::get('/customer-returns/create', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'create'])->name('admin.customer-returns.create')->middleware('permission:create customer returns');
            Route::post('/customer-returns', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'store'])->name('admin.customer-returns.store')->middleware('permission:create customer returns');
            Route::get('/customer-returns/order/{order}', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'getOrderDetails'])->name('admin.customer-returns.order-details');
            Route::post('/customer-returns/{customerReturn}/confirm', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'confirm'])->name('admin.customer-returns.confirm')->middleware('permission:confirm customer returns');
            Route::delete('/customer-returns/{customerReturn}', [\App\Http\Controllers\Admin\CustomerReturnController::class, 'destroy'])->name('admin.customer-returns.destroy')->middleware('permission:delete customer returns');
        });

        // 14. Reports
        Route::middleware('permission:view reports')->group(function () {
            Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('admin.reports.index');
            Route::get('/reports/pdf', [\App\Http\Controllers\Admin\ReportController::class, 'exportPdf'])->name('admin.reports.pdf');
            Route::get('/reports/purchases', [\App\Http\Controllers\Admin\ReportController::class, 'purchases'])->name('admin.reports.purchases');
            Route::get('/reports/returns', [\App\Http\Controllers\Admin\ReportController::class, 'returns'])->name('admin.reports.returns');
            Route::get('/reports/profit-loss', [\App\Http\Controllers\Admin\ReportController::class, 'profitLoss'])->name('admin.reports.profit-loss')->middleware('permission:view profit loss report');
        });

        // 15. Settings
        Route::middleware('permission:view settings')->group(function () {
            Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
            Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update')->middleware('permission:edit settings');
        });

        // 16. Roles & Permissions
        Route::middleware('permission:view roles')->group(function () {
            Route::get('/roles', [\App\Http\Controllers\Admin\RolePermissionController::class, 'index'])->name('admin.roles.index');
            Route::post('/roles', [\App\Http\Controllers\Admin\RolePermissionController::class, 'storeRole'])->name('admin.roles.store')->middleware('permission:manage roles');
            Route::delete('/roles/{role}', [\App\Http\Controllers\Admin\RolePermissionController::class, 'destroyRole'])->name('admin.roles.destroy')->middleware('permission:manage roles');
            Route::post('/roles/{role}/sync', [\App\Http\Controllers\Admin\RolePermissionController::class, 'syncPermissions'])->name('admin.roles.sync')->middleware('permission:manage roles');

            Route::post('/permissions', [\App\Http\Controllers\Admin\RolePermissionController::class, 'storePermission'])->name('admin.permissions.store')->middleware('permission:manage roles');
            Route::delete('/permissions/{permission}', [\App\Http\Controllers\Admin\RolePermissionController::class, 'destroyPermission'])->name('admin.permissions.destroy')->middleware('permission:manage roles');
        });

        // Users CRUD (Protected by permissions)
        Route::middleware('permission:view users')->group(function () {
            Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        });
        Route::middleware('permission:create users')->group(function () {
            Route::get('/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
            Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
        });
        Route::middleware('permission:edit users')->group(function () {
            Route::get('/users/{userMember}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
            Route::patch('/users/{userMember}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
        });
        Route::middleware('permission:delete users')->group(function () {
            Route::delete('/users/{userMember}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
        });
    });

require __DIR__.'/auth.php';
