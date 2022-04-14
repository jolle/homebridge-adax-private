import axios from 'axios';
import ByteBuffer from 'bytebuffer';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import { jbb, JByteBufferElement } from './JByteBuffer';
import { KEYUTIL, KJUR } from 'jsrsasign';
import { Device, Zone, ZonesResponse } from './adaxtypes/ZonesResponse';

export class AdaxPrivateAPI {
  private axios = axios.create({
    baseURL: 'https://smart-apps-1.adax.no/sheater-client-api',
  });

  private key: KJUR.crypto.DSA;

  constructor(private accountID: number, privateKey: string) {
    this.key = (KEYUTIL as unknown as InstanceType<typeof KEYUTIL>) // incorrect typings: KEYUTIL is not a class.
      .getKeyFromPlainPrivatePKCS8Hex(
        privateKey.replace(/:/g, '').toLowerCase(),
      ) as KJUR.crypto.DSA;
  }

  /**
   * Constructs an array of {@link JByteBufferElement}s into a buffer
   * and signs it using DSA-SHA1 and the class-bound key.
   *
   * @param signatureParams list of params to include in the signing
   * @returns an uppercase hex-encoded signature
   */
  private signData(signatureParams: JByteBufferElement<unknown>[]) {
    const buffer = new ByteBuffer(undefined, false);

    for (const param of signatureParams) {
      param.encode(buffer);
    }

    const finalBuffer = buffer.buffer.slice(0, buffer.offset);

    const sig = new KJUR.crypto.Signature({ alg: 'SHA1withDSA' });
    sig.init(this.key);
    sig.updateHex(finalBuffer.toString('hex'));

    return sig.sign().toUpperCase();
  }

  /**
   * Makes a POST request to the Adax API, and creates and
   * adds the signature to the request.
   *
   * @param url the API endpoint URL
   * @param signatureParams list of params to include in the signing
   * @param postData optional additional post data
   * @returns the JSON-decoded response
   */
  private async request<R>(
    url: string,
    signatureParams: JByteBufferElement<unknown>[],
    postData: ParsedUrlQueryInput = {},
  ) {
    const { data } = await this.axios.post<
      { errorTypeId: number } | [{ errorTypeId: number }, R]
    >(
      url,
      stringify({
        ...postData,
        signature: this.signData(signatureParams),
      }),
    );

    if (!(data instanceof Array)) {
      throw Error(`Adax error: ${data.errorTypeId} (1) (${url})`);
    }

    if (data[0].errorTypeId !== 0) {
      throw Error(`Adax error: ${data[0].errorTypeId} (2) (${url})`);
    }

    return data[1];
  }

  /**
   * Gets the zones, user groups and devices associated with
   * this account.
   */
  getHomeZones() {
    const timestamp = Math.floor(Date.now() / 1000);
    return this.request<ZonesResponse>(
      `/rest/zones/homes_info/3/${this.accountID}/${timestamp}`,
      [jbb.long(3), jbb.long(this.accountID), jbb.long(timestamp)],
    );
  }

  getDevices() {
    return this.request<Device[]>(`/rest/heaters/list/2/${this.accountID}`, [
      jbb.long(2),
      jbb.long(this.accountID),
    ]);
  }

  /**
   * Sets the target temperature of the given zone. Note that
   * temperature does not have decimals, it is multiplied by
   * 100 (e.g. 4.5°C = 450).
   *
   * @param zoneID the zone ID
   * @param temp temperature in degrees Celsius **times 100**
   * @returns the affected zone
   */
  setZoneTemperature(zoneID: number, temp: number) {
    return this.request<Zone>(
      `/rest/zones/${zoneID}/target_temperature/${this.accountID}/${temp}`,
      [jbb.long(zoneID), jbb.long(this.accountID), jbb.int(temp)],
    );
  }
}
