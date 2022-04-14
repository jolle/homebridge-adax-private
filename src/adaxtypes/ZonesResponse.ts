export interface Zone {
  groupId: number;
  groupName: string;
  id: number;
  userIsOwner: boolean;
  adaptiveStartEnabled: boolean;
  away: boolean;
  awayMode: number;
  awayTemperature: number;
  currentHeatingMode: number;
  currentTemperature: number;
  heatersLocked: boolean;
  heatingModeName: string;
  lowerTemperatureLimit: number;
  manualSchedule: boolean;
  manualTemperature: number;
  name: string;
  openWindow: boolean;
  openWindowDetectionEnabled: boolean;
  outdatedTemperature: boolean;
  scheduledHeatingMode: number;
  scheduleId: number;
  scheduleName: string;
  scheduleTargetTemperature: number;
  targetTemperature: number;
  temperatureCalibration: number;
  temperatureEventsEnabled: boolean;
  toHour: number;
  toMinute: number;
  toWeekDay: number;
  upperTemperatureLimit: number;
  weekEnergy: number;
  weekEnergyPrevious: boolean;
  heatingMode: number;
}

export interface UserGroup {
  groupId: number;
  groupName: string;
  userIsOwner: boolean;
  houseTypeId: number;
  userId: number;
  weekEnergyPrevious: boolean;
  timeZone: string;
  userSelectedLocation: boolean;
  weekEnergy?: number;
}

export interface Device {
  groupId: number;
  groupName: string;
  id: number;
  userIsOwner: boolean;
  autoUpdate: boolean;
  calibrationTemperature: number;
  currentTemperature: number;
  firmware: string;
  hardware: string;
  hasFirmwareUpdate: boolean;
  ip: string;
  lastSeen: number;
  localPassword: string;
  macId: number;
  name: string;
  plugManualControl: boolean;
  plugTargetState: boolean;
  reportingInterval: number;
  targetTemperature: number;
  type: number;
  zone: number;
  state: number;
  zoneName: string;
  ratedPower: number;
  envNo: number;
}

export interface ZonesResponse {
  zones: Zone[];
  userGroups: UserGroup[];
  devices: Device[];
  enabledIntegrations: unknown[];
}
