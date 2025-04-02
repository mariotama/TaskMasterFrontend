import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { Equipment, UserEquipment } from '../../shared/models/equipment.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private apiService = inject(ApiService);

  /**
   * Get the catalog of equipment available in the shop
   */
  getShopCatalog(): Observable<Equipment[]> {
    return this.apiService.get<Equipment[]>('shop');
  }

  /**
   * Get user's inventory (owned equipment)
   */
  getUserInventory(): Observable<UserEquipment[]> {
    return this.apiService.get<UserEquipment[]>('shop/inventory');
  }

  /**
   * Purchase an equipment item
   * @param equipmentId ID of the equipment to purchase
   */
  purchaseEquipment(equipmentId: number): Observable<UserEquipment> {
    return this.apiService.post<UserEquipment>(
      `shop/purchase/${equipmentId}`,
      {}
    );
  }

  /**
   * Equip an item from the user's inventory
   * @param userEquipmentId ID of the user equipment to equip
   */
  equipItem(userEquipmentId: number): Observable<UserEquipment> {
    return this.apiService.post<UserEquipment>(
      `shop/equip/${userEquipmentId}`,
      {}
    );
  }

  /**
   * Unequip an item from the user's inventory
   * @param userEquipmentId ID of the user equipment to unequip
   */
  unequipItem(userEquipmentId: number): Observable<UserEquipment> {
    return this.apiService.post<UserEquipment>(
      `shop/unequip/${userEquipmentId}`,
      {}
    );
  }

  /**
   * Get equipment stats and bonuses
   */
  getEquipmentStats(): Observable<{
    xpBonus: number;
    coinBonus: number;
    equippedItems: number;
    itemsByType: Record<string, boolean>;
  }> {
    return this.apiService.get<{
      xpBonus: number;
      coinBonus: number;
      equippedItems: number;
      itemsByType: Record<string, boolean>;
    }>('shop/stats');
  }
}
