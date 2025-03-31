/**
 * Enum for equipment types
 */
export enum EquipmentType {
  HEAD = 'head',
  BODY = 'body',
  ACCESSORY = 'accessory',
}

/**
 * Enum for equipment rarity
 */
export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
}

/**
 * Interface representing equipment in the catalog
 */
export interface Equipment {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: EquipmentType;
  rarity: Rarity;
  price: number;
  stats: {
    xpBonus?: number;
    coinBonus?: number;
  };
  requiredLevel: number;
}

/**
 * Interface representing equipment owned by a user
 */
export interface UserEquipment {
  id: number;
  isEquipped: boolean;
  acquiredAt: Date;
  userId: number;
  equipment: {
    id: number;
    name: string;
    icon: string;
    type: string;
    rarity: string;
    stats: {
      xpBonus?: number;
      coinBonus?: number;
    };
  };
}
