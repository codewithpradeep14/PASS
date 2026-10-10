import { solamiClient } from "./solami/solamiClient";
import { meteoraClient } from "./meteora/meteoraClient";
import { pantaClient } from "./panta/pantaClient";
import { SolamiConnectionStatus } from "./solami/types";
import { MeteoraConnectionStatus } from "./meteora/types";
import { PantaConnectionStatus } from "./panta/types";

export interface SystemIntegrationsStatus {
  solami: SolamiConnectionStatus;
  meteora: MeteoraConnectionStatus;
  panta: PantaConnectionStatus;
  summary: {
    totalModules: number;
    connectedCount: number;
    demoCount: number;
    unconfiguredCount: number;
  };
}

export async function getIntegrationsStatus(): Promise<SystemIntegrationsStatus> {
  const [solami, meteora, panta] = await Promise.all([
    solamiClient.checkConnection(),
    meteoraClient.checkConnection(),
    pantaClient.checkConnection(),
  ]);

  const statuses = [solami.state, meteora.state, panta.state];
  const connectedCount = statuses.filter((s) => s === "Connected").length;
  const demoCount = statuses.filter((s) => s === "Demo mode").length;
  const unconfiguredCount = statuses.filter((s) => s === "Not configured").length;

  return {
    solami,
    meteora,
    panta,
    summary: {
      totalModules: 3,
      connectedCount,
      demoCount,
      unconfiguredCount,
    },
  };
}
