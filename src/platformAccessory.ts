import {
  Service,
  PlatformAccessory,
  CharacteristicGetCallback,
  CharacteristicEventTypes,
  CharacteristicValue,
  CharacteristicSetCallback,
} from 'homebridge';
import { Zone } from './adaxtypes/ZonesResponse';

import { AdaxPrivateHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class AdaxPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: AdaxPrivateHomebridgePlatform,
    private readonly accessory: PlatformAccessory<{ zone: Zone }>,
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'ADAX')
      .setCharacteristic(this.platform.Characteristic.Model, 'N/A')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'N/A');

    // a thermostat can have a target temperature
    this.service =
      this.accessory.getService(this.platform.Service.Thermostat) ??
      this.accessory.addService(this.platform.Service.Thermostat);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.zone.name,
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on(CharacteristicEventTypes.GET, this.getCurrentTemperature.bind(this));
    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .on(CharacteristicEventTypes.SET, this.setTargetTemperature.bind(this))
      .on(CharacteristicEventTypes.GET, this.getTargetTemperature.bind(this));
    this.service
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .on(
        CharacteristicEventTypes.GET,
        this.getTemperatureDisplayUnits.bind(this),
      );
    this.service
      .getCharacteristic(
        this.platform.Characteristic.CurrentHeatingCoolingState,
      )
      .on(CharacteristicEventTypes.GET, this.getCurrentHeatingState.bind(this));
    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .on(CharacteristicEventTypes.SET, this.setTargetHeatingState.bind(this))
      .on(CharacteristicEventTypes.GET, this.getTargetHeatingState.bind(this));
  }

  private getZoneFromPlatform() {
    return this.platform.zones?.find(
      (z) => z.id === this.accessory.context.zone.id,
    );
  }

  /**
   * If there is no target temperature (i.e., it is 0), the heating is off.
   * Otherwise, if the target temperature is less than the current
   * temperature, it is cooling (passively); otherwise it is (should be) heating.
   */
  private getCurrentHeatingState(callback: CharacteristicGetCallback) {
    const zone = this.getZoneFromPlatform();
    callback(
      null,
      (zone?.targetTemperature ?? 0) !== 0
        ? zone!.targetTemperature < zone!.currentTemperature
          ? this.platform.Characteristic.CurrentHeatingCoolingState.COOL
          : this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
        : this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
    );
  }

  /**
   * If there is a target temperature set, heating is essentially
   * enabled.
   */
  private getTargetHeatingState(callback: CharacteristicGetCallback) {
    const zone = this.getZoneFromPlatform();
    callback(
      null,
      (zone?.targetTemperature ?? 0) !== 0
        ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
        : this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
    );
  }

  private getCurrentTemperature(callback: CharacteristicGetCallback) {
    const zone = this.getZoneFromPlatform();
    callback(null, (zone?.currentTemperature ?? 0) / 100);
  }

  private getTargetTemperature(callback: CharacteristicGetCallback) {
    const zone = this.getZoneFromPlatform();
    callback(null, Math.max(10, (zone?.targetTemperature ?? 0) / 100));
  }

  private setTargetTemperature(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) {
    this.platform.adax.setZoneTemperature(
      this.accessory.context.zone.id,
      +value * 100,
    );
    callback(null);
  }

  private setTargetHeatingState(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) {
    if (value === this.platform.Characteristic.TargetHeatingCoolingState.OFF) {
      this.platform.adax.setZoneTemperature(this.accessory.context.zone.id, 0);
    } else {
      this.platform.adax.setZoneTemperature(
        this.accessory.context.zone.id,
        1000,
      );
    }
    callback(null);
  }

  private getTemperatureDisplayUnits(callback: CharacteristicGetCallback) {
    callback(
      null,
      this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS,
    );
  }

  /**
   * Updates all characteristics based on the updated zone
   * data.
   */
  updateCharacteristics() {
    const zone = this.getZoneFromPlatform();

    if (!zone) {
      return;
    }

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .updateValue(zone.currentTemperature / 100);
    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .updateValue(Math.max(10, zone.targetTemperature / 100));
    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .updateValue(
        (zone.targetTemperature ?? 0) !== 0
          ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
          : this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
      );
    this.service
      .getCharacteristic(
        this.platform.Characteristic.CurrentHeatingCoolingState,
      )
      .updateValue(
        (zone.targetTemperature ?? 0) !== 0
          ? zone.targetTemperature > zone!.currentTemperature
            ? this.platform.Characteristic.CurrentHeatingCoolingState.COOL
            : this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
          : this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
      );
  }
}
