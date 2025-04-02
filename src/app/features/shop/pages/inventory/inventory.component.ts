import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService } from '../../../../shared/services/shop.service';
import {
  EquipmentType,
  Rarity,
  UserEquipment,
} from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  private shopService = inject(ShopService);

  // Signals
  inventory = signal<UserEquipment[]>([]);
  filteredInventory = signal<UserEquipment[]>([]);
  equipmentStats = signal<{
    xpBonus: number;
    coinBonus: number;
    equippedItems: number;
    itemsByType: Record<string, boolean>;
  } | null>(null);
  isLoading = signal<boolean>(true);
  currentFilter = signal<string>('all');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isUpdating = signal<number | null>(null);

  // Enum mappings for template
  equipmentTypes = EquipmentType;
  rarities = Rarity;

  ngOnInit(): void {
    this.loadInventory();
    this.loadEquipmentStats();
  }

  loadInventory(): void {
    this.shopService.getUserInventory().subscribe({
      next: (inventory) => {
        this.inventory.set(inventory);
        this.applyFilter(this.currentFilter());
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading inventory', err);
        this.errorMessage.set(
          'Failed to load your inventory. Please try again.'
        );
        this.isLoading.set(false);
      },
    });
  }

  loadEquipmentStats(): void {
    this.shopService.getEquipmentStats().subscribe({
      next: (stats) => {
        this.equipmentStats.set(stats);
      },
      error: (err) => {
        console.error('Error loading equipment stats', err);
      },
    });
  }

  applyFilter(filter: string): void {
    this.currentFilter.set(filter);

    if (filter === 'all') {
      this.filteredInventory.set(this.inventory());
      return;
    }

    if (filter === 'equipped') {
      this.filteredInventory.set(
        this.inventory().filter((item) => item.isEquipped)
      );
      return;
    }

    // Check if filter is a type (head, body, accessory)
    const isType = Object.values(EquipmentType).includes(
      filter as EquipmentType
    );

    if (isType) {
      this.filteredInventory.set(
        this.inventory().filter((item) => item.equipment.type === filter)
      );
    } else {
      // Filter by rarity
      this.filteredInventory.set(
        this.inventory().filter((item) => item.equipment.rarity === filter)
      );
    }
  }

  equipItem(userEquipmentId: number): void {
    this.isUpdating.set(userEquipmentId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.shopService.equipItem(userEquipmentId).subscribe({
      next: (result) => {
        // Find the old equipped item of the same type and update
        const equipmentType = this.getEquipmentTypeById(userEquipmentId);
        this.inventory.update((items) =>
          items.map((item) => {
            if (item.id === userEquipmentId) {
              return { ...item, isEquipped: true };
            } else if (
              item.equipment.type === equipmentType &&
              item.isEquipped
            ) {
              return { ...item, isEquipped: false };
            }
            return item;
          })
        );

        this.applyFilter(this.currentFilter());
        this.loadEquipmentStats(); // Refresh stats

        this.successMessage.set(
          `${result.equipment.name} equipped successfully!`
        );
        this.isUpdating.set(null);
      },
      error: (err) => {
        console.error('Error equipping item', err);
        this.errorMessage.set(
          err.error?.message || 'Failed to equip item. Please try again.'
        );
        this.isUpdating.set(null);
      },
    });
  }

  unequipItem(userEquipmentId: number): void {
    this.isUpdating.set(userEquipmentId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.shopService.unequipItem(userEquipmentId).subscribe({
      next: (result) => {
        // Update inventory
        this.inventory.update((items) =>
          items.map((item) => {
            if (item.id === userEquipmentId) {
              return { ...item, isEquipped: false };
            }
            return item;
          })
        );

        this.applyFilter(this.currentFilter());
        this.loadEquipmentStats(); // Refresh stats

        this.successMessage.set(
          `${result.equipment.name} unequipped successfully!`
        );
        this.isUpdating.set(null);
      },
      error: (err) => {
        console.error('Error unequipping item', err);
        this.errorMessage.set(
          err.error?.message || 'Failed to unequip item. Please try again.'
        );
        this.isUpdating.set(null);
      },
    });
  }

  getEquipmentTypeById(userEquipmentId: number): string {
    const item = this.inventory().find((i) => i.id === userEquipmentId);
    return item ? item.equipment.type : '';
  }

  getRarityClass(rarity: string): string {
    switch (rarity) {
      case Rarity.COMMON:
        return 'rarity-common';
      case Rarity.RARE:
        return 'rarity-rare';
      case Rarity.EPIC:
        return 'rarity-epic';
      default:
        return '';
    }
  }
}
