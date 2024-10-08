import { WebPartContext } from '@microsoft/sp-webpart-base';
import { LogLevel, PnPLogging } from '@pnp/logging';
import { spfi, SPFI, SPFx, Telemetry } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

let _sp: SPFI = null;

export const getSP = (context?: WebPartContext): SPFI => {
    if (!!context) {
        _sp = spfi().using(SPFx(context)).using(Telemetry()).using(PnPLogging(LogLevel.Warning));
    }
    return _sp;
}