import LocalizedStrings from 'react-localization';

export default new LocalizedStrings({
  en: {
    marks: {
      Kill: { single: 'Kill', plural: 'Kills' },
      Death: { single: 'Death', plural: 'Deaths' },
      CarePackage: { single: 'Care Package', plural: 'Care Packages' },
    },
    items: {
      // Equipment
      // --Backpacks
      Item_Back_B_01_StartParachutePack_C: 'Parachute',
      Item_Back_E_01_Lv1_C: 'Backpack (Level 1)',
      Item_Back_E_02_Lv1_C: 'Backpack (Level 1)',
      Item_Back_F_01_Lv2_C: 'Backpack (Level 2)',
      Item_Back_F_02_Lv2_C: 'Backpack (Level 2)',
      Item_Back_C_01_Lv3_C: 'Backpack (Level 3)',
      Item_Back_C_02_Lv3_C: 'Backpack (Level 3)',
      // --Helmets
      Item_Head_E_01_Lv1_C: 'Motorcycle Helmet (Level 1)',
      Item_Head_E_02_Lv1_C: 'Motorcycle Helmet (Level 1)',
      Item_Head_F_01_Lv2_C: 'Military Helmet (Level 2)',
      Item_Head_F_02_Lv2_C: 'Military Helmet (Level 2)',
      Item_Head_G_01_Lv3_C: 'Military Helmet (Level 3)',
      // --Vests
      Item_Armor_E_01_Lv1_C: 'Police Vest (Level 1)',
      Item_Armor_D_01_Lv2_C: 'Police Vest (Level 2)',
      Item_Armor_C_01_Lv3_C: 'Military Vest (Level 3)',

      // Weapons
      // --Melee
      Item_Weapon_Cowbar_C: 'Crowbar',
      Item_Weapon_Machete_C: 'Machete',
      Item_Weapon_Pan_C: 'Pan',
      Item_Weapon_Sickle_C: 'Sickle',
      // --Shitty
      Item_Weapon_Crossbow_C: 'Crossbow',
      // --Pistols
      Item_Weapon_M9_C: 'P92',
      Item_Weapon_G18_C: 'P18C',
      Item_Weapon_M1911_C: 'P1911',
      // --Shotgun
      Item_Weapon_Berreta686_C: 'S686',
      Item_Weapon_Saiga12_C: 'S12K',
      // --SMGs
      Item_Weapon_UZI_C: 'Micro Uzi',
      Item_Weapon_UMP_C: 'UMP9',
      Item_Weapon_Thompson_C: 'Tommy Gun',
      Item_Weapon_Vector_C: 'Vector',
      // --ARs
      Item_Weapon_M16A4_C: 'M16A4',
      'Item_Weapon_SCAR-L_C': 'SCAR-L',
      Item_Weapon_HK416_C: 'M416',
      Item_Weapon_AUG_C: 'AUG A3',
      Item_Weapon_M249_C: 'M249',
      Item_Weapon_DP28_C: 'DP28',
      Item_Weapon_AK47_C: 'AK47',
      Item_Weapon_Groza_C: 'Groza',
      // --DMRs
      Item_Weapon_Mini14_C: 'Mini 14',
      Item_Weapon_SKS_C: 'SKS',
      Item_Weapon_FNFal_C: 'SLR',
      Item_Weapon_Mk14_C: 'Mk14',
      // --SRs
      Item_Weapon_VSS_C: 'VSS',
      Item_Weapon_Kar98k_C: 'Kar98k',
      Item_Weapon_M24_C: 'M24',
      Item_Weapon_AWM_C: 'AWM',
      Item_Weapon_Winchester_C: 'Winchester Model 1894',
      // --IDK
      Item_Weapon_NagantM1895_C: 'Nagant FIXME',

      // Attachments
      // --Optics
      Item_Attach_Weapon_Upper_Holosight_C: 'Holographic Sight',
      Item_Attach_Weapon_Upper_DotSight_01_C: 'Red Dot Sight',
      Item_Attach_Weapon_Upper_Aimpoint_C: '2x Scope',
      Item_Attach_Weapon_Upper_Scope3x_C: '3x Scope',
      Item_Attach_Weapon_Upper_ACOG_01_C: '4x Scope',
      Item_Attach_Weapon_Upper_Scope6x_C: '6x Scope',
      Item_Attach_Weapon_Upper_CQBSS_C: '8x Scope',
      // --Barrel
      Item_Attach_Weapon_Muzzle_Choke_C: 'Choke', // IDK
      Item_Attach_Weapon_Muzzle_Duckbill_C: 'Duckbill Choke',
      Item_Attach_Weapon_Muzzle_Suppressor_Small_C: 'Suppressor (Pistol)',
      Item_Attach_Weapon_Muzzle_FlashHider_Medium_C: 'Flash Hider (SMG)',
      Item_Attach_Weapon_Muzzle_Compensator_Medium_C: 'Compensator (SMG)',
      Item_Attach_Weapon_Muzzle_Suppressor_Medium_C: 'Suppressor (SMG)',
      Item_Attach_Weapon_Muzzle_FlashHider_Large_C: 'Flash Hider (AR)',
      Item_Attach_Weapon_Muzzle_Compensator_Large_C: 'Compensator (AR)',
      Item_Attach_Weapon_Muzzle_Suppressor_Large_C: 'Suppressor (AR)',
      Item_Attach_Weapon_Muzzle_FlashHider_SniperRifle_C: 'Flash Hider (SR)',
      Item_Attach_Weapon_Muzzle_Compensator_SniperRifle_C: 'Compensator (SR)',
      Item_Attach_Weapon_Muzzle_Suppressor_SniperRifle_C: 'Suppressor (SR)',
      // --Grip
      Item_Attach_Weapon_Lower_LightweightForeGrip_C: 'Lightweight Grip',
      Item_Attach_Weapon_Lower_ThumbGrip_C: 'Thumb Grip',
      Item_Attach_Weapon_Lower_HalfGrip_C: 'Half Grip',
      Item_Attach_Weapon_Lower_AngledForeGrip_C: 'Angled Foregrip',
      Item_Attach_Weapon_Lower_Foregrip_C: 'Vertical Foregrip',
      // --Magazine
      Item_Attach_Weapon_Magazine_QuickDraw_Small_C: 'Quickdraw Magazine (Pistol)',
      Item_Attach_Weapon_Magazine_Extended_Small_C: 'Extended Magazine (Pistol)',
      Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Small_C: 'Extended Quickdraw Magazine (Pistol)',
      Item_Attach_Weapon_Magazine_QuickDraw_Medium_C: 'Quickdraw Magazine (SMG)',
      Item_Attach_Weapon_Magazine_Extended_Medium_C: 'Extended Magazine (SMG)',
      Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Medium_C: 'Extended Quickdraw Magazine (SMG)',
      Item_Attach_Weapon_Magazine_Extended_Large_C: 'Extended Magazine (AR)',
      Item_Attach_Weapon_Magazine_ExtendedQuickDraw_Large_C: 'Extended Quickdraw Magazine (AR)',
      Item_Attach_Weapon_Magazine_QuickDraw_Large_C: 'Quickdraw Magazine (AR)',
      Item_Attach_Weapon_Magazine_Extended_SniperRifle_C: 'Extended Magazine (SR)',
      Item_Attach_Weapon_Magazine_ExtendedQuickDraw_SniperRifle_C: 'Extended Quickdraw Magazine (SR)',
      // --Stock
      Item_Attach_Weapon_Lower_QuickDraw_Large_Crossbow_C: 'Quiver',
      Item_Attach_Weapon_Stock_UZI_C: 'Micro Uzi Stock',
      Item_Attach_Weapon_Stock_AR_Composite_C: 'Tactical Stock',
      Item_Attach_Weapon_Stock_SniperRifle_CheekPad_C: 'Cheek Pad (SR)',
      Item_Attach_Weapon_Stock_Shotgun_BulletLoops_C: 'Bullet Loops (Shotgun)',
      Item_Attach_Weapon_Stock_SniperRifle_BulletLoops_C: 'Bullet Loops (SR)',

      // Ammo
      Item_Ammo_Bolt_C: 'Bolt',
      Item_Ammo_12Guage_C: '12 Gauge Ammo',
      Item_Ammo_9mm_C: '9mm Ammo',
      Item_Ammo_45ACP_C: '.45 ACP Ammo',
      Item_Ammo_556mm_C: '5.56mm Ammo',
      Item_Ammo_762mm_C: '7.62mm Ammo',
      Item_Ammo_300Magnum_C: '.300 Magnum Ammo',

      // Grenades
      Item_Weapon_FlashBang_C: 'Stun Grenade',
      Item_Weapon_Molotov_C: 'Molotov',
      Item_Weapon_SmokeBomb_C: 'Smoke Grenade',
      Item_Weapon_Grenade_C: 'Frag Grenade',

      // Meds
      Item_Heal_Bandage_C: 'Bandage',
      Item_Heal_FirstAid_C: 'First Aid Kit',
      Item_Heal_MedKit_C: 'Medkit',
      Item_Boost_EnergyDrink_C: 'Energy Drink',
      Item_Boost_PainKiller_C: 'Painkiller',
      Item_Boost_AdrenalineSyringe_C: 'Adrenaline Syringe',

      // Misc
      Item_Ghillie_01_C: 'Ghillie Suit',
      Item_JerryCan_C: 'Gas Can',
    },
    vehicles: {
      ParachutePlayer_C: 'Parachute',
      DummyTransportAircraft_C: 'Plane',
      Buggy_A_01_C: 'Buggy',
      Buggy_A_02_C: 'Buggy',
      Buggy_A_03_C: 'Buggy',
      Dacia_A_01_v2_C: 'Dacia',
      Dacia_A_02_v2_C: 'Dacia',
      Dacia_A_03_v2_C: 'Dacia',
      Dacia_A_04_v2_C: 'Dacia',
      BP_Motorbike_04_C: 'Motorcycle',
      BP_Motorbike_04_SideCar_C: '3-Seat Motorcycle',
      Uaz_A_01_C: 'UAZ',
      Uaz_B_01_C: 'UAZ',
      Uaz_C_01_C: 'UAZ',
      Boat_PG117_C: 'Boat',
      AquaRail_A_01_C: 'AquaRail',
    },
  },
});