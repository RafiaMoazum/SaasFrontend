import { v4 as uuidv4 } from "uuid";

export const getDeviceInfo = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
    }

    const ua = navigator.userAgent;
    const platform = navigator.platform || "Unknown";
    const deviceName = `${platform} - ${ua.split(")")[0].slice(0, 50)}`; 
   

    return {
        deviceId,
        deviceName
       
    };
};
