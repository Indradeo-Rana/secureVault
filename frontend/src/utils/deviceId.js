
export const getDeviceId = () => {
    let deviceId = localStorage.getItem("securevault_device_id");

    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(
            "securevault_device_id",
            deviceId
        );
    }

    // Also store device ID in cookie.
    // OAuth2 callback can read this cookie on the backend.
    document.cookie =
        `securevault_device_id=${encodeURIComponent(deviceId)}; Path=/; SameSite=Lax`;

    return deviceId;
};

