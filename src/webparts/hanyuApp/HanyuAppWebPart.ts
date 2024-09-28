import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';
import { getSP } from '../../pnpjsConfig';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '../../router';
import HanyuApp from './app.vue'

import styles from './HanyuAppWebPart.module.scss';
import * as strings from 'HanyuAppWebPartStrings';
// import '../hanyuApp/components/ShippingRecordPage/CustomStyles.css'; // Import the custom CSS
import 'element-plus/dist/index.css';
import ElementPlus from 'element-plus';
export interface IHanyuAppWebPartProps {
  description: string;
}

export default class HanyuAppWebPart extends BaseClientSideWebPart<IHanyuAppWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    console.log(this._isDarkTheme, this._environmentMessage);
    this.domElement.innerHTML = `<div class="${styles.hanyuApp}" id="app-${this.context.instanceId}"></div>`

    const pinia = createPinia();
    const app = createApp(HanyuApp);
    app.use(pinia);
    app.use(ElementPlus);
    app.use(router);
    app.mount(`#app-${this.context.instanceId}`);
  }
  private checkAndAddQueryString(): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('env') || urlParams.get('env') !== 'WebView') {
      urlParams.set('env', 'WebView');
      window.location.search = urlParams.toString();
    }
  }
  protected onInit(): Promise<void> {
    getSP(this.context);
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    }).then(_ => {
      this.checkAndAddQueryString();
    });
  }




  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
