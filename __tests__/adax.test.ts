// mocking time and random for SecureRandom
jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);

import { AdaxPrivateAPI } from '../src/adax';
import { jbb } from '../src/JByteBuffer';

const TEST_PRIVATE_KEY =
  '30:82:01:06:02:01:00:30:81:E8:06:07:2A:86:48:CE:38:04:01:30:81:DC:02:61:00:E9:E6:42:59:9D:35:5F:37:C9:7F:FD:35:67:12:0B:8E:25:C9:CD:43:E9:27:B3:A9:67:0F:BE:C5:D8:90:14:19:22:D2:C3:B3:AD:24:80:09:37:99:86:9D:1E:84:6A:AB:49:FA:B0:AD:26:D2:CE:6A:22:21:9D:47:0B:CE:7D:77:7D:4A:21:FB:E9:C2:70:B5:7F:60:70:02:F3:CE:F8:39:36:94:CF:45:EE:36:88:C1:1A:8C:56:AB:12:7A:3D:AF:02:15:00:9C:DB:D8:4C:9F:1A:C2:F3:8D:0F:80:F4:2A:B9:52:E7:33:8B:F5:11:02:60:30:47:0A:D5:A0:05:FB:14:CE:2D:9D:CD:87:E3:8B:C7:D1:B1:C5:FA:CB:AE:CB:E9:5F:19:0A:A7:A3:1D:23:C4:DB:BC:BE:06:17:45:44:40:1A:5B:2C:02:09:65:D8:C2:BD:21:71:D3:66:84:45:77:1F:74:BA:08:4D:20:29:D8:3C:1C:15:85:47:F3:A9:F1:A2:71:5B:E2:3D:51:AE:4D:3E:5A:1F:6A:70:64:F3:16:93:3A:34:6D:3F:52:92:52:04:16:02:14:34:A4:CC:4E:28:DC:EF:78:9A:49:EA:BA:2C:43:FD:B9:C4:0E:3C:05';

describe('AdaxPrivateAPI', () => {
  it('calculates the signature correctly', () => {
    const api = new AdaxPrivateAPI(1, TEST_PRIVATE_KEY);
    const signature = api['signData']([jbb.int(10), jbb.long(200)]);
    expect(signature).toBe(
      '302C02146032796F5AF1E41B9E8CA96330C2AD279B01ED08021462826DB45DEEE44BE573199634DC74184B68E99D',
    );
  });
});
