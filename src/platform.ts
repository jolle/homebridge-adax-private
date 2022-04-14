import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { AdaxPlatformAccessory } from './platformAccessory';
import { AdaxPrivateAPI } from './adax';
import { Zone } from './adaxtypes/ZonesResponse';

export class AdaxPrivateHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory<{ zone: Zone }>[] = [];

  public adax: AdaxPrivateAPI;
  public zones?: Zone[];

  private zoneAccessories: AdaxPlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.adax = new AdaxPrivateAPI(config.accountId, config.privateKey);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });

    setInterval(async () => {
      this.zones = (await this.adax.getHomeZones()).zones;
      this.zoneAccessories.forEach((zoneAccessory) =>
        zoneAccessory.updateCharacteristics(),
      );
    }, 5000);
  }

  configureAccessory(accessory: PlatformAccessory<{ zone: Zone }>) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const { zones } = await this.adax.getHomeZones();

    for (const zone of zones) {
      if (!this.isDeviceIncluded(zone)) {
        continue;
      }

      const uuid = this.api.hap.uuid.generate(zone.id.toString());

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid,
      );

      if (existingAccessory) {
        this.log.info(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName,
        );

        this.zoneAccessories.push(
          new AdaxPlatformAccessory(this, existingAccessory),
        );
      } else {
        this.log.info('Adding new zone (accessory):', zone.name);

        const accessory = new this.api.platformAccessory<{ zone: Zone }>(
          zone.name,
          uuid,
        );

        accessory.context.zone = zone;

        this.zoneAccessories.push(new AdaxPlatformAccessory(this, accessory));

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }
  }

  /**
   * Checks if the given zone should be included,
   * if one of these conditions are met:
   *  - no specific zones or groups configured
   *  - given zone is within allowed zones
   *  - given zone is within an allowed group
   *
   * @param zone the zone to check
   */
  private isDeviceIncluded(zone: Zone) {
    if (!this.config.zones && !this.config.groups) {
      return true;
    }

    return !!(
      this.config.zones?.some((name) => zone.name === name) ||
      this.config.groups?.some((group) => zone.groupName === group)
    );
  }
}
