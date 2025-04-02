import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShopService } from '../../../../shared/services/shop.service';
import { WalletService } from '../../../../shared/services/wallet.service';
import {
  Equipment,
  EquipmentType,
  Rarity,
} from '../../../../shared/models/equipment.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  private walletService = inject(WalletService);
  private authService = inject(AuthService);

  // Signals
  equipment = signal<Equipment[]>([]);
  filteredEquipment = signal<Equipment[]>([]);
  walletBalance = signal<number>(0);
  isLoading = signal<boolean>(true);
  currentFilter = signal<string>('all');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isPurchasing = signal<number | null>(null);

  // User info
  userLevel = this.authService.currentUser()?.level || 1;

  // Enum mappings for template
  equipmentTypes = EquipmentType;
  rarities = Rarity;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load wallet information
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.walletBalance.set(wallet.coins);
      },
      error: (err) => {
        console.error('Error loading wallet', err);
      },
    });

    // Load shop catalog
    this.shopService.getShopCatalog().subscribe({
      next: (catalog) => {
        this.equipment.set(catalog);
        this.applyFilter(this.currentFilter());
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading shop catalog', err);
        this.errorMessage.set(
          'Failed to load the shop catalog. Please try again.'
        );
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(filter: string): void {
    this.currentFilter.set(filter);

    if (filter === 'all') {
      this.filteredEquipment.set(this.equipment());
      return;
    }

    // Check if filter is a type (head, body, accessory)
    const isType = Object.values(EquipmentType).includes(
      filter as EquipmentType
    );

    if (isType) {
      this.filteredEquipment.set(
        this.equipment().filter((item) => item.type === filter)
      );
    } else {
      // Filter by rarity
      this.filteredEquipment.set(
        this.equipment().filter((item) => item.rarity === filter)
      );
    }
  }

  purchaseItem(equipmentId: number): void {
    // Set purchasing state
    this.isPurchasing.set(equipmentId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.shopService.purchaseEquipment(equipmentId).subscribe({
      next: (result) => {
        // Update wallet balance
        this.walletBalance.update(
          (balance) => balance - this.getItemPrice(equipmentId)
        );

        // Remove item from shop list
        this.equipment.update((items) =>
          items.filter((item) => item.id !== equipmentId)
        );
        this.applyFilter(this.currentFilter());

        // Show success message
        this.successMessage.set(
          `You've successfully purchased ${result.equipment.name}!`
        );
        this.isPurchasing.set(null);
      },
      error: (err) => {
        console.error('Error purchasing item', err);
        this.errorMessage.set(
          err.error?.message || 'Failed to purchase item. Please try again.'
        );
        this.isPurchasing.set(null);
      },
    });
  }

  getItemPrice(equipmentId: number): number {
    const item = this.equipment().find((i) => i.id === equipmentId);
    return item ? item.price : 0;
  }

  canPurchase(item: Equipment): boolean {
    return (
      this.walletBalance() >= item.price && this.userLevel >= item.requiredLevel
    );
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
