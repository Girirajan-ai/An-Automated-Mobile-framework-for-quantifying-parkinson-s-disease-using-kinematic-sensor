/** Dev manifest stub — must not use empty clientEntry (causes React empty href warnings). */
export function tsrStartManifest() {
  return {
    routes: {},
    clientEntry: "/@id/virtual:tanstack-start-dev-client-entry",
  };
}
