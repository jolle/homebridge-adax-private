# Homebridge Adax (Private API)

This plugin uses the private Adax API used in their mobile apps; this way it is possible to use devices that are shared with your account. The public API only shows devices that you own, not shared ones.

## Getting the private key

The private API uses a signature generated with a user-specific private key to authenticate requests. Additionally, the account ID (login ID) is present in many requests. To get the private key and account ID, visit `https://smart-apps-1.adax.no/sheater-client-api/oauth?type=[provider]` where the provider is one of these: `"facebook", "google", "twitter", "live", "linkedin", "yahoo", "apple"`. (Username-password authentication is handled by another endpoint.)

After following the redirect and logging in, you will be redirected back and a JSON response will be displayed, like this: `[{"errorTypeId":0},{"id":[account ID],"privateKey":"[private key]","termsAcceptDate":0,"hasDevices":true,"googleHomeLinked":false}]`. Copy the account ID and private key (without quotation marks) and paste them in the config.

## Devices = zones?

The Adax API recognizes the existence of individual, real devices but only provides temperature controlling and status indication on a per-zone basis. Thus, this plugin will create each zone as a device, so you can not see the data from or control specific devices, only zones. A trick one can do is to only have one device per zone, effectively making the concept of "zones" and "devices" equivalent.
