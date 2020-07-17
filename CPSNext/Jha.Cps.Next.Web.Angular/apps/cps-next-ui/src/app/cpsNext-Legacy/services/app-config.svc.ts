/**
 * Created by Chris Reed on 2/15/2017.
 */

import {Injectable} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';

import {VaultService} from '@services/vault.svc';
import {HelpersService} from '@services/helpers.svc';
import {environment} from '../../../environments/environment';

import * as _ from 'lodash';

@Injectable()
export class AppConfigService {
    protected readonly CLASSNAME = 'AppConfigService';

    public readonly CFG: any = environment;
    public pageCfg: any = {};

    private readonly _pageCfgPrefix: string = 'p.';

    constructor(private _helpers: HelpersService,
                private _vault: VaultService,
                private _router: Router) {
        this.clearPageConfig();

        this._router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (event.url.indexOf('?') >= 0) {
                    let url = this.consumeQueryStringParams(decodeURIComponent(event.url));
                    this._router.navigateByUrl(url).then( res => {
                        if(!res) {
                            this._router.navigate(['/error']);
                        }
                    });
                }
            }
        });
    }

    public getConfig(key: string): any {
        let pageKey = this._getPageKey();
        if (!key) {
            // $L.warn(`${this.CLASSNAME} > getConfig > Invalid Key: (${key})`);
            return null;
        }

        let vaultVal = this._vault.get(key);

        if (vaultVal)
            return vaultVal;

        let cfg: any = this.CFG;
        let keys = key.split('.');

        for (let k of keys) {
            if (cfg[k])
                cfg = cfg[k];
            else
                return null;
        }

        return cfg;
    }

    public setConfig(key: string, value: any) {
        if (!key || value === null || value === undefined) {
            // $L.warn(`${this.CLASSNAME} > setConfig > Invalid Data: (${key}) (${value})`);
            return false;
        }

        this._vault.set(key, value);
    }

    public clearConfig(key: string) {
        if (!key) {
            // $L.warn(`${this.CLASSNAME} > clearConfig > Invalid Key: (${key})`);
            return false;
        }

        this._vault.remove(key);
    }

    public setPageConfig(key: string, value: any) {
        // $L.info(`${this.CLASSNAME} > setPageConfig > pageCfg`, this.pageCfg);

        if (!key) {
            // $L.warn(`${this.CLASSNAME} > setPageConfig > Invalid Key: (${key})`);
            return;
        }

        if (value === null || value === undefined) {
            // $L.warn(`${this.CLASSNAME} > setPageConfig > Invalid Data: (${key}) (${value})`);
            return;
        }

        let pageKey = this._getPageKey();

        if (!this.pageCfg || this.pageCfg.pageKey !== pageKey) {
            this.clearPageConfig();
        }

        key = this._encodePageConfigKey(key);

        this.pageCfg[key] = value;
    }

    public getPageConfig(key: string): any {
        // $L.info(`${this.CLASSNAME} > getPageConfig > pageCfg`, this.pageCfg);

        if (!key) {
            // $L.warn(`${this.CLASSNAME} > getPageConfig > Invalid Key: (${key})`);
            return null;
        }

        let pageKey = this._getPageKey();

        if (!this.pageCfg || this.pageCfg.pageKey !== pageKey) {
            this.clearPageConfig();
            return null;
        }

        key = this._encodePageConfigKey(key);

        try {
            return this.pageCfg[key];
        }
        catch (err) {
            return null;
        }
    }

    public getPageConfigs(): any[] {
        // $L.info(`${this.CLASSNAME} > getPageConfigs > pageCfg`, this.pageCfg);

        let keys: any[] = [];
        let pageKey = this._getPageKey();

        if (!this.pageCfg || this.pageCfg.pageKey !== pageKey) {
            this.clearPageConfig();
            return keys;
        }

        for (let attr in this.pageCfg) {
            try {
                if (typeof attr !== 'string' || attr === 'pageKey')
                    continue;

                keys.push([attr, this.pageCfg[attr]]);
            }
            catch (err) {
            }
        }

        return keys;
    }

    public clearPageConfig(key?: string) {
        let pageKey = this._getPageKey();

        // If no key specified, or if cfg is for a different page: Reset.
        if (!key || !this.pageCfg || this.pageCfg.pageKey !== pageKey) {
            this.pageCfg = <any>{
                pageKey: pageKey
            };
            return;
        }

        try {
            if (this.pageCfg.hasOwnProperty(key))
                delete this.pageCfg[key];
        }
        catch (error) {
        }
    }

    public getQueryString(includePageConfig = true): string {
        let pageKey = this._getPageKey();

        let url = document.location.href;
        let sParams: string = '';
        let pkParams: string = '';

        if (url.indexOf('?') >= 0)
            url = url.substr(0, url.indexOf('?'));

        if (url[url.length - 1] !== '?')
            url += '?';

        // $L.debug(`${this.CLASSNAME} > getQueryString > url: ${url}`);

        // Current Data Source
        sParams += `DATASOURCE=${this.getConfig('DATASOURCE') || this.getConfig('defaultDataSource')}`;

        // Current Data View
        sParams += `&DATAVIEW=${this.getConfig('DATAVIEW') || this.getConfig('defaultDataView')}`;

        // Page Configs
        if (includePageConfig) {
            for (let pc of this.getPageConfigs()) {
                if (pc.length !== 2)
                    continue;

                if (sParams)
                    sParams += '&';

                sParams += `${this._pageCfgPrefix}${this._encodePageConfigKey(pc[0])}=${pc[1]}`;
            }
        }

        return url + sParams;
    }

    public consumeQueryStringParams(url: string = ''): string {
        if (!url || url.indexOf('?') < 0) // No params to parse
            return url;

        // $L.debug(`${this.CLASSNAME} > consumeQueryStringParams > url: ${url}`);

        let sParams = url.substr(url.indexOf('?') + 1, url.length - 1);

        // params
        let pAr = sParams.split('&');
        let kvp: any[];

        let key: string,
            value: any;

        for (let p of pAr) {
            kvp = p.split('=');

            if (!kvp || kvp.length !== 2 || !kvp[0] || !kvp[1]) {
                // $L.warn(`${this.CLASSNAME} > consumeQueryStringParams > Invalid Param: (${p})`);
                continue;
            }

            key = kvp[0];
            value = kvp[1];

            if (key.toLowerCase)
                key = key.toLowerCase();

            // If is Page Config
            if (_.startsWith(key, this._pageCfgPrefix))
                this.setPageConfig(key, value);
            else
                this.setConfig(key, value);

            url = url.replace(p, '');
        }

        while (url.indexOf('&&') >= 0) {
            url = url.replace('&&', '');
        }

        url = _.trimEnd(url, '&?');

        return url;
    }

    private _getPageKey() {
        let route = this._router.url;

        if (!route || route === '/') {
            let url = document.location.href;
            url = url.replace('http://', '').replace('https://', '');

            if (url.indexOf('?') >= 0)
                url = url.substr(0, url.indexOf('?'));

            route = url.substring(url.indexOf('/'), url.length);
        }

        if (route.indexOf('?') >= 0)
            route = this._router.url.substr(0, this._router.url.indexOf('?'));

        route = this._helpers.strings.replaceAll(route, '/', '');

        return route;
    }

    private _encodePageConfigKey(key: string) {
        if (!key) return key;

        if (key.toLowerCase)
            key = key.toLowerCase();

        if (_.startsWith(key, this._pageCfgPrefix) && key.replace)
            key = key.replace(this._pageCfgPrefix, '');

        if (key.indexOf('.') >= 0)
            key = this._helpers.strings.replaceAll(key, '.', '~');

        return key;
    }

    private _decodePageConfigKey(key: string) {
        if (!key) return key;

        if (key.toLowerCase)
            key = key.toLowerCase();

        if (key.indexOf('.') >= 0)
            key = this._helpers.strings.replaceAll(key, '~', '.');

        return this._pageCfgPrefix + key;
    }
}

