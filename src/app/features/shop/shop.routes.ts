import { Routes } from '@angular/router';
import { ShopComponent } from './pages/shop/shop.component';
import { InventoryComponent } from './pages/inventory/inventory.component';

export const SHOP_ROUTES: Routes = [
  { path: '', component: ShopComponent },
  { path: 'inventory', component: InventoryComponent },
];
