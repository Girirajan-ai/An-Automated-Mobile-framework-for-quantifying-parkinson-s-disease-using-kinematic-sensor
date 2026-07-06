function getMotionSupport() {
  const motionEvent = typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : null;
  const requiresPermission = !!motionEvent && typeof motionEvent.requestPermission === "function";
  const secureContext = typeof window === "undefined" ? true : window.isSecureContext;
  const protocol = typeof window === "undefined" ? "" : window.location.protocol;
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
  return {
    supported: !!motionEvent,
    requiresPermission,
    secureContext,
    protocol,
    isLocalHost,
    isIpAddress
  };
}
function motionUnavailableMessage() {
  const { supported, secureContext, protocol, isLocalHost, isIpAddress } = getMotionSupport();
  if (!secureContext && (protocol === "http:" || isIpAddress || !isLocalHost)) {
    return "Motion sensors are blocked here because this page is not on a secure HTTPS origin. Lovable works because it is served over HTTPS. Open this app through HTTPS or a trusted tunnel on your phone.";
  }
  if (!supported) {
    return "This browser does not expose motion sensor APIs.";
  }
  return "No motion data captured. Try on a phone with motion sensors.";
}
export {
  getMotionSupport as g,
  motionUnavailableMessage as m
};
